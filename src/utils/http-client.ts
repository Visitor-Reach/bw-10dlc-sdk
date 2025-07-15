import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { BandwidthCredentials, TokenResponse, TokenData, EnhancedError } from '../types';
import { parseXmlResponse, serializeBrandToXml, serializeCampaignToXml, serializeCampaignAssignmentToXml } from './xml-parser';

export class HttpClient {
  private client: AxiosInstance;
  private authClient: AxiosInstance;
  private tokenData: TokenData | null = null;
  private tokenPromise: Promise<TokenData> | null = null;

  constructor(
    private credentials: BandwidthCredentials,
    baseURL: string = 'https://dashboard.bandwidth.com/api/v1',
    private authURL: string = 'https://id.bandwidth.com/api/v1/oauth2/token',
    timeout: number = 30000
  ) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml',
      },
    });

    this.authClient = axios.create({
      timeout,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: credentials.username,
        password: credentials.password,
      },
    });

    this.setupInterceptors();
  }

  private async getAccessToken(): Promise<string> {
    // If we're already fetching a token, wait for that promise
    if (this.tokenPromise) {
      const tokenData = await this.tokenPromise;
      return tokenData.accessToken;
    }

    // Check if we have a valid token
    if (this.tokenData && this.tokenData.expiresAt > new Date()) {
      return this.tokenData.accessToken;
    }

    // Fetch a new token
    this.tokenPromise = this.fetchNewToken();
    try {
      const tokenData = await this.tokenPromise;
      this.tokenData = tokenData;
      return tokenData.accessToken;
    } finally {
      this.tokenPromise = null;
    }
  }

  private async fetchNewToken(): Promise<TokenData> {
    const response = await this.authClient.post<TokenResponse>(
      this.authURL,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const expiresAt = new Date();
    // Subtract 60 seconds from expiration to refresh before it actually expires
    expiresAt.setSeconds(expiresAt.getSeconds() + response.data.expires_in - 60);

    return {
      accessToken: response.data.access_token,
      expiresAt,
    };
  }

  private setupInterceptors(): void {
    // Request interceptor to add access token and account ID
    this.client.interceptors.request.use(
      async (config) => {
        // Get access token
        const accessToken = await this.getAccessToken();
        config.headers.Authorization = `Bearer ${accessToken}`;

        // Add account ID to URL if not already present
        if (!config.url?.includes('accounts/')) {
          config.url = `/accounts/${this.credentials.accountId}${config.url}`;
        }
        
        // Serialize data to XML for POST/PUT requests
        if ((config.method === 'post' || config.method === 'put') && config.data && typeof config.data === 'object') {
          if (config.url?.includes('/brands')) {
            config.data = serializeBrandToXml(config.data);
          } else if (config.url?.includes('/campaigns') && !config.url?.includes('assignmentRequests')) {
            config.data = serializeCampaignToXml(config.data);
          } else if (config.url?.includes('/assignmentRequests')) {
            config.data = serializeCampaignAssignmentToXml(config.data);
          }
        }
        
        // Debug logging
        console.log('API Request:', {
          method: config.method?.toUpperCase(),
          url: `${config.baseURL}${config.url}`,
          headers: config.headers,
          data: config.data
        });
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and XML parsing
    this.client.interceptors.response.use(
      async (response) => {
        // Check if response is XML and parse it
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('xml') || (typeof response.data === 'string' && response.data.trim().startsWith('<?xml'))) {
          try {
            response.data = await parseXmlResponse(response.data);
          } catch (error) {
            console.warn('Failed to parse XML response:', error);
          }
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // If we get a 401, try to refresh the token once
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Clear the current token to force a refresh
          this.tokenData = null;
          
          const accessToken = await this.getAccessToken();
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return this.client(originalRequest);
        }

        if (error.response) {
          const errorMessage = error.response.data?.error?.message || 
                               error.response.data?.message || 
                               error.response.statusText ||
                               error.message;
          const errorCode = error.response.data?.error?.code || error.response.status;
          
          const enhancedError = new Error(`Bandwidth API Error: ${errorMessage}`) as EnhancedError;
          enhancedError.code = errorCode;
          enhancedError.response = error.response;
          enhancedError.config = error.config;
          
          // Log additional debug info for 406 errors
          if (error.response.status === 406) {
            console.error('406 Error Details:', {
              url: error.config.url,
              method: error.config.method,
              headers: error.config.headers,
              data: error.config.data
            });
          }
          
          throw enhancedError;
        }
        throw error;
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}
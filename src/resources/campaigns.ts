import { HttpClient } from '../utils/http-client';
import { Campaign, XmlCampaignsResponse, XmlCampaignResponse } from '../types';
import { transformCampaignFromXml } from '../utils/xml-parser';

export class CampaignsResource {
  constructor(private httpClient: HttpClient) {}

  async list(brandId?: string): Promise<Campaign[]> {
    let url = '/campaignManagement/10dlc/campaigns';
    if (brandId) {
      url += `?brandId=${brandId}`;
    }
    const response = await this.httpClient.get<XmlCampaignsResponse>(url);
    
    // Debug logging
    console.log('Campaigns API Response:', JSON.stringify(response, null, 2));
    
    // Handle XML response structure: <Campaigns><Campaign>...
    if (response?.campaigns?.campaign) {
      const campaigns = response.campaigns.campaign;
      // Always return an array, even for single items
      const campaignArray = Array.isArray(campaigns) ? campaigns : [campaigns];
      return campaignArray.map(transformCampaignFromXml);
    }
    
    return [];
  }

  async get(campaignId: string): Promise<Campaign> {
    const response = await this.httpClient.get<XmlCampaignResponse>(`/campaignManagement/10dlc/campaigns/${campaignId}`);
    
    // Handle XML response structure and transform to proper object
    // API returns either direct campaign or wrapped in campaignresponse
    const campaignData = response?.campaignresponse?.campaign || response?.campaign;
    if (campaignData) {
      return transformCampaignFromXml(campaignData);
    }
    
    throw new Error('Campaign not found');
  }

  async create(campaign: Omit<Campaign, 'campaignId' | 'accountId' | 'status' | 'createDate'>): Promise<Campaign> {
    const response = await this.httpClient.post<XmlCampaignResponse>('/campaignManagement/10dlc/campaigns', campaign);
    
    // Handle XML response structure and transform to proper object
    const campaignData = response?.campaignresponse?.campaign || response?.campaign;
    if (campaignData) {
      return transformCampaignFromXml(campaignData);
    }
    
    throw new Error('Failed to create campaign');
  }

  async update(campaignId: string, campaign: Partial<Campaign>): Promise<Campaign> {
    const response = await this.httpClient.put<XmlCampaignResponse>(`/campaignManagement/10dlc/campaigns/${campaignId}`, campaign);
    
    // Handle XML response structure and transform to proper object
    const campaignData = response?.campaignresponse?.campaign || response?.campaign;
    if (campaignData) {
      return transformCampaignFromXml(campaignData);
    }
    
    throw new Error('Failed to update campaign');
  }

  async delete(campaignId: string): Promise<void> {
    await this.httpClient.delete<void>(`/campaignManagement/10dlc/campaigns/${campaignId}`);
  }

  async importTcr(campaignId: string, tcrCampaignId: string): Promise<Campaign> {
    return await this.httpClient.post<Campaign>(`/campaignManagement/10dlc/campaigns/${campaignId}/tcr`, {
      tcrCampaignId
    });
  }
}
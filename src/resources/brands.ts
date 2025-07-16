import { HttpClient } from '../utils/http-client';
import { Brand, XmlBrandsResponse, XmlBrandResponse } from '../types';
import { transformBrandFromXml } from '../utils/xml-parser';

export class BrandsResource {
  constructor(private httpClient: HttpClient) {}

  async list(): Promise<Brand[]> {
    const response = await this.httpClient.get<XmlBrandsResponse>('/campaignManagement/10dlc/brands/details?type=none');
    
    
    // Handle XML response structure: <Brands><Brand>...
    if (response?.brands?.brand) {
      const brands = response.brands.brand;
      // Always return an array, even for single items
      const brandArray = Array.isArray(brands) ? brands : [brands];
      return brandArray.map(transformBrandFromXml);
    }
    
    return [];
  }

  async get(brandId: string): Promise<Brand> {
    const response = await this.httpClient.get<XmlBrandResponse>(`/campaignManagement/10dlc/brands/${brandId}`);
    
    // Handle XML response structure and transform to proper object
    if (response?.brand) {
      return transformBrandFromXml(response.brand);
    }
    
    throw new Error('Brand not found');
  }

  async create(brand: Omit<Brand, 'brandId' | 'accountId' | 'identityStatus' | 'tcpStatus' | 'vettingScore' | 'vettingProvider' | 'vettingDate' | 'createDate'>): Promise<Brand> {
    const response = await this.httpClient.post<XmlBrandResponse>('/campaignManagement/10dlc/brands', brand);
    
    // Handle XML response structure and transform to proper object
    if (response?.brand) {
      return transformBrandFromXml(response.brand);
    }
    
    throw new Error('Failed to create brand');
  }

  async update(brandId: string, brand: Partial<Brand>): Promise<Brand> {
    const response = await this.httpClient.put<XmlBrandResponse>(`/campaignManagement/10dlc/brands/${brandId}`, brand);
    
    // Handle XML response structure and transform to proper object
    if (response?.brand) {
      return transformBrandFromXml(response.brand);
    }
    
    throw new Error('Failed to update brand');
  }

  async delete(brandId: string): Promise<void> {
    await this.httpClient.delete<void>(`/campaignManagement/10dlc/brands/${brandId}`);
  }

  async importTcr(brandId: string): Promise<Brand> {
    return await this.httpClient.post<Brand>(`/campaignManagement/10dlc/brands/${brandId}/tcr`);
  }

  async vet(brandId: string, vettingProvider?: string): Promise<Brand> {
    const data = vettingProvider ? { vettingProvider } : {};
    return await this.httpClient.post<Brand>(`/campaignManagement/10dlc/brands/${brandId}/vet`, data);
  }
}
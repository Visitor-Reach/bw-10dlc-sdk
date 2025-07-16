import { BrandsResource } from '../resources/brands';
import { HttpClient } from '../utils/http-client';
import { Brand, BandwidthCredentials } from '../types';

jest.mock('../utils/http-client');
jest.mock('../utils/xml-parser', () => ({
  transformBrandFromXml: jest.fn((mockBrand) => ({
    brandId: mockBrand.brandId?.[0] || mockBrand.brandid,
    displayName: mockBrand.displayName?.[0] || mockBrand.displayname,
    companyName: mockBrand.companyName?.[0] || mockBrand.companyname,
    ein: mockBrand.ein?.[0],
    phone: mockBrand.phone?.[0],
    street: mockBrand.street?.[0],
    city: mockBrand.city?.[0],
    state: mockBrand.state?.[0],
    postalCode: mockBrand.postalCode?.[0] || mockBrand.postalcode,
    country: mockBrand.country?.[0],
    email: mockBrand.email?.[0],
    entityType: mockBrand.entityType?.[0] || mockBrand.entitytype,
    brandRelationship: mockBrand.brandRelationship?.[0] || mockBrand.brandrelationship,
    vertical: mockBrand.vertical?.[0],
    accountId: mockBrand.accountId?.[0] || mockBrand.accountid,
    identityStatus: mockBrand.identityStatus?.[0] || mockBrand.identitystatus,
    createDate: mockBrand.createDate?.[0] || mockBrand.createdate
  }))
}));

describe('BrandsResource', () => {
  let brandsResource: BrandsResource;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    const mockCredentials: BandwidthCredentials = {
      accountId: 'test-account',
      username: 'test-user',
      password: 'test-pass'
    };
    mockHttpClient = new HttpClient(mockCredentials, 'https://api.test.com') as jest.Mocked<HttpClient>;
    mockHttpClient.get = jest.fn();
    mockHttpClient.post = jest.fn();
    mockHttpClient.put = jest.fn();
    mockHttpClient.delete = jest.fn();
    
    brandsResource = new BrandsResource(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return array of brands when API returns multiple brands', async () => {
      const mockXmlResponse = {
        brands: {
          brand: [
            {
              brandId: ['brand-1'],
              displayName: ['Test Brand 1'],
              companyName: ['Test Company 1'],
              ein: ['12-3456789'],
              phone: ['+15551234567'],
              street: ['123 Test St'],
              city: ['Test City'],
              state: ['CA'],
              postalCode: ['12345'],
              country: ['US'],
              email: ['test@test.com'],
              entityType: ['PRIVATE_PROFIT'],
              brandRelationship: ['BASIC_ACCOUNT'],
              vertical: ['TECHNOLOGY']
            },
            {
              brandId: ['brand-2'],
              displayName: ['Test Brand 2'],
              companyName: ['Test Company 2'],
              ein: ['98-7654321'],
              phone: ['+15551234568'],
              street: ['456 Test Ave'],
              city: ['Test City 2'],
              state: ['NY'],
              postalCode: ['54321'],
              country: ['US'],
              email: ['test2@test.com'],
              entityType: ['PUBLIC_PROFIT'],
              brandRelationship: ['SMALL_ACCOUNT'],
              vertical: ['FINANCE']
            }
          ]
        }
      };

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await brandsResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/campaignManagement/10dlc/brands/details?type=none');
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        brandId: 'brand-1',
        displayName: 'Test Brand 1',
        companyName: 'Test Company 1'
      });
      expect(result[1]).toMatchObject({
        brandId: 'brand-2',
        displayName: 'Test Brand 2',
        companyName: 'Test Company 2'
      });
    });

    it('should return array with single brand when API returns one brand', async () => {
      const mockXmlResponse = {
        brands: {
          brand: {
            brandId: ['brand-1'],
            displayName: ['Test Brand'],
            companyName: ['Test Company'],
            ein: ['12-3456789'],
            phone: ['+15551234567'],
            street: ['123 Test St'],
            city: ['Test City'],
            state: ['CA'],
            postalCode: ['12345'],
            country: ['US'],
            email: ['test@test.com'],
            entityType: ['PRIVATE_PROFIT'],
            brandRelationship: ['BASIC_ACCOUNT'],
            vertical: ['TECHNOLOGY']
          }
        }
      };

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await brandsResource.list();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        brandId: 'brand-1',
        displayName: 'Test Brand'
      });
    });

    it('should return empty array when no brands exist', async () => {
      const mockXmlResponse = {};

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await brandsResource.list();

      expect(result).toEqual([]);
    });
  });

  describe('get', () => {
    it('should return a brand when found', async () => {
      const mockXmlResponse = {
        brand: {
          brandId: ['brand-1'],
          displayName: ['Test Brand'],
          companyName: ['Test Company'],
          ein: ['12-3456789'],
          phone: ['+15551234567'],
          street: ['123 Test St'],
          city: ['Test City'],
          state: ['CA'],
          postalCode: ['12345'],
          country: ['US'],
          email: ['test@test.com'],
          entityType: ['PRIVATE_PROFIT'],
          brandRelationship: ['BASIC_ACCOUNT'],
          vertical: ['TECHNOLOGY']
        }
      };

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await brandsResource.get('brand-1');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/campaignManagement/10dlc/brands/brand-1');
      expect(result).toMatchObject({
        brandId: 'brand-1',
        displayName: 'Test Brand',
        companyName: 'Test Company'
      });
    });

    it('should throw error when brand not found', async () => {
      mockHttpClient.get.mockResolvedValue({});

      await expect(brandsResource.get('nonexistent')).rejects.toThrow('Brand not found');
    });
  });

  describe('create', () => {
    it('should create and return a new brand', async () => {
      const newBrand: Omit<Brand, 'brandId' | 'accountId' | 'identityStatus' | 'tcpStatus' | 'vettingScore' | 'vettingProvider' | 'vettingDate' | 'createDate'> = {
        entityType: 'PRIVATE_PROFIT',
        displayName: 'New Brand',
        companyName: 'New Company',
        ein: '12-3456789',
        phone: '+15551234567',
        street: '123 New St',
        city: 'New City',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
        email: 'new@test.com',
        brandRelationship: 'BASIC_ACCOUNT',
        vertical: 'TECHNOLOGY'
      };

      const mockXmlResponse = {
        brand: {
          brandId: ['new-brand-id'],
          displayName: ['New Brand'],
          companyName: ['New Company'],
          ein: ['12-3456789'],
          phone: ['+15551234567'],
          street: ['123 New St'],
          city: ['New City'],
          state: ['CA'],
          postalCode: ['12345'],
          country: ['US'],
          email: ['new@test.com'],
          entityType: ['PRIVATE_PROFIT'],
          brandRelationship: ['BASIC_ACCOUNT'],
          vertical: ['TECHNOLOGY'],
          accountId: ['acc-123'],
          identityStatus: ['SELF_DECLARED'],
          createDate: ['2023-01-01T00:00:00Z']
        }
      };

      mockHttpClient.post.mockResolvedValue(mockXmlResponse);

      const result = await brandsResource.create(newBrand);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/campaignManagement/10dlc/brands', newBrand);
      expect(result).toMatchObject({
        brandId: 'new-brand-id',
        displayName: 'New Brand',
        companyName: 'New Company',
        accountId: 'acc-123'
      });
    });

    it('should throw error when creation fails', async () => {
      const newBrand: Omit<Brand, 'brandId' | 'accountId' | 'identityStatus' | 'tcpStatus' | 'vettingScore' | 'vettingProvider' | 'vettingDate' | 'createDate'> = {
        entityType: 'PRIVATE_PROFIT',
        displayName: 'New Brand',
        companyName: 'New Company',
        ein: '12-3456789',
        phone: '+15551234567',
        street: '123 New St',
        city: 'New City',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
        email: 'new@test.com',
        brandRelationship: 'BASIC_ACCOUNT',
        vertical: 'TECHNOLOGY'
      };

      mockHttpClient.post.mockResolvedValue({});

      await expect(brandsResource.create(newBrand)).rejects.toThrow('Failed to create brand');
    });
  });
});
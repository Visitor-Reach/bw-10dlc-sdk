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

  describe('update', () => {
    it('should update and return the updated brand', async () => {
      const updateData: Partial<Brand> = {
        displayName: 'Updated Brand Name',
        phone: '+15559876543'
      };

      const mockXmlResponse = {
        brand: {
          brandId: ['brand-1'],
          displayName: ['Updated Brand Name'],
          companyName: ['Test Company'],
          phone: ['+15559876543'],
          ein: ['12-3456789'],
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

      mockHttpClient.put.mockResolvedValue(mockXmlResponse);

      const result = await brandsResource.update('brand-1', updateData);

      expect(mockHttpClient.put).toHaveBeenCalledWith('/campaignManagement/10dlc/brands/brand-1', updateData);
      expect(result).toMatchObject({
        brandId: 'brand-1',
        displayName: 'Updated Brand Name',
        phone: '+15559876543'
      });
    });

    it('should throw error when update fails', async () => {
      mockHttpClient.put.mockResolvedValue({});

      await expect(brandsResource.update('brand-1', {})).rejects.toThrow('Failed to update brand');
    });
  });

  describe('delete', () => {
    it('should delete a brand successfully', async () => {
      mockHttpClient.delete.mockResolvedValue(undefined);

      await brandsResource.delete('brand-1');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/campaignManagement/10dlc/brands/brand-1');
    });
  });

  describe('importTcr', () => {
    it('should import brand from TCR', async () => {
      const mockBrand: Brand = {
        brandId: 'brand-1',
        displayName: 'Imported Brand',
        companyName: 'Imported Company',
        entityType: 'PRIVATE_PROFIT',
        ein: '12-3456789',
        phone: '+15551234567',
        street: '123 Import St',
        city: 'Import City',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
        email: 'import@test.com',
        brandRelationship: 'BASIC_ACCOUNT',
        vertical: 'TECHNOLOGY',
        accountId: 'acc-123',
        identityStatus: 'VERIFIED'
      };

      mockHttpClient.post.mockResolvedValue(mockBrand);

      const result = await brandsResource.importTcr('brand-1');

      expect(mockHttpClient.post).toHaveBeenCalledWith('/campaignManagement/10dlc/brands/brand-1/tcr');
      expect(result).toEqual(mockBrand);
    });
  });

  describe('vet', () => {
    it('should vet a brand with default parameters', async () => {
      const mockBrand: Brand = {
        brandId: 'brand-1',
        displayName: 'Test Brand',
        companyName: 'Test Company',
        entityType: 'PRIVATE_PROFIT',
        ein: '12-3456789',
        phone: '+15551234567',
        street: '123 Test St',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
        email: 'test@test.com',
        brandRelationship: 'BASIC_ACCOUNT',
        vertical: 'TECHNOLOGY',
        accountId: 'acc-123',
        identityStatus: 'VERIFIED',
        vettingProvider: 'AEGIS',
        vettingScore: 95
      };

      mockHttpClient.post.mockResolvedValue(mockBrand);

      const result = await brandsResource.vet('brand-1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/campaignManagement/10dlc/brands/brand-1/vetting',
        '<BrandVetting><EvpId>AEGIS</EvpId><VettingClass>STANDARD</VettingClass></BrandVetting>'
      );
      expect(result).toEqual(mockBrand);
    });

    it('should vet a brand with custom parameters', async () => {
      const mockBrand: Brand = {
        brandId: 'brand-1',
        displayName: 'Test Brand',
        companyName: 'Test Company',
        entityType: 'PRIVATE_PROFIT',
        ein: '12-3456789',
        phone: '+15551234567',
        street: '123 Test St',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
        email: 'test@test.com',
        brandRelationship: 'BASIC_ACCOUNT',
        vertical: 'TECHNOLOGY',
        accountId: 'acc-123',
        identityStatus: 'VERIFIED',
        vettingProvider: 'WMC',
        vettingScore: 87
      };

      mockHttpClient.post.mockResolvedValue(mockBrand);

      const result = await brandsResource.vet('brand-1', 'WMC', 'PREMIUM');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/campaignManagement/10dlc/brands/brand-1/vetting',
        '<BrandVetting><EvpId>WMC</EvpId><VettingClass>PREMIUM</VettingClass></BrandVetting>'
      );
      expect(result).toEqual(mockBrand);
    });

    it('should handle special characters in vetting parameters', async () => {
      const mockBrand: Brand = {
        brandId: 'brand-1',
        displayName: 'Test Brand',
        companyName: 'Test Company',
        entityType: 'PRIVATE_PROFIT',
        ein: '12-3456789',
        phone: '+15551234567',
        street: '123 Test St',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
        email: 'test@test.com',
        brandRelationship: 'BASIC_ACCOUNT',
        vertical: 'TECHNOLOGY',
        accountId: 'acc-123',
        identityStatus: 'VERIFIED',
        vettingProvider: 'TEST_PROVIDER',
        vettingScore: 90
      };

      mockHttpClient.post.mockResolvedValue(mockBrand);

      const result = await brandsResource.vet('brand-1', 'TEST_PROVIDER', 'CUSTOM_CLASS');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/campaignManagement/10dlc/brands/brand-1/vetting',
        '<BrandVetting><EvpId>TEST_PROVIDER</EvpId><VettingClass>CUSTOM_CLASS</VettingClass></BrandVetting>'
      );
      expect(result).toEqual(mockBrand);
    });
  });
});
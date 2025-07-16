import { CampaignsResource } from '../resources/campaigns';
import { HttpClient } from '../utils/http-client';
import { Campaign, BandwidthCredentials } from '../types';

jest.mock('../utils/http-client');
jest.mock('../utils/xml-parser', () => ({
  transformCampaignFromXml: jest.fn((mockCampaign) => ({
    campaignId: mockCampaign.campaignId?.[0] || mockCampaign.campaignid,
    brandId: mockCampaign.brandId?.[0] || mockCampaign.brandid,
    usecase: mockCampaign.usecase?.[0],
    description: mockCampaign.description?.[0],
    embeddedLink: mockCampaign.embeddedLink?.[0] === 'true' || mockCampaign.embeddedlink?.[0] === 'true',
    embeddedPhone: mockCampaign.embeddedPhone?.[0] === 'true' || mockCampaign.embeddedphone?.[0] === 'true',
    subscriberOptin: mockCampaign.subscriberOptin?.[0] === 'true' || mockCampaign.subscriberoptin?.[0] === 'true',
    subscriberOptout: mockCampaign.subscriberOptout?.[0] === 'true' || mockCampaign.subscriberoptout?.[0] === 'true',
    subscriberHelp: mockCampaign.subscriberHelp?.[0] === 'true' || mockCampaign.subscriberhelp?.[0] === 'true',
    sample1: mockCampaign.sample1?.[0],
    status: mockCampaign.status?.[0],
    accountId: mockCampaign.accountId?.[0] || mockCampaign.accountid,
    createDate: mockCampaign.createDate?.[0] || mockCampaign.createdate
  }))
}));

describe('CampaignsResource', () => {
  let campaignsResource: CampaignsResource;
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
    
    campaignsResource = new CampaignsResource(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return array of campaigns when API returns multiple campaigns', async () => {
      const mockXmlResponse = {
        campaigns: {
          campaign: [
            {
              campaignId: ['campaign-1'],
              brandId: ['brand-1'],
              usecase: ['CUSTOMER_CARE'],
              description: ['Customer support messages'],
              embeddedLink: ['false'],
              embeddedPhone: ['false'],
              subscriberOptin: ['true'],
              subscriberOptout: ['true'],
              subscriberHelp: ['true'],
              sample1: ['Hello, this is a test message'],
              status: ['ACTIVE']
            },
            {
              campaignId: ['campaign-2'],
              brandId: ['brand-1'],
              usecase: ['MARKETING'],
              description: ['Marketing promotions'],
              embeddedLink: ['true'],
              embeddedPhone: ['false'],
              subscriberOptin: ['true'],
              subscriberOptout: ['true'],
              subscriberHelp: ['true'],
              sample1: ['Check out our latest offers!'],
              status: ['ACTIVE']
            }
          ]
        }
      };

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await campaignsResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/campaignManagement/10dlc/campaigns');
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        campaignId: 'campaign-1',
        brandId: 'brand-1',
        usecase: 'CUSTOMER_CARE'
      });
      expect(result[1]).toMatchObject({
        campaignId: 'campaign-2',
        brandId: 'brand-1',
        usecase: 'MARKETING'
      });
    });

    it('should return campaigns filtered by brandId when provided', async () => {
      const mockXmlResponse = {
        campaigns: {
          campaign: {
            campaignId: ['campaign-1'],
            brandId: ['brand-1'],
            usecase: ['CUSTOMER_CARE'],
            description: ['Customer support messages'],
            embeddedLink: ['false'],
            embeddedPhone: ['false'],
            subscriberOptin: ['true'],
            subscriberOptout: ['true'],
            subscriberHelp: ['true'],
            sample1: ['Hello, this is a test message']
          }
        }
      };

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await campaignsResource.list({ brandId: 'brand-1' });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/campaignManagement/10dlc/campaigns?brandId=brand-1');
      expect(result).toHaveLength(1);
      expect(result[0].brandId).toBe('brand-1');
    });

    it('should return array with single campaign when API returns one campaign', async () => {
      const mockXmlResponse = {
        campaigns: {
          campaign: {
            campaignId: ['campaign-1'],
            brandId: ['brand-1'],
            usecase: ['CUSTOMER_CARE'],
            description: ['Customer support messages'],
            embeddedLink: ['false'],
            embeddedPhone: ['false'],
            subscriberOptin: ['true'],
            subscriberOptout: ['true'],
            subscriberHelp: ['true'],
            sample1: ['Hello, this is a test message']
          }
        }
      };

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await campaignsResource.list();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        campaignId: 'campaign-1',
        brandId: 'brand-1',
        usecase: 'CUSTOMER_CARE'
      });
    });

    it('should return empty array when no campaigns exist', async () => {
      const mockXmlResponse = {};

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await campaignsResource.list();

      expect(result).toEqual([]);
    });

    it('should support pagination when page and size are provided', async () => {
      const mockXmlResponse = {
        campaigns: {
          campaign: {
            campaignId: ['campaign-1'],
            brandId: ['brand-1'],
            usecase: ['CUSTOMER_CARE'],
            description: ['Customer support messages'],
            embeddedLink: ['false'],
            embeddedPhone: ['false'],
            subscriberOptin: ['true'],
            subscriberOptout: ['true'],
            subscriberHelp: ['true'],
            sample1: ['Hello, this is a test message']
          }
        }
      };

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await campaignsResource.list({ page: 0, size: 10 });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/campaignManagement/10dlc/campaigns?page=0&size=10');
      expect(result).toHaveLength(1);
    });

    it('should support pagination with brandId filter', async () => {
      const mockXmlResponse = {
        campaigns: {
          campaign: {
            campaignId: ['campaign-1'],
            brandId: ['brand-1'],
            usecase: ['CUSTOMER_CARE'],
            description: ['Customer support messages'],
            embeddedLink: ['false'],
            embeddedPhone: ['false'],
            subscriberOptin: ['true'],
            subscriberOptout: ['true'],
            subscriberHelp: ['true'],
            sample1: ['Hello, this is a test message']
          }
        }
      };

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await campaignsResource.list({ brandId: 'brand-1', page: 1, size: 5 });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/campaignManagement/10dlc/campaigns?brandId=brand-1&page=1&size=5');
      expect(result).toHaveLength(1);
    });

    it('should not add pagination params when only page is provided', async () => {
      const mockXmlResponse = {
        campaigns: {
          campaign: {
            campaignId: ['campaign-1'],
            brandId: ['brand-1'],
            usecase: ['CUSTOMER_CARE'],
            description: ['Customer support messages'],
            embeddedLink: ['false'],
            embeddedPhone: ['false'],
            subscriberOptin: ['true'],
            subscriberOptout: ['true'],
            subscriberHelp: ['true'],
            sample1: ['Hello, this is a test message']
          }
        }
      };

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await campaignsResource.list({ page: 0 });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/campaignManagement/10dlc/campaigns');
      expect(result).toHaveLength(1);
    });

    it('should not add pagination params when only size is provided', async () => {
      const mockXmlResponse = {
        campaigns: {
          campaign: {
            campaignId: ['campaign-1'],
            brandId: ['brand-1'],
            usecase: ['CUSTOMER_CARE'],
            description: ['Customer support messages'],
            embeddedLink: ['false'],
            embeddedPhone: ['false'],
            subscriberOptin: ['true'],
            subscriberOptout: ['true'],
            subscriberHelp: ['true'],
            sample1: ['Hello, this is a test message']
          }
        }
      };

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await campaignsResource.list({ size: 10 });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/campaignManagement/10dlc/campaigns');
      expect(result).toHaveLength(1);
    });
  });

  describe('get', () => {
    it('should return a campaign when found (direct campaign response)', async () => {
      const mockXmlResponse = {
        campaign: {
          campaignId: ['campaign-1'],
          brandId: ['brand-1'],
          usecase: ['CUSTOMER_CARE'],
          description: ['Customer support messages'],
          embeddedLink: ['false'],
          embeddedPhone: ['false'],
          subscriberOptin: ['true'],
          subscriberOptout: ['true'],
          subscriberHelp: ['true'],
          sample1: ['Hello, this is a test message'],
          status: ['ACTIVE']
        }
      };

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await campaignsResource.get('campaign-1');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/campaignManagement/10dlc/campaigns/campaign-1');
      expect(result).toMatchObject({
        campaignId: 'campaign-1',
        brandId: 'brand-1',
        usecase: 'CUSTOMER_CARE'
      });
    });

    it('should return a campaign when found (wrapped in campaignresponse)', async () => {
      const mockXmlResponse = {
        campaignresponse: {
          campaign: {
            campaignId: ['campaign-1'],
            brandId: ['brand-1'],
            usecase: ['CUSTOMER_CARE'],
            description: ['Customer support messages'],
            embeddedLink: ['false'],
            embeddedPhone: ['false'],
            subscriberOptin: ['true'],
            subscriberOptout: ['true'],
            subscriberHelp: ['true'],
            sample1: ['Hello, this is a test message'],
            status: ['ACTIVE']
          }
        }
      };

      mockHttpClient.get.mockResolvedValue(mockXmlResponse);

      const result = await campaignsResource.get('campaign-1');

      expect(result).toMatchObject({
        campaignId: 'campaign-1',
        brandId: 'brand-1',
        usecase: 'CUSTOMER_CARE'
      });
    });

    it('should throw error when campaign not found', async () => {
      mockHttpClient.get.mockResolvedValue({});

      await expect(campaignsResource.get('nonexistent')).rejects.toThrow('Campaign not found');
    });
  });

  describe('create', () => {
    it('should create and return a new campaign (direct campaign response)', async () => {
      const newCampaign: Omit<Campaign, 'campaignId' | 'accountId' | 'status' | 'createDate'> = {
        brandId: 'brand-1',
        usecase: 'CUSTOMER_CARE',
        description: 'New customer support campaign',
        embeddedLink: false,
        embeddedPhone: false,
        subscriberOptin: true,
        subscriberOptout: true,
        subscriberHelp: true,
        sample1: 'Welcome to our service!'
      };

      const mockXmlResponse = {
        campaign: {
          campaignId: ['new-campaign-id'],
          brandId: ['brand-1'],
          usecase: ['CUSTOMER_CARE'],
          description: ['New customer support campaign'],
          embeddedLink: ['false'],
          embeddedPhone: ['false'],
          subscriberOptin: ['true'],
          subscriberOptout: ['true'],
          subscriberHelp: ['true'],
          sample1: ['Welcome to our service!'],
          accountId: ['acc-123'],
          status: ['ACTIVE'],
          createDate: ['2023-01-01T00:00:00Z']
        }
      };

      mockHttpClient.post.mockResolvedValue(mockXmlResponse);

      const result = await campaignsResource.create(newCampaign);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/campaignManagement/10dlc/campaigns', newCampaign);
      expect(result).toMatchObject({
        campaignId: 'new-campaign-id',
        brandId: 'brand-1',
        usecase: 'CUSTOMER_CARE',
        description: 'New customer support campaign'
      });
    });

    it('should create and return a new campaign (wrapped in campaignresponse)', async () => {
      const newCampaign: Omit<Campaign, 'campaignId' | 'accountId' | 'status' | 'createDate'> = {
        brandId: 'brand-1',
        usecase: 'MARKETING',
        description: 'New marketing campaign',
        embeddedLink: true,
        embeddedPhone: false,
        subscriberOptin: true,
        subscriberOptout: true,
        subscriberHelp: true,
        sample1: 'Check out our latest deals!'
      };

      const mockXmlResponse = {
        campaignresponse: {
          campaign: {
            campaignId: ['new-campaign-id'],
            brandId: ['brand-1'],
            usecase: ['MARKETING'],
            description: ['New marketing campaign'],
            embeddedLink: ['true'],
            embeddedPhone: ['false'],
            subscriberOptin: ['true'],
            subscriberOptout: ['true'],
            subscriberHelp: ['true'],
            sample1: ['Check out our latest deals!'],
            accountId: ['acc-123'],
            status: ['ACTIVE'],
            createDate: ['2023-01-01T00:00:00Z']
          }
        }
      };

      mockHttpClient.post.mockResolvedValue(mockXmlResponse);

      const result = await campaignsResource.create(newCampaign);

      expect(result).toMatchObject({
        campaignId: 'new-campaign-id',
        brandId: 'brand-1',
        usecase: 'MARKETING',
        description: 'New marketing campaign'
      });
    });

    it('should throw error when creation fails', async () => {
      const newCampaign: Omit<Campaign, 'campaignId' | 'accountId' | 'status' | 'createDate'> = {
        brandId: 'brand-1',
        usecase: 'CUSTOMER_CARE',
        description: 'New campaign',
        embeddedLink: false,
        embeddedPhone: false,
        subscriberOptin: true,
        subscriberOptout: true,
        subscriberHelp: true,
        sample1: 'Test message'
      };

      mockHttpClient.post.mockResolvedValue({});

      await expect(campaignsResource.create(newCampaign)).rejects.toThrow('Failed to create campaign');
    });
  });
});
export interface BandwidthCredentials {
  accountId: string;
  username: string;
  password: string;
}

export interface BandwidthClientOptions {
  credentials: BandwidthCredentials;
  baseURL?: string;
  authURL?: string;
  timeout?: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface TokenData {
  accessToken: string;
  expiresAt: Date;
}

export interface Brand {
  brandId?: string;
  accountId?: string;
  entityType: 'PRIVATE_PROFIT' | 'PUBLIC_PROFIT' | 'NON_PROFIT' | 'GOVERNMENT' | 'SOLE_PROPRIETOR';
  displayName: string;
  companyName: string;
  ein: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  email: string;
  stockSymbol?: string;
  stockExchange?: string;
  ipAddress?: string;
  website?: string;
  brandRelationship: 'BASIC_ACCOUNT' | 'SMALL_ACCOUNT' | 'MEDIUM_ACCOUNT' | 'LARGE_ACCOUNT' | 'KEY_ACCOUNT';
  vertical: string;
  altBusinessId?: string;
  altBusinessIdType?: 'NONE' | 'DUNS' | 'GIIN' | 'LEI';
  identityStatus?: 'SELF_DECLARED' | 'UNVERIFIED' | 'VERIFIED' | 'VETTED_VERIFIED';
  tcpStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  vettingScore?: number;
  vettingProvider?: string;
  vettingDate?: string;
  createDate?: string;
  cspId?: string;
  universalEin?: string;
  isMain?: boolean;
  businessContactEmail?: string;
}

export interface MnoMetadata {
  mnoId: string;
  mno: string;
  mnoSupport: boolean;
  mnoReview: boolean;
  qualify: boolean;
  minMessageSamples: number;
  requireSubscriberOptIn: boolean;
  requireSubscriberOptOut: boolean;
  requireSubscriberHelp: boolean;
  noEmbeddedLink: boolean;
  noEmbeddedPhone: boolean;
  brandDailyCap?: number;
  brandTier?: string;
  messageClass?: string;
  tpm?: number;
  tpmScope?: string;
}

export interface MnoStatus {
  mnoName: string;
  mnoId: string;
  status: string;
}

export interface Campaign {
  campaignId?: string;
  accountId?: string;
  brandId: string;
  usecase: string;
  subUsecases?: string;
  description: string;
  resellerId?: string;
  embeddedLink: boolean;
  embeddedPhone: boolean;
  affiliateMarketing?: boolean;
  numberPool?: boolean;
  ageGated?: boolean;
  directLending?: boolean;
  subscriberOptin: boolean;
  subscriberOptout: boolean;
  subscriberHelp: boolean;
  sample1: string;
  sample2?: string;
  sample3?: string;
  sample4?: string;
  sample5?: string;
  messageFlow?: string;
  helpKeywords?: string;
  helpMessage?: string;
  optinKeywords?: string;
  optinMessage?: string;
  optoutKeywords?: string;
  optoutMessage?: string;
  privacyPolicyLink?: string;
  termsAndConditionsLink?: string;
  referenceId?: string;
  autoRenewal?: boolean;
  status?: 'ACTIVE' | 'EXPIRED';
  createDate?: string;
  billedDate?: string;
  mnoMetadataList?: MnoMetadata[];
  mnoStatusList?: MnoStatus[];
  sharingStatus?: boolean;
  secondaryDcaSharingStatus?: string;
  hasSubId?: boolean;
}


export interface ListBrandsResponse {
  brands: Brand[];
}

export interface ListCampaignsResponse {
  campaigns: Campaign[];
}


export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface EnhancedError extends Error {
  code?: string | number;
  response?: unknown;
  config?: unknown;
}

// XML Response types
export interface XmlBrandsResponse {
  brands?: {
    brand: unknown | unknown[];
  };
}

export interface XmlBrandResponse {
  brand?: unknown;
}

export interface XmlCampaignsResponse {
  campaigns?: {
    campaign: unknown | unknown[];
  };
}

export interface XmlCampaignResponse {
  campaign?: unknown;
  campaignresponse?: {
    campaign?: unknown;
  };
}


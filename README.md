# Bandwidth 10DLC SDK for Node.js

A comprehensive Node.js SDK for interacting with Bandwidth's 10DLC API.

## Installation

```bash
npm install @bandwidth/10dlc-sdk
```

## Quick Start

```typescript
import { Bandwidth10DLCClient } from '@bandwidth/10dlc-sdk';

const client = new Bandwidth10DLCClient({
  credentials: {
    accountId: 'your-account-id',
    username: 'your-api-username',
    password: 'your-api-password'
  }
});
```

## Authentication

The SDK uses OAuth2 client credentials flow for authentication. Your username and password are used to obtain an access token from Bandwidth's identity service. The SDK automatically handles:

- Token acquisition on first request
- Token caching for the duration of its validity
- Automatic token refresh when expired
- Retry with new token on 401 responses

## Usage Examples

### Brand Management

```typescript
// List all brands
const brands = await client.brands.list();

// Create a new brand
const newBrand = await client.brands.create({
  entityType: 'PRIVATE_PROFIT',
  displayName: 'My Company',
  companyName: 'My Company Inc.',
  ein: '12-3456789',
  phone: '+11234567890',
  street: '123 Main St',
  city: 'Anytown',
  state: 'CA',
  postalCode: '12345',
  country: 'US',
  email: 'info@mycompany.com',
  brandRelationship: 'BASIC_ACCOUNT',
  vertical: 'TECHNOLOGY',
  website: 'https://mycompany.com'
});

// Get a specific brand
const brand = await client.brands.get('brand-id');

// Update a brand
const updatedBrand = await client.brands.update('brand-id', {
  displayName: 'Updated Company Name'
});

// Import brand from TCR
const importedBrand = await client.brands.importTcr('brand-id');

// Vet a brand
const vettedBrand = await client.brands.vet('brand-id');
```

### Campaign Management

```typescript
// List all campaigns
const campaigns = await client.campaigns.list();

// List campaigns for a specific brand
const brandCampaigns = await client.campaigns.list({ brandId: 'brand-id' });

// List campaigns with pagination (zero-based page index)
const paginatedCampaigns = await client.campaigns.list({ page: 0, size: 10 });

// List campaigns for a brand with pagination
const paginatedBrandCampaigns = await client.campaigns.list({ 
  brandId: 'brand-id', 
  page: 1, 
  size: 20 
});

// Create a new campaign
const newCampaign = await client.campaigns.create({
  brandId: 'brand-id',
  usecase: 'MARKETING',
  description: 'Marketing campaign for product launches',
  embeddedLink: false,
  embeddedPhone: false,
  subscriberOptin: true,
  subscriberOptout: true,
  subscriberHelp: true,
  sample1: 'New product launch! Check out our latest offerings.',
  sample2: 'Limited time offer: 20% off all products',
  messageFlow: 'Customers opt-in via website form'
});

// Get a specific campaign
const campaign = await client.campaigns.get('campaign-id');

// Update a campaign
const updatedCampaign = await client.campaigns.update('campaign-id', {
  description: 'Updated marketing campaign description'
});

// Import campaign from TCR
const importedCampaign = await client.campaigns.importTcr('campaign-id', 'tcr-campaign-id');
```

### Campaign Assignment

```typescript
// List all campaign assignments
const assignments = await client.campaignAssignments.list();

// List assignments for a specific campaign
const campaignAssignments = await client.campaignAssignments.list('campaign-id');

// List assignments for a specific phone number
const tnAssignments = await client.campaignAssignments.listByTn('+11234567890');

// Assign phone numbers to a campaign
await client.campaignAssignments.assign('campaign-id', [
  '+11234567890',
  '+10987654321'
]);

// Unassign phone numbers
await client.campaignAssignments.unassign([
  '+11234567890',
  '+10987654321'
]);
```

## Error Handling

The SDK provides enhanced error messages for API errors:

```typescript
try {
  const brand = await client.brands.get('invalid-id');
} catch (error) {
  console.error('Error:', error.message);
  // Error: Bandwidth API Error: Brand not found
  console.error('Error code:', error.code);
  // Error code: 404
}
```

## Configuration Options

```typescript
const client = new Bandwidth10DLCClient({
  credentials: {
    accountId: 'your-account-id',
    username: 'your-api-username',
    password: 'your-api-password'
  },
  baseURL: 'https://custom-api-url.com', // Optional: Override the default API URL (default: https://dashboard.bandwidth.com/api/v1)
  authURL: 'https://custom-auth-url.com', // Optional: Override the auth URL (default: https://id.bandwidth.com/api/v1/oauth2/token)
  timeout: 60000 // Optional: Request timeout in milliseconds (default: 30000)
});
```

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions for all API operations.

## License

MIT
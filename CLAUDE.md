# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js SDK for Bandwidth's 10DLC API (10-Digit Long Code SMS messaging service). The SDK provides a TypeScript-based client library for managing SMS messaging campaigns that comply with 10DLC regulations.

## Key Commands

```bash
# Build the project (TypeScript compilation)
npm run build

# Run linter
npm run lint

# Run tests
npm test

# Install dependencies
npm install
```

## Architecture

### Core Components

1. **Main Client** (`src/index.ts`)
   - Entry point that initializes the SDK with OAuth2 credentials
   - Manages authentication (token acquisition, caching, refresh)
   - Provides access to two resource modules: brands and campaigns

2. **Authentication Flow**
   - Uses OAuth2 client credentials flow
   - Token endpoint: `https://id.bandwidth.com/api/v1/oauth2/token`
   - Tokens are cached and automatically refreshed when expired

3. **API Communication**
   - All API responses are in XML format (not JSON)
   - Uses axios for HTTP requests with XML serialization/deserialization
   - Base API URL: `https://dashboard.bandwidth.com/api/v1`

### Resource Modules

- **Brands** (`src/resources/brands.ts`): Manage brand entities that represent businesses
- **Campaigns** (`src/resources/campaigns.ts`): Manage SMS campaigns linked to brands, supports pagination

### Type System

All API operations have corresponding TypeScript types in `src/types/`:
- `Brand`, `Campaign` - Main entity types
- `Create*`, `Update*` - Request payload types
- `*Response` - API response wrapper types

### Error Handling

The SDK enhances error messages from API failures to include:
- HTTP status code
- Response body content
- Original error message

## Development Notes

- The project uses TypeScript with strict type checking
- Compiled output goes to `/dist` directory
- ESLint is configured for TypeScript
- Jest is configured with comprehensive test coverage for brands and campaigns resources
- All API communication uses XML format via the `xml2js` library

## Pagination Support

The campaigns resource supports pagination via the `list()` method:
- Use `page` (zero-based) and `size` parameters together
- Pagination is only applied when both parameters are provided
- Can be combined with `brandId` filtering
- Without pagination parameters, all results are returned

Example:
```typescript
// Get all campaigns (no pagination)
await client.campaigns.list();

// Get first page with 10 campaigns
await client.campaigns.list({ page: 0, size: 10 });

// Get campaigns for brand with pagination
await client.campaigns.list({ brandId: 'brand-id', page: 1, size: 20 });
```
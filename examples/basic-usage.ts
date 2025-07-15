import { Bandwidth10DLCClient } from '../src';

async function main() {
  // Initialize the client
  // Note: The SDK uses OAuth2 authentication. Your username and password
  // are used to obtain an access token automatically.
  const client = new Bandwidth10DLCClient({
    credentials: {
      accountId: process.env.BANDWIDTH_ACCOUNT_ID || '',
      username: process.env.BANDWIDTH_API_USERNAME || '',
      password: process.env.BANDWIDTH_API_PASSWORD || ''
    }
  });

  try {
    // Example 1: Create a brand
    console.log('Creating a brand...');
    const brand = await client.brands.create({
      entityType: 'PRIVATE_PROFIT',
      displayName: 'Example Company',
      companyName: 'Example Company Inc.',
      ein: '12-3456789',
      phone: '+11234567890',
      street: '123 Example St',
      city: 'Example City',
      state: 'CA',
      postalCode: '12345',
      country: 'US',
      email: 'info@example.com',
      brandRelationship: 'BASIC_ACCOUNT',
      vertical: 'TECHNOLOGY',
      website: 'https://example.com'
    });
    console.log('Brand created:', brand.brandId);

    // Example 2: Create a campaign
    console.log('\nCreating a campaign...');
    const campaign = await client.campaigns.create({
      brandId: brand.brandId!,
      usecase: 'MARKETING',
      description: 'Marketing notifications for our customers',
      embeddedLink: false,
      embeddedPhone: false,
      subscriberOptin: true,
      subscriberOptout: true,
      subscriberHelp: true,
      sample1: 'Welcome to Example Company! Reply STOP to unsubscribe.',
      sample2: 'Your order has been shipped! Track it at example.com/track',
      messageFlow: 'Users opt-in through our website signup form'
    });
    console.log('Campaign created:', campaign.campaignId);

    // Example 3: Assign phone numbers to campaign
    console.log('\nAssigning phone numbers to campaign...');
    await client.campaignAssignments.assign(campaign.campaignId!, [
      '+11234567890',
      '+10987654321'
    ]);
    console.log('Phone numbers assigned successfully');

    // Example 4: List all brands
    console.log('\nListing all brands...');
    const brands = await client.brands.list();
    console.log(`Found ${brands.length} brands`);
    brands.forEach(b => {
      console.log(`- ${b.displayName} (${b.brandId})`);
    });

    // Example 5: List campaigns for the brand
    console.log('\nListing campaigns for brand...');
    const campaigns = await client.campaigns.list(brand.brandId);
    console.log(`Found ${campaigns.length} campaigns`);
    campaigns.forEach(c => {
      console.log(`- ${c.description} (${c.campaignId})`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
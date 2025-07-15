import { HttpClient } from './utils/http-client';
import { BrandsResource } from './resources/brands';
import { CampaignsResource } from './resources/campaigns';
import { CampaignAssignmentsResource } from './resources/campaign-assignments';
import { BandwidthClientOptions } from './types';

export * from './types';

export class Bandwidth10DLCClient {
  private httpClient: HttpClient;
  public brands: BrandsResource;
  public campaigns: CampaignsResource;
  public campaignAssignments: CampaignAssignmentsResource;

  constructor(options: BandwidthClientOptions) {
    this.httpClient = new HttpClient(
      options.credentials,
      options.baseURL,
      options.authURL,
      options.timeout
    );

    this.brands = new BrandsResource(this.httpClient);
    this.campaigns = new CampaignsResource(this.httpClient);
    this.campaignAssignments = new CampaignAssignmentsResource(this.httpClient);
  }
}

export default Bandwidth10DLCClient;
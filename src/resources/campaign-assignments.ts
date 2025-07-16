import { HttpClient } from '../utils/http-client';
import { CampaignAssignment, XmlAssignmentRequestsResponse } from '../types';
import { transformCampaignAssignmentFromXml } from '../utils/xml-parser';

export class CampaignAssignmentsResource {
  constructor(private httpClient: HttpClient) {}

  async list(campaignId?: string): Promise<CampaignAssignment[]> {
    let url = '/campaignManagement/10dlc/assignmentRequests';
    if (campaignId) {
      url += `?campaignId=${campaignId}`;
    }
    const response = await this.httpClient.get<XmlAssignmentRequestsResponse>(url);
    
    
    // Handle XML response structure (likely similar to other endpoints)
    if (response?.assignmentrequestsresponse?.assignmentrequests?.assignmentrequest) {
      const assignments = response.assignmentrequestsresponse.assignmentrequests.assignmentrequest;
      // Always return an array, even for single items
      const assignmentArray = Array.isArray(assignments) ? assignments : [assignments];
      return assignmentArray.map(transformCampaignAssignmentFromXml);
    }
    
    return [];
  }

  async listByTn(tn: string): Promise<CampaignAssignment[]> {
    const response = await this.httpClient.get<XmlAssignmentRequestsResponse>(
      `/campaignManagement/10dlc/assignmentRequests?tn=${tn}`
    );
    
    // Handle XML response structure - always return array
    if (response?.assignmentrequestsresponse?.assignmentrequests?.assignmentrequest) {
      const assignments = response.assignmentrequestsresponse.assignmentrequests.assignmentrequest;
      // Always return an array, even for single items
      const assignmentArray = Array.isArray(assignments) ? assignments : [assignments];
      return assignmentArray.map(transformCampaignAssignmentFromXml);
    }
    
    return [];
  }

  async assign(campaignId: string, phoneNumbers: string[]): Promise<void> {
    await this.httpClient.post('/campaignManagement/10dlc/assignmentRequests', {
      campaignId,
      tns: phoneNumbers
    });
  }

  async unassign(phoneNumbers: string[]): Promise<void> {
    await this.httpClient.delete('/campaignManagement/10dlc/assignmentRequests', {
      data: {
        tns: phoneNumbers
      }
    });
  }
}
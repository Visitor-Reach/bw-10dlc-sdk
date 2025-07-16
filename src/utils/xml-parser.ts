import { parseString } from 'xml2js';
import { Brand, Campaign, CampaignAssignment, MnoMetadata, MnoStatus } from '../types';

export async function parseXmlResponse(xmlString: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    parseString(xmlString, {
      explicitArray: false,
      ignoreAttrs: true,
      trim: true,
      normalize: true,
      normalizeTags: true,
      explicitRoot: false
    }, (err, result) => {
      if (err) {
        console.error('XML parsing error:', err);
        reject(new Error(`Failed to parse XML response: ${err}`));
      } else {
        resolve(result);
      }
    });
  });
}

export function transformBrandFromXml(xmlBrand: unknown): Brand {
  if (!xmlBrand) throw new Error('Invalid brand data');
  
  const brand = xmlBrand as Record<string, unknown>;
  return {
    brandId: brand.brandid as string,
    accountId: brand.accountid as string,
    entityType: brand.entitytype as 'PRIVATE_PROFIT' | 'PUBLIC_PROFIT' | 'NON_PROFIT' | 'GOVERNMENT' | 'SOLE_PROPRIETOR',
    displayName: brand.displayname as string,
    companyName: brand.companyname as string,
    ein: brand.ein as string,
    phone: brand.phone as string,
    street: brand.street as string,
    city: brand.city as string,
    state: brand.state as string,
    postalCode: brand.postalcode as string,
    country: brand.country as string,
    email: brand.email as string,
    website: brand.website as string,
    brandRelationship: brand.brandrelationship as 'BASIC_ACCOUNT' | 'SMALL_ACCOUNT' | 'MEDIUM_ACCOUNT' | 'LARGE_ACCOUNT' | 'KEY_ACCOUNT',
    vertical: brand.vertical as string,
    identityStatus: brand.identitystatus as 'SELF_DECLARED' | 'UNVERIFIED' | 'VERIFIED' | 'VETTED_VERIFIED' | undefined,
    cspId: brand.cspid as string,
    universalEin: brand.universalein as string,
    isMain: brand.ismain === 'true',
    businessContactEmail: brand.businesscontactemail as string
  };
}

export function transformMnoMetadataFromXml(xmlMnoMetadata: unknown): MnoMetadata {
  if (!xmlMnoMetadata) throw new Error('Invalid MNO metadata data');
  
  const mno = xmlMnoMetadata as Record<string, unknown>;
  return {
    mnoId: mno.mnoid as string,
    mno: mno.mno as string,
    mnoSupport: mno.mnosupport === 'true',
    mnoReview: mno.mnoreview === 'true',
    qualify: mno.qualify === 'true',
    minMessageSamples: parseInt(mno.minmessagesamples as string, 10),
    requireSubscriberOptIn: mno.requiresubscriberoptin === 'true',
    requireSubscriberOptOut: mno.requiresubscriberoptout === 'true',
    requireSubscriberHelp: mno.requiresubscriberhelp === 'true',
    noEmbeddedLink: mno.noembeddedlink === 'true',
    noEmbeddedPhone: mno.noembeddedphone === 'true',
    brandDailyCap: mno.branddailycap ? parseInt(mno.branddailycap as string, 10) : undefined,
    brandTier: mno.brandtier as string,
    messageClass: mno.messageclass as string,
    tpm: mno.tpm ? parseInt(mno.tpm as string, 10) : undefined,
    tpmScope: mno.tpmscope as string
  };
}

export function transformMnoStatusFromXml(xmlMnoStatus: unknown): MnoStatus {
  if (!xmlMnoStatus) throw new Error('Invalid MNO status data');
  
  const status = xmlMnoStatus as Record<string, unknown>;
  return {
    mnoName: status.mononame as string,
    mnoId: status.mnoid as string,
    status: status.status as string
  };
}

export function transformCampaignFromXml(xmlCampaign: unknown): Campaign {
  if (!xmlCampaign) throw new Error('Invalid campaign data');
  
  const campaign = xmlCampaign as Record<string, unknown>;
  
  // Transform MnoMetadataList if present
  let mnoMetadataList: MnoMetadata[] | undefined;
  if (campaign.mnometadatalist) {
    const metadataList = campaign.mnometadatalist as Record<string, unknown>;
    if (metadataList.mnometadata) {
      const metadata = Array.isArray(metadataList.mnometadata) 
        ? metadataList.mnometadata 
        : [metadataList.mnometadata];
      mnoMetadataList = metadata.map(transformMnoMetadataFromXml);
    }
  }
  
  // Transform MnoStatusList if present
  let mnoStatusList: MnoStatus[] | undefined;
  if (campaign.mnostatuslist) {
    const statusList = campaign.mnostatuslist as Record<string, unknown>;
    if (statusList.mnostatus) {
      const statuses = Array.isArray(statusList.mnostatus) 
        ? statusList.mnostatus 
        : [statusList.mnostatus];
      mnoStatusList = statuses.map(transformMnoStatusFromXml);
    }
  }
  
  return {
    campaignId: campaign.campaignid as string,
    accountId: campaign.accountid as string,
    brandId: campaign.brandid as string,
    usecase: campaign.usecase as string,
    subUsecases: campaign.subusecases as string,
    description: campaign.description as string,
    resellerId: campaign.resellerid as string,
    embeddedLink: campaign.embeddedlink === 'true',
    embeddedPhone: campaign.embeddedphone === 'true',
    affiliateMarketing: campaign.affiliatemarketing === 'true',
    numberPool: campaign.numberpool === 'true',
    ageGated: campaign.agegated === 'true',
    directLending: campaign.directlending === 'true',
    subscriberOptin: campaign.subscriberoptin === 'true',
    subscriberOptout: campaign.subscriberoptout === 'true',
    subscriberHelp: campaign.subscriberhelp === 'true',
    sample1: campaign.sample1 as string,
    sample2: campaign.sample2 as string,
    sample3: campaign.sample3 as string,
    sample4: campaign.sample4 as string,
    sample5: campaign.sample5 as string,
    messageFlow: campaign.messageflow as string,
    helpKeywords: campaign.helpkeywords as string,
    helpMessage: campaign.helpmessage as string,
    optinKeywords: campaign.optinkeywords as string,
    optinMessage: campaign.optinmessage as string,
    optoutKeywords: campaign.optoutkeywords as string,
    optoutMessage: campaign.optoutmessage as string,
    privacyPolicyLink: campaign.privacypolicylink as string,
    termsAndConditionsLink: campaign.termsandconditionslink as string,
    referenceId: campaign.referenceid as string,
    autoRenewal: campaign.autorenewal === 'true',
    status: campaign.status as 'ACTIVE' | 'EXPIRED' | undefined,
    createDate: campaign.createdate as string,
    billedDate: campaign.billeddate as string,
    mnoMetadataList,
    mnoStatusList,
    sharingStatus: campaign.sharingstatus === 'true',
    secondaryDcaSharingStatus: campaign.secondarydcasharingstatus as string,
    hasSubId: campaign.hassubid === 'true'
  };
}

export function transformCampaignAssignmentFromXml(xmlAssignment: unknown): CampaignAssignment {
  if (!xmlAssignment) throw new Error('Invalid assignment data');
  
  const assignment = xmlAssignment as Record<string, unknown>;
  return {
    campaignId: assignment.campaignid as string,
    tn: assignment.tn as string
  };
}

export function serializeBrandToXml(brand: Partial<Brand>): string {
  const xmlParts: string[] = ['<Brand>'];
  
  if (brand.entityType) xmlParts.push(`  <EntityType>${brand.entityType}</EntityType>`);
  if (brand.altBusinessId) xmlParts.push(`  <AltBusinessId>${brand.altBusinessId}</AltBusinessId>`);
  if (brand.altBusinessIdType) xmlParts.push(`  <AltBusinessIdType>${brand.altBusinessIdType}</AltBusinessIdType>`);
  if (brand.brandRelationship) xmlParts.push(`  <BrandRelationship>${brand.brandRelationship}</BrandRelationship>`);
  if (brand.city) xmlParts.push(`  <City>${brand.city}</City>`);
  if (brand.companyName) xmlParts.push(`  <CompanyName>${brand.companyName}</CompanyName>`);
  if (brand.country) xmlParts.push(`  <Country>${brand.country}</Country>`);
  if (brand.displayName) xmlParts.push(`  <DisplayName>${brand.displayName}</DisplayName>`);
  if (brand.ein) xmlParts.push(`  <Ein>${brand.ein}</Ein>`);
  if (brand.email) xmlParts.push(`  <Email>${brand.email}</Email>`);
  if (brand.phone) xmlParts.push(`  <Phone>${brand.phone}</Phone>`);
  if (brand.postalCode) xmlParts.push(`  <PostalCode>${brand.postalCode}</PostalCode>`);
  if (brand.state) xmlParts.push(`  <State>${brand.state}</State>`);
  if (brand.street) xmlParts.push(`  <Street>${brand.street}</Street>`);
  if (brand.stockExchange) xmlParts.push(`  <StockExchange>${brand.stockExchange}</StockExchange>`);
  if (brand.stockSymbol) xmlParts.push(`  <StockSymbol>${brand.stockSymbol}</StockSymbol>`);
  if (brand.vertical) xmlParts.push(`  <Vertical>${brand.vertical}</Vertical>`);
  if (brand.website) xmlParts.push(`  <Website>${brand.website}</Website>`);
  if (brand.businessContactEmail) xmlParts.push(`  <BusinessContactEmail>${brand.businessContactEmail}</BusinessContactEmail>`);
  if (brand.isMain !== undefined) xmlParts.push(`  <IsMain>${brand.isMain}</IsMain>`);
  
  xmlParts.push('</Brand>');
  return xmlParts.join('\n');
}

export function serializeCampaignToXml(campaign: Partial<Campaign>): string {
  const xmlParts: string[] = ['<Campaign>'];
  
  if (campaign.autoRenewal !== undefined) xmlParts.push(`  <AutoRenewal>${campaign.autoRenewal}</AutoRenewal>`);
  if (campaign.brandId) xmlParts.push(`  <BrandId>${campaign.brandId}</BrandId>`);
  if (campaign.usecase) xmlParts.push(`  <Usecase>${campaign.usecase}</Usecase>`);
  if (campaign.subUsecases) xmlParts.push(`  <SubUsecases>${campaign.subUsecases}</SubUsecases>`);
  if (campaign.description) xmlParts.push(`  <Description>${campaign.description}</Description>`);
  if (campaign.resellerId) xmlParts.push(`  <ResellerId>${campaign.resellerId}</ResellerId>`);
  if (campaign.embeddedLink !== undefined) xmlParts.push(`  <EmbeddedLink>${campaign.embeddedLink}</EmbeddedLink>`);
  if (campaign.embeddedPhone !== undefined) xmlParts.push(`  <EmbeddedPhone>${campaign.embeddedPhone}</EmbeddedPhone>`);
  if (campaign.numberPool !== undefined) xmlParts.push(`  <NumberPool>${campaign.numberPool}</NumberPool>`);
  if (campaign.ageGated !== undefined) xmlParts.push(`  <AgeGated>${campaign.ageGated}</AgeGated>`);
  if (campaign.directLending !== undefined) xmlParts.push(`  <DirectLending>${campaign.directLending}</DirectLending>`);
  if (campaign.subscriberOptin !== undefined) xmlParts.push(`  <SubscriberOptIn>${campaign.subscriberOptin}</SubscriberOptIn>`);
  if (campaign.subscriberOptout !== undefined) xmlParts.push(`  <SubscriberOptOut>${campaign.subscriberOptout}</SubscriberOptOut>`);
  if (campaign.subscriberHelp !== undefined) xmlParts.push(`  <SubscriberHelp>${campaign.subscriberHelp}</SubscriberHelp>`);
  if (campaign.sample1) xmlParts.push(`  <Sample1>${campaign.sample1}</Sample1>`);
  if (campaign.sample2) xmlParts.push(`  <Sample2>${campaign.sample2}</Sample2>`);
  if (campaign.sample3) xmlParts.push(`  <Sample3>${campaign.sample3}</Sample3>`);
  if (campaign.sample4 !== undefined) xmlParts.push(`  <Sample4>${campaign.sample4}</Sample4>`);
  if (campaign.sample5 !== undefined) xmlParts.push(`  <Sample5>${campaign.sample5}</Sample5>`);
  if (campaign.messageFlow) xmlParts.push(`  <MessageFlow>${campaign.messageFlow}</MessageFlow>`);
  if (campaign.helpKeywords) xmlParts.push(`  <HelpKeywords>${campaign.helpKeywords}</HelpKeywords>`);
  if (campaign.helpMessage) xmlParts.push(`  <HelpMessage>${campaign.helpMessage}</HelpMessage>`);
  if (campaign.optinKeywords) xmlParts.push(`  <OptinKeywords>${campaign.optinKeywords}</OptinKeywords>`);
  if (campaign.optinMessage) xmlParts.push(`  <OptinMessage>${campaign.optinMessage}</OptinMessage>`);
  if (campaign.optoutKeywords) xmlParts.push(`  <OptoutKeywords>${campaign.optoutKeywords}</OptoutKeywords>`);
  if (campaign.optoutMessage) xmlParts.push(`  <OptoutMessage>${campaign.optoutMessage}</OptoutMessage>`);
  if (campaign.privacyPolicyLink) xmlParts.push(`  <PrivacyPolicyLink>${campaign.privacyPolicyLink}</PrivacyPolicyLink>`);
  if (campaign.termsAndConditionsLink) xmlParts.push(`  <TermsAndConditionsLink>${campaign.termsAndConditionsLink}</TermsAndConditionsLink>`);
  if (campaign.referenceId) xmlParts.push(`  <ReferenceId>${campaign.referenceId}</ReferenceId>`);
  
  xmlParts.push('</Campaign>');
  return xmlParts.join('\n');
}

export function serializeCampaignAssignmentToXml(assignment: { campaignId?: string; tns?: string[] }): string {
  const xmlParts: string[] = ['<CampaignAssignment>'];
  
  if (assignment.campaignId) xmlParts.push(`  <CampaignId>${assignment.campaignId}</CampaignId>`);
  if (assignment.tns && Array.isArray(assignment.tns)) {
    xmlParts.push('  <Tns>');
    assignment.tns.forEach((tn: string) => {
      xmlParts.push(`    <Tn>${tn}</Tn>`);
    });
    xmlParts.push('  </Tns>');
  }
  
  xmlParts.push('</CampaignAssignment>');
  return xmlParts.join('\n');
}
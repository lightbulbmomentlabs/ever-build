import { Client } from '@hubspot/api-client';

// Initialize HubSpot client
export function createHubSpotClient() {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('Missing HubSpot access token');
  }

  return new Client({ accessToken });
}

// Interface for waitlist lead data
export interface HubSpotContact {
  firstname: string;
  lastname: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  project_count?: string | null;
  interested_in_call?: boolean;
  lead_source?: string;
}

// Split full name into first and last name
function splitName(fullName: string): { firstname: string; lastname: string } {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return { firstname: parts[0], lastname: '' };
  }
  const firstname = parts[0];
  const lastname = parts.slice(1).join(' ');
  return { firstname, lastname };
}

/**
 * Create or update a contact in HubSpot
 * @param contactData Contact information from the waitlist form
 * @returns The created/updated contact ID
 */
export async function createOrUpdateContact(contactData: {
  name: string;
  email: string;
  company?: string | null;
  project_count?: string | null;
  phone?: string | null;
  interested_in_call: boolean;
  lead_source: string;
}): Promise<string> {
  try {
    const hubspot = createHubSpotClient();
    const { firstname, lastname } = splitName(contactData.name);

    // Prepare properties object
    const properties: Record<string, any> = {
      firstname,
      lastname,
      email: contactData.email,
      lead_source: contactData.lead_source,
    };

    // Add optional fields
    if (contactData.company) {
      properties.company = contactData.company;
    }
    if (contactData.phone) {
      properties.phone = contactData.phone;
    }
    if (contactData.project_count) {
      properties.project_count = contactData.project_count;
    }
    if (contactData.interested_in_call !== undefined) {
      properties.interested_in_call = contactData.interested_in_call;
    }

    // Try to create or update the contact
    const response = await hubspot.crm.contacts.basicApi.create({
      properties,
      associations: [],
    });

    return response.id;
  } catch (error: any) {
    // If contact already exists (409 conflict), update it
    if (error.code === 409) {
      return await updateExistingContact(contactData);
    }
    throw error;
  }
}

/**
 * Update an existing contact in HubSpot
 */
async function updateExistingContact(contactData: {
  name: string;
  email: string;
  company?: string | null;
  project_count?: string | null;
  phone?: string | null;
  interested_in_call: boolean;
  lead_source: string;
}): Promise<string> {
  const hubspot = createHubSpotClient();
  const { firstname, lastname } = splitName(contactData.name);

  // Search for the contact by email
  const searchResponse = await hubspot.crm.contacts.searchApi.doSearch({
    filterGroups: [
      {
        filters: [
          {
            propertyName: 'email',
            operator: 'EQ' as any,
            value: contactData.email,
          },
        ],
      },
    ],
    properties: ['email'],
    limit: 1,
  });

  if (searchResponse.results.length === 0) {
    throw new Error('Contact not found');
  }

  const contactId = searchResponse.results[0].id;

  // Prepare properties object
  const properties: Record<string, any> = {
    firstname,
    lastname,
    lead_source: contactData.lead_source,
  };

  // Add optional fields
  if (contactData.company) {
    properties.company = contactData.company;
  }
  if (contactData.phone) {
    properties.phone = contactData.phone;
  }
  if (contactData.project_count) {
    properties.project_count = contactData.project_count;
  }
  if (contactData.interested_in_call !== undefined) {
    properties.interested_in_call = contactData.interested_in_call;
  }

  // Update the contact
  await hubspot.crm.contacts.basicApi.update(contactId, { properties });

  return contactId;
}

/**
 * Add a contact to a specific list in HubSpot
 * @param contactId The HubSpot contact ID
 * @param listId The HubSpot list ID
 */
export async function addContactToList(
  contactId: string,
  listId: string
): Promise<void> {
  try {
    const hubspot = createHubSpotClient();

    await hubspot.crm.lists.membershipsApi.addAndRemove(listId, {
      recordIdsToAdd: [contactId],
      recordIdsToRemove: [],
    });
  } catch (error: any) {
    // Log but don't throw - adding to list is nice-to-have
    console.error('Failed to add contact to HubSpot list:', error.message);
  }
}

/**
 * Sync a waitlist lead to HubSpot
 * @param leadData Lead information from the form
 * @returns Success status
 */
export async function syncLeadToHubSpot(leadData: {
  name: string;
  email: string;
  company?: string | null;
  project_count?: string | null;
  phone?: string | null;
  interested_in_call: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Create or update contact
    const contactId = await createOrUpdateContact({
      ...leadData,
      lead_source: 'website_waitlist',
    });

    console.log(`HubSpot: Contact created/updated with ID: ${contactId}`);

    // Add to list if list ID is configured
    const listId = process.env.HUBSPOT_WAITLIST_LIST_ID;
    if (listId) {
      await addContactToList(contactId, listId);
      console.log(`HubSpot: Contact added to list ${listId}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('HubSpot sync error:', error.message);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

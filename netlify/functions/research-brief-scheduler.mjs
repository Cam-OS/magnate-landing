import { queryNewLeads } from './lib/notion-client.mjs';

/**
 * Scheduled function that runs every 30 minutes
 * Queries Notion for new leads and triggers background processing for each
 */
export default async (req) => {
  console.log('Research brief scheduler started');

  try {
    // Query Notion for leads needing research
    const leads = await queryNewLeads();
    console.log(`Found ${leads.length} leads needing research briefs`);

    if (leads.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No new leads to process'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the site URL for triggering background function
    const siteUrl = process.env.URL || process.env.SITE_URL;
    if (!siteUrl) {
      console.error('URL environment variable not set');
      return new Response(JSON.stringify({
        success: false,
        error: 'Site URL not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Trigger background function for each lead
    const triggers = [];
    for (const lead of leads) {
      console.log(`Triggering research for lead: ${lead.clientName} (${lead.id})`);

      const triggerPromise = fetch(`${siteUrl}/.netlify/functions/research-brief-background`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadId: lead.id })
      }).then(response => ({
        leadId: lead.id,
        name: lead.clientName,
        triggered: response.ok,
        status: response.status
      })).catch(error => ({
        leadId: lead.id,
        name: lead.clientName,
        triggered: false,
        error: error.message
      }));

      triggers.push(triggerPromise);
    }

    // Wait for all triggers to complete
    const results = await Promise.all(triggers);

    const successful = results.filter(r => r.triggered).length;
    const failed = results.filter(r => !r.triggered).length;

    console.log(`Triggered ${successful} research briefs, ${failed} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `Triggered ${successful} research briefs`,
      details: results
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Scheduler error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Schedule: Disabled - re-enable when ready
export const config = {
  // schedule: '*/30 * * * *'
};

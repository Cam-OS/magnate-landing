import { getLeadDetails, writeNotionBlocks } from './lib/notion-client.mjs';
import { scrapeWebsite } from './lib/website-scraper.mjs';
import { enrichLinkedIn } from './lib/linkedin-enricher.mjs';
import { generateBrief, generateFallbackBrief } from './lib/brief-generator.mjs';

/**
 * Background function for generating research briefs
 * Triggered by the scheduler for each lead needing research
 * Has 15-minute timeout for heavy processing
 */
export default async (req) => {
  // Parse the lead ID from the request
  let leadId;
  try {
    const body = await req.json();
    leadId = body.leadId;
  } catch (error) {
    console.error('Failed to parse request body:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid request body'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!leadId) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Lead ID is required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log(`Starting research brief generation for lead: ${leadId}`);

  try {
    // Step 1: Get lead details from Notion
    console.log('Fetching lead details from Notion...');
    const lead = await getLeadDetails(leadId);
    console.log(`Lead: ${lead.clientName} at ${lead.companyName}`);

    // Track errors for fallback brief
    const errors = [];

    // Step 2: Scrape company website (run in parallel with LinkedIn)
    console.log('Starting website scrape and LinkedIn enrichment...');

    // LinkedIn enrichment disabled until Bright Data account is verified
    // To re-enable, uncomment the enrichLinkedIn call below
    const [websiteData, linkedInData] = await Promise.all([
      scrapeWebsite(lead.companyWebsite).catch(error => {
        console.error('Website scrape error:', error);
        errors.push(`Website scrape failed: ${error.message}`);
        return { success: false, error: error.message, pages: [] };
      }),
      // enrichLinkedIn(lead.linkedInUrl).catch(error => {
      //   console.error('LinkedIn enrichment error:', error);
      //   errors.push(`LinkedIn enrichment failed: ${error.message}`);
      //   return { success: false, error: error.message };
      // })
      Promise.resolve({ success: false, error: 'LinkedIn enrichment disabled' })
    ]);

    console.log(`Website scrape: ${websiteData.success ? 'success' : 'failed'}`);
    if (!websiteData.success) console.log('Website error:', websiteData.error);
    console.log(`LinkedIn enrichment: ${linkedInData.success ? 'success' : 'failed'}`);
    if (!linkedInData.success) console.log('LinkedIn error:', linkedInData.error);

    // Step 3: Generate the research brief
    let brief;

    if (!websiteData.success && !linkedInData.success) {
      // Both data sources failed - generate fallback brief
      console.log('Both data sources failed, generating fallback brief...');
      brief = generateFallbackBrief(lead, errors);
    } else {
      // Generate full brief with available data
      console.log('Generating research brief with Claude...');
      try {
        brief = await generateBrief({ lead, websiteData, linkedInData });
      } catch (error) {
        console.error('Brief generation error:', error);
        errors.push(`Brief generation failed: ${error.message}`);
        brief = generateFallbackBrief(lead, errors);
      }
    }

    // Step 4: Write the brief to the Notion page body
    console.log('Writing brief to Notion...');
    await writeNotionBlocks(leadId, brief);

    console.log(`Research brief completed for ${lead.clientName}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Research brief generated and saved',
      lead: {
        id: leadId,
        name: lead.clientName,
        company: lead.companyName
      },
      dataStatus: {
        website: websiteData.success,
        linkedin: linkedInData.success
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Research brief generation failed:', error);

    // Try to write an error message to the Notion page
    try {
      const errorBrief = `## Research Brief Generation Failed

An error occurred while generating this research brief:

\`\`\`
${error.message}
\`\`\`

Please research this lead manually or trigger a retry.

---
*Error occurred at: ${new Date().toISOString()}*`;

      await writeNotionBlocks(leadId, errorBrief);
    } catch (writeError) {
      console.error('Failed to write error to Notion:', writeError);
    }

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      leadId
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Configure as background function with 15-minute timeout
export const config = {
  type: 'background'
};

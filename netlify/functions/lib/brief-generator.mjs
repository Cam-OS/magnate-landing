import { summarizeWebsiteData } from './website-scraper.mjs';
import { summarizeLinkedInData } from './linkedin-enricher.mjs';

/**
 * Generate a pre-call research brief using Claude
 * @param {Object} data - Combined lead, website, and LinkedIn data
 * @returns {string} Formatted research brief
 */
export async function generateBrief({ lead, websiteData, linkedInData }) {
  const prompt = buildPrompt(lead, websiteData, linkedInData);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const message = await response.json();

  // Extract text from response
  const brief = message.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');

  return brief;
}

/**
 * Build the prompt for Claude with all gathered data
 */
function buildPrompt(lead, websiteData, linkedInData) {
  const websiteSummary = summarizeWebsiteData(websiteData);
  const linkedInSummary = summarizeLinkedInData(linkedInData);

  return `You are a senior business development researcher at Magnate, a content marketing agency that helps founders and executives build their personal brands through LinkedIn content and thought leadership.

Your task is to create a comprehensive pre-call research brief for a new lead. This brief will be used by the sales team before their discovery call.

## Lead Information

**Name:** ${lead.clientName || 'Unknown'}
**Company:** ${lead.companyName || 'Unknown'}
**Website:** ${lead.companyWebsite || 'Not provided'}
**LinkedIn:** ${lead.linkedInUrl || 'Not provided'}
**Email:** ${lead.clientEmail || 'Not provided'}
**Annual Revenue:** ${lead.annualRevenue || 'Not specified'}
**Their Message:** ${lead.message || 'No message provided'}

## Website Research

${websiteSummary}

## LinkedIn Research

${linkedInSummary}

---

Based on all this information, create a detailed research brief with the following sections. Use markdown formatting.

## Lead Snapshot

Create a quick-reference table with key facts:
| Field | Value |
|-------|-------|
| Name | ... |
| Company | ... |
| Role | ... |
| Revenue Tier | ... |
| Location | ... |
| LinkedIn Followers | ... |

## Company Overview

Summarize what the company does, their business model, market position, and any notable achievements or differentiators. Identify their target market and value proposition.

## Founder Background

Detail the lead's professional journey, key career moves, expertise areas, and achievements. What makes their story compelling?

## Content Presence Analysis

Analyze their current LinkedIn activity and content presence:
- How active are they on LinkedIn?
- What topics do they post about (if any)?
- What's their engagement level?
- What content gaps or opportunities exist?

## Fit Assessment

Evaluate how well this lead aligns with Magnate's ideal client profile:
- Do they have a compelling story to tell?
- Are they in a position to benefit from thought leadership?
- What's their likely motivation for reaching out?
- Any potential concerns or red flags?

Rate the fit: **High / Medium / Low** with explanation.

## Narrative Angles

Identify 3-5 potential story angles or themes that could form the foundation of their content strategy:
1. [Angle 1 with brief explanation]
2. [Angle 2 with brief explanation]
...

## Content Strategy Ideas

Suggest specific content ideas tailored to their background and industry:
- 3 potential LinkedIn post topics
- 2 potential long-form content ideas (articles, newsletters)
- 1 potential unique content format (carousel, video series, etc.)

## Discovery Questions

List 5-7 strategic questions to ask during the discovery call to better understand their goals, challenges, and fit:
1. [Question 1]
2. [Question 2]
...

## Quick Take

End with a 2-3 sentence executive summary: Who is this person, why are they a good (or not good) fit, and what's the key angle to explore on the call?

---

Be specific, insightful, and actionable. If data is missing or unclear, note it but make reasonable inferences based on available information. Focus on what will be most useful for the sales conversation.`;
}

/**
 * Generate a fallback brief when data collection fails
 */
export function generateFallbackBrief(lead, errors) {
  const errorList = errors.map(e => `- ${e}`).join('\n');

  return `## Research Brief - Limited Data Available

**Lead:** ${lead.clientName || 'Unknown'}
**Company:** ${lead.companyName || 'Unknown'}

### Data Collection Issues

The following issues occurred during research:
${errorList}

### Available Information

| Field | Value |
|-------|-------|
| Name | ${lead.clientName || 'Not provided'} |
| Company | ${lead.companyName || 'Not provided'} |
| Website | ${lead.companyWebsite || 'Not provided'} |
| LinkedIn | ${lead.linkedInUrl || 'Not provided'} |
| Revenue | ${lead.annualRevenue || 'Not specified'} |

### Their Message

${lead.message || 'No message provided'}

### Recommended Actions

1. Manually review their website: ${lead.companyWebsite || 'N/A'}
2. Manually review their LinkedIn: ${lead.linkedInUrl || 'N/A'}
3. Research the company through Google/Crunchbase
4. Prepare general discovery questions

### Discovery Questions (Generic)

1. What prompted you to reach out to Magnate?
2. What are your goals for building your personal brand?
3. How much content are you currently creating?
4. What's your biggest challenge with content or thought leadership?
5. What would success look like for you in 6 months?

---
*This brief was generated with limited data. Manual research recommended before the call.*`;
}

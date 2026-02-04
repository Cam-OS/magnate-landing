import * as cheerio from 'cheerio';

// Common paths to scrape for company research
const PATHS_TO_SCRAPE = ['/', '/about', '/about-us', '/team', '/services', '/blog'];

// Request timeout in ms
const FETCH_TIMEOUT = 10000;

/**
 * Scrape multiple pages from a company website
 * @param {string} baseUrl - The company website URL
 * @returns {Object} Structured content from the website
 */
export async function scrapeWebsite(baseUrl) {
  if (!baseUrl) {
    return { success: false, error: 'No website URL provided', pages: [] };
  }

  // Normalize the URL
  let normalizedUrl;
  try {
    normalizedUrl = normalizeUrl(baseUrl);
  } catch (error) {
    return { success: false, error: `Invalid URL: ${baseUrl}`, pages: [] };
  }

  const results = {
    success: true,
    baseUrl: normalizedUrl,
    pages: [],
    aggregated: {
      metaDescriptions: [],
      headings: [],
      socialLinks: [],
      companyInfo: {}
    }
  };

  // Scrape each path concurrently
  const scrapePromises = PATHS_TO_SCRAPE.map(path =>
    scrapePage(normalizedUrl, path).catch(error => ({
      path,
      success: false,
      error: error.message
    }))
  );

  const pageResults = await Promise.all(scrapePromises);

  for (const pageResult of pageResults) {
    if (pageResult.success) {
      results.pages.push(pageResult);

      // Aggregate data
      if (pageResult.metaDescription) {
        results.aggregated.metaDescriptions.push({
          page: pageResult.path,
          description: pageResult.metaDescription
        });
      }

      results.aggregated.headings.push(...pageResult.headings.map(h => ({
        page: pageResult.path,
        ...h
      })));

      results.aggregated.socialLinks.push(...pageResult.socialLinks);
    }
  }

  // Dedupe social links
  results.aggregated.socialLinks = [...new Set(results.aggregated.socialLinks)];

  // Mark as failed if no pages were successfully scraped
  if (results.pages.length === 0) {
    results.success = false;
    results.error = 'Could not scrape any pages from the website';
  }

  return results;
}

/**
 * Scrape a single page
 */
async function scrapePage(baseUrl, path) {
  const url = new URL(path, baseUrl).toString();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MagnateBot/1.0; +https://magnate.co)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { path, success: false, error: `HTTP ${response.status}` };
    }

    const html = await response.text();
    return parsePage(html, path);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      return { path, success: false, error: 'Request timeout' };
    }
    throw error;
  }
}

/**
 * Parse HTML content with Cheerio
 */
function parsePage(html, path) {
  const $ = cheerio.load(html);

  // Remove script and style elements
  $('script, style, noscript, iframe').remove();

  const result = {
    path,
    success: true,
    title: $('title').text().trim(),
    metaDescription: $('meta[name="description"]').attr('content') || '',
    ogDescription: $('meta[property="og:description"]').attr('content') || '',
    headings: [],
    bodyText: '',
    socialLinks: []
  };

  // Extract headings
  $('h1, h2, h3').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 200) {
      result.headings.push({
        level: el.tagName.toLowerCase(),
        text
      });
    }
  });

  // Extract main body text (limit to prevent huge payloads)
  const bodyParts = [];
  $('main, article, .content, [role="main"], body').each((i, el) => {
    // Get text from paragraphs, lists, and divs
    $(el).find('p, li, div').each((j, textEl) => {
      const text = $(textEl).text().trim();
      if (text && text.length > 20 && text.length < 1000) {
        bodyParts.push(text);
      }
    });
  });

  // Dedupe and limit body text
  const uniqueParts = [...new Set(bodyParts)];
  result.bodyText = uniqueParts.slice(0, 50).join('\n\n');

  // Limit body text size
  if (result.bodyText.length > 10000) {
    result.bodyText = result.bodyText.slice(0, 10000) + '...';
  }

  // Extract social links
  $('a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="x.com"], a[href*="facebook.com"], a[href*="instagram.com"], a[href*="youtube.com"]').each((i, el) => {
    const href = $(el).attr('href');
    if (href) {
      result.socialLinks.push(href);
    }
  });

  // Try to extract company-specific info from about pages
  if (path.includes('about') || path === '/') {
    // Look for founding year
    const yearMatch = result.bodyText.match(/(?:founded|established|since|started)\s+(?:in\s+)?(\d{4})/i);
    if (yearMatch) {
      result.foundedYear = yearMatch[1];
    }

    // Look for team size indicators
    const teamMatch = result.bodyText.match(/(\d+)\s*(?:\+)?\s*(?:employees?|team members?|people|staff)/i);
    if (teamMatch) {
      result.teamSize = teamMatch[1];
    }
  }

  return result;
}

/**
 * Normalize URL to ensure it has a protocol
 */
function normalizeUrl(url) {
  let normalized = url.trim();

  // Add https if no protocol
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }

  // Validate the URL
  const parsed = new URL(normalized);
  return parsed.origin;
}

/**
 * Extract a summary of the website content for the brief
 */
export function summarizeWebsiteData(websiteData) {
  if (!websiteData.success || websiteData.pages.length === 0) {
    return 'Website could not be scraped.';
  }

  const parts = [];

  // Meta descriptions
  if (websiteData.aggregated.metaDescriptions.length > 0) {
    parts.push('**Meta Descriptions:**');
    for (const meta of websiteData.aggregated.metaDescriptions.slice(0, 3)) {
      parts.push(`- ${meta.page}: ${meta.description}`);
    }
  }

  // Key headings
  const h1s = websiteData.aggregated.headings.filter(h => h.level === 'h1');
  if (h1s.length > 0) {
    parts.push('\n**Main Headlines:**');
    for (const h of h1s.slice(0, 5)) {
      parts.push(`- ${h.text}`);
    }
  }

  // Social presence
  if (websiteData.aggregated.socialLinks.length > 0) {
    parts.push('\n**Social Presence:**');
    for (const link of websiteData.aggregated.socialLinks.slice(0, 5)) {
      parts.push(`- ${link}`);
    }
  }

  // Page content excerpts
  parts.push('\n**Page Content Excerpts:**');
  for (const page of websiteData.pages.slice(0, 3)) {
    if (page.bodyText) {
      const excerpt = page.bodyText.slice(0, 500);
      parts.push(`\n[${page.path}]:\n${excerpt}...`);
    }
  }

  return parts.join('\n');
}

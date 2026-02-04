import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID || 'b9959954cc9941799c4e565c5a06399b';

// Lead statuses that need research briefs
const NEW_LEAD_STATUSES = ['Lead', 'Web Form Lead', 'Calendly Lead'];

/**
 * Query Notion database for new leads that need research briefs
 * Filters for new lead statuses AND pages with no content blocks
 */
export async function queryNewLeads() {
  const statusFilters = NEW_LEAD_STATUSES.map(status => ({
    property: 'Client Status',
    status: { equals: status }
  }));

  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      or: statusFilters
    }
  });

  // Filter to only pages with empty bodies (no blocks)
  const leadsNeedingResearch = [];

  for (const page of response.results) {
    const blocks = await notion.blocks.children.list({
      block_id: page.id,
      page_size: 1
    });

    if (blocks.results.length === 0) {
      leadsNeedingResearch.push(page);
    }
  }

  return leadsNeedingResearch.map(extractLeadData);
}

/**
 * Get full lead details from a Notion page
 */
export async function getLeadDetails(pageId) {
  const page = await notion.pages.retrieve({ page_id: pageId });
  return extractLeadData(page);
}

/**
 * Extract lead data from a Notion page object
 */
function extractLeadData(page) {
  const props = page.properties;

  return {
    id: page.id,
    clientName: getTitle(props['Client Name']),
    companyName: getRichText(props['Company Name']),
    companyWebsite: getUrl(props['Company Website']),
    linkedInUrl: getUrl(props['LinkedIn URL']),
    message: getRichText(props['Message']),
    annualRevenue: getSelect(props['Annual Revenue']),
    clientEmail: getEmail(props['Client Email']),
    status: getStatus(props['Client Status'])
  };
}

/**
 * Write research brief blocks to a Notion page
 */
export async function writeNotionBlocks(pageId, briefContent) {
  const blocks = convertBriefToBlocks(briefContent);

  // Notion API limits to 100 blocks per request, so chunk if needed
  const chunkSize = 100;
  for (let i = 0; i < blocks.length; i += chunkSize) {
    const chunk = blocks.slice(i, i + chunkSize);
    await notion.blocks.children.append({
      block_id: pageId,
      children: chunk
    });
  }
}

/**
 * Convert markdown-like brief content to Notion blocks
 */
function convertBriefToBlocks(content) {
  const lines = content.split('\n');
  const blocks = [];

  let inTable = false;
  let tableRows = [];

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) {
      if (inTable && tableRows.length > 0) {
        blocks.push(createTableBlock(tableRows));
        tableRows = [];
        inTable = false;
      }
      continue;
    }

    // Handle headers
    if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: line.slice(3) } }]
        }
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: line.slice(4) } }]
        }
      });
    }
    // Handle table rows (simple | delimited format)
    else if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true;
      // Skip separator rows (|---|---|)
      if (!line.includes('---')) {
        const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
        tableRows.push(cells);
      }
    }
    // Handle bullet points
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: parseRichText(line.slice(2))
        }
      });
    }
    // Handle numbered lists
    else if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, '');
      blocks.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: parseRichText(text)
        }
      });
    }
    // Handle blockquotes
    else if (line.startsWith('> ')) {
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: [{ type: 'text', text: { content: line.slice(2) } }]
        }
      });
    }
    // Handle dividers
    else if (line.trim() === '---') {
      blocks.push({
        object: 'block',
        type: 'divider',
        divider: {}
      });
    }
    // Regular paragraphs
    else {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: parseRichText(line)
        }
      });
    }
  }

  // Flush any remaining table
  if (tableRows.length > 0) {
    blocks.push(createTableBlock(tableRows));
  }

  return blocks;
}

/**
 * Parse inline formatting (bold, italic) to Notion rich text
 */
function parseRichText(text) {
  const parts = [];
  let remaining = text;

  // Simple regex-based parsing for **bold** and *italic*
  const boldRegex = /\*\*(.+?)\*\*/g;
  const italicRegex = /\*(.+?)\*/g;

  // For simplicity, just handle plain text with basic bold detection
  const boldMatches = [...text.matchAll(boldRegex)];

  if (boldMatches.length === 0) {
    return [{ type: 'text', text: { content: text } }];
  }

  let lastIndex = 0;
  for (const match of boldMatches) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: { content: text.slice(lastIndex, match.index) }
      });
    }
    // Add bold text
    parts.push({
      type: 'text',
      text: { content: match[1] },
      annotations: { bold: true }
    });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      text: { content: text.slice(lastIndex) }
    });
  }

  return parts;
}

/**
 * Create a Notion table block from rows
 */
function createTableBlock(rows) {
  if (rows.length === 0) return null;

  const tableWidth = Math.max(...rows.map(r => r.length));

  return {
    object: 'block',
    type: 'table',
    table: {
      table_width: tableWidth,
      has_column_header: true,
      has_row_header: false,
      children: rows.map((row, index) => ({
        object: 'block',
        type: 'table_row',
        table_row: {
          cells: row.map(cell => [{ type: 'text', text: { content: cell } }])
        }
      }))
    }
  };
}

// Property extraction helpers
function getTitle(prop) {
  return prop?.title?.[0]?.plain_text || '';
}

function getRichText(prop) {
  return prop?.rich_text?.[0]?.plain_text || '';
}

function getUrl(prop) {
  return prop?.url || '';
}

function getSelect(prop) {
  return prop?.select?.name || '';
}

function getStatus(prop) {
  return prop?.status?.name || '';
}

function getEmail(prop) {
  return prop?.email || '';
}

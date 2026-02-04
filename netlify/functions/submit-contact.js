const https = require('https');

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Parse form data
  let data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { firstName, lastName, email, company, companyWebsite, linkedinUrl, revenue, message } = data;


  // Build properties object
  const properties = {
    'Client Name': {
      title: [{ text: { content: `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown' } }]
    },
    'Company Name': {
      rich_text: [{ text: { content: company || '' } }]
    },
    'Message': {
      rich_text: [{ text: { content: message || '' } }]
    },
    'Client Status': {
      status: { name: 'Web Form Lead' }
    }
  };

  // Only add email if provided
  if (email) {
    properties['Client Email'] = { email: email };
  }

  // Only add URL fields if provided
  if (companyWebsite) {
    properties['Company Website'] = { url: companyWebsite };
  }
  if (linkedinUrl) {
    properties['LinkedIn URL'] = { url: linkedinUrl };
  }

  // Only add Annual Revenue if a value was selected
  const formattedRevenue = formatRevenue(revenue);
  if (formattedRevenue) {
    properties['Annual Revenue'] = {
      select: { name: formattedRevenue }
    };
  }

  const notionData = JSON.stringify({
    parent: { database_id: process.env.NOTION_DATABASE_ID },
    properties: properties
  });

  const options = {
    hostname: 'api.notion.com',
    path: '/v1/pages',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    }
  };

  try {
    const response = await makeRequest(options, notionData);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true })
      };
    } else {
      console.error('Notion API error:', response.body);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to submit to Notion' })
      };
    }
  } catch (error) {
    console.error('Request error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};

function formatRevenue(value) {
  const revenueMap = {
    'under-500k': 'Under $500K',
    '500k-1m': '$500K - $1M',
    '1m-5m': '$1M - $5M',
    '5m-10m': '$5M - $10M',
    '10m-50m': '$10M - $50M',
    '50m-plus': '$50M+'
  };
  return revenueMap[value] || null;
}

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

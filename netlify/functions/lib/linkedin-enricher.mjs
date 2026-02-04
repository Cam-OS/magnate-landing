// Bright Data LinkedIn Profile Dataset API
const BRIGHTDATA_API_URL = 'https://api.brightdata.com/datasets/v3/trigger';
const LINKEDIN_DATASET_ID = 'gd_l1viktl72bvl7bjuj0'; // LinkedIn People Profiles

// Polling configuration
const POLL_INTERVAL = 5000; // 5 seconds
const MAX_POLL_ATTEMPTS = 60; // 5 minutes max wait

/**
 * Enrich a lead with LinkedIn profile data
 * @param {string} linkedInUrl - LinkedIn profile URL
 * @returns {Object} LinkedIn profile data
 */
export async function enrichLinkedIn(linkedInUrl) {
  if (!linkedInUrl) {
    return { success: false, error: 'No LinkedIn URL provided' };
  }

  const apiKey = process.env.BRIGHT_DATA_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'BRIGHT_DATA_API_KEY not configured' };
  }

  try {
    // Normalize LinkedIn URL
    const normalizedUrl = normalizeLinkedInUrl(linkedInUrl);
    if (!normalizedUrl) {
      return { success: false, error: 'Invalid LinkedIn URL format' };
    }

    // Trigger the dataset collection
    const snapshotId = await triggerCollection(normalizedUrl, apiKey);
    if (!snapshotId) {
      return { success: false, error: 'Failed to trigger LinkedIn data collection' };
    }

    // Poll for results
    const data = await pollForResults(snapshotId, apiKey);
    if (!data) {
      return { success: false, error: 'Timeout waiting for LinkedIn data' };
    }

    return {
      success: true,
      profile: parseLinkedInData(data)
    };
  } catch (error) {
    console.error('LinkedIn enrichment error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger Bright Data dataset collection for a LinkedIn profile
 */
async function triggerCollection(linkedInUrl, apiKey) {
  const response = await fetch(`${BRIGHTDATA_API_URL}?dataset_id=${LINKEDIN_DATASET_ID}&include_errors=true`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{ url: linkedInUrl }])
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bright Data API error:', response.status, errorText);
    throw new Error(`Bright Data API error: ${response.status}`);
  }

  const result = await response.json();
  return result.snapshot_id;
}

/**
 * Poll Bright Data for dataset results
 */
async function pollForResults(snapshotId, apiKey) {
  const statusUrl = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL);

    const response = await fetch(statusUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.status === 200) {
      // Data is ready
      const data = await response.json();
      return Array.isArray(data) ? data[0] : data;
    } else if (response.status === 202) {
      // Still processing, continue polling
      continue;
    } else {
      const errorText = await response.text();
      console.error('Bright Data poll error:', response.status, errorText);
      throw new Error(`Failed to fetch LinkedIn data: ${response.status}`);
    }
  }

  return null; // Timeout
}

/**
 * Parse raw LinkedIn data into a clean structure
 */
function parseLinkedInData(data) {
  if (!data) return null;

  return {
    name: data.name || '',
    headline: data.headline || '',
    summary: data.about || data.summary || '',
    location: data.location || '',
    followerCount: data.followers_count || data.follower_count || 0,
    connectionCount: data.connections_count || data.connection_count || 0,

    // Current position
    currentPosition: data.current_company ? {
      title: data.current_company_title || data.job_title || '',
      company: data.current_company || '',
      duration: data.current_company_duration || ''
    } : null,

    // Experience history
    experience: (data.experience || []).slice(0, 5).map(exp => ({
      title: exp.title || '',
      company: exp.company || exp.company_name || '',
      duration: exp.duration || '',
      description: exp.description || ''
    })),

    // Education
    education: (data.education || []).slice(0, 3).map(edu => ({
      school: edu.school || edu.school_name || '',
      degree: edu.degree || '',
      field: edu.field_of_study || edu.field || '',
      years: edu.years || edu.duration || ''
    })),

    // Skills
    skills: (data.skills || []).slice(0, 10),

    // Recent activity (if available)
    recentPosts: (data.posts || data.recent_posts || []).slice(0, 5).map(post => ({
      text: post.text || post.content || '',
      likes: post.likes || post.reactions || 0,
      comments: post.comments || 0,
      date: post.date || post.posted_date || ''
    })),

    // Profile URL
    profileUrl: data.url || data.profile_url || ''
  };
}

/**
 * Normalize LinkedIn URL to standard format
 */
function normalizeLinkedInUrl(url) {
  if (!url) return null;

  let normalized = url.trim();

  // Handle various LinkedIn URL formats
  const patterns = [
    /linkedin\.com\/in\/([^\/\?]+)/i,
    /linkedin\.com\/pub\/([^\/\?]+)/i
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      return `https://www.linkedin.com/in/${match[1]}`;
    }
  }

  // If it's already a valid LinkedIn URL
  if (normalized.includes('linkedin.com/in/')) {
    // Ensure https
    if (!normalized.startsWith('http')) {
      normalized = 'https://' + normalized;
    }
    return normalized.split('?')[0]; // Remove query params
  }

  return null;
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format LinkedIn data for inclusion in the brief
 */
export function summarizeLinkedInData(linkedInData) {
  if (!linkedInData.success || !linkedInData.profile) {
    return 'LinkedIn data unavailable.';
  }

  const p = linkedInData.profile;
  const parts = [];

  parts.push(`**Name:** ${p.name}`);
  parts.push(`**Headline:** ${p.headline}`);

  if (p.location) {
    parts.push(`**Location:** ${p.location}`);
  }

  if (p.followerCount) {
    parts.push(`**Followers:** ${p.followerCount.toLocaleString()}`);
  }

  if (p.summary) {
    parts.push(`\n**About:**\n${p.summary.slice(0, 500)}${p.summary.length > 500 ? '...' : ''}`);
  }

  if (p.currentPosition) {
    parts.push(`\n**Current Role:** ${p.currentPosition.title} at ${p.currentPosition.company}`);
  }

  if (p.experience && p.experience.length > 0) {
    parts.push('\n**Experience:**');
    for (const exp of p.experience.slice(0, 3)) {
      parts.push(`- ${exp.title} at ${exp.company} (${exp.duration})`);
    }
  }

  if (p.education && p.education.length > 0) {
    parts.push('\n**Education:**');
    for (const edu of p.education) {
      parts.push(`- ${edu.school}: ${edu.degree} ${edu.field}`);
    }
  }

  if (p.recentPosts && p.recentPosts.length > 0) {
    parts.push('\n**Recent LinkedIn Activity:**');
    for (const post of p.recentPosts.slice(0, 3)) {
      const excerpt = post.text.slice(0, 100);
      parts.push(`- "${excerpt}..." (${post.likes} likes)`);
    }
  }

  return parts.join('\n');
}

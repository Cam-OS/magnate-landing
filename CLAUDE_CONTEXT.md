# Decap CMS Live Preview - Work Session Context

## Problem
The Decap CMS live preview was broken. The preview panel should show a real-time preview matching the actual site design, updating as the user types.

## What Was Done

### 1. Removed `preview: false` from config.yml
- Removed from `pages` collection (line 12-13)
- Removed from `services` collection (line 275-276)
- Removed from `industries` collection (line 422-423)

### 2. Rewrote admin/preview-templates.js
Created preview templates for all page types:
- **BlogPostPreview** - for blog posts (folder collection)
- **IndustryPagePreview** - for industry pages (folder collection)
- **ServicePagePreview** - for service pages (file collection)
- **PagesPreview** - unified preview for main pages (file collection)

The `PagesPreview` detects which page is being edited by checking for unique fields:
- Homepage: detected by `stats` field
- About: detected by `heroSection` field
- Contact: detected by `contactInfo` field
- Services Landing: detected by `servicesHeading` field
- Industries Landing: detected by `industries` field (without `whoThisIsFor`)

### 3. Added CSS loading
```javascript
CMS.registerPreviewStyle('/styles.css');
```

### 4. Added cache-buster to admin/index.html
```html
<script src="/admin/preview-templates.js?v=2"></script>
```

## Current State
- **Service pages**: Preview WORKS
- **Industry pages**: Preview WORKS
- **Blog posts**: Preview WORKS
- **Main pages (homepage, about, contact, etc.)**: Preview shows only hero section with old message "Preview shows hero section. Full page preview available after save."

## Outstanding Issue
The main pages preview is still showing an old cached message that doesn't exist in any project file. This suggests:
1. Aggressive browser caching (possibly service worker)
2. The preview-templates.js might not be executing for the `pages` collection
3. There may be a Decap CMS default preview being used as fallback

## Files Modified
- `admin/config.yml` - removed preview: false
- `admin/preview-templates.js` - complete rewrite with all preview templates
- `admin/index.html` - added cache-buster query string

## To Debug Next Session
1. Check browser DevTools → Application → Service Workers (clear any)
2. Check Network tab to confirm preview-templates.js?v=2 is loading
3. Add console.log at start of PagesPreview render function to verify it's being called
4. Try incrementing cache-buster to `?v=3`
5. Test in completely fresh browser/incognito

## Key Insight
For **file collections** (like `pages` and `services`), you can only register ONE preview template per collection - it applies to all files. That's why `PagesPreview` must detect the page type and render accordingly, rather than registering separate templates for each file.

## Dev Server
Run with: `npx @11ty/eleventy --serve`
Admin URL: http://localhost:8080/admin/

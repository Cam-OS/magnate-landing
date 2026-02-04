// ===========================================
// DECAP CMS PREVIEW TEMPLATES
// ===========================================
console.log('[preview-templates.js] File loaded - v4');

// Register site CSS
CMS.registerPreviewStyle('/styles.css');

// Fix preview scrolling
CMS.registerPreviewStyle(`
  html { overflow-y: scroll !important; height: auto !important; }
  body { overflow: visible !important; height: auto !important; min-height: auto !important; background-attachment: scroll !important; }
`, { raw: true });

// Helper functions
function getData(entry, path, defaultVal) {
  var result = entry.getIn(['data'].concat(path.split('.')));
  return result !== undefined && result !== null ? result : defaultVal;
}

function toJS(val) {
  if (!val) return val;
  return val.toJS ? val.toJS() : val;
}

// ===========================================
// BLOG POST PREVIEW
// ===========================================
var BlogPostPreview = createClass({
  render: function() {
    var entry = this.props.entry;
    var title = getData(entry, 'title', 'Untitled');
    var date = getData(entry, 'date', '');
    var category = getData(entry, 'category', 'Category');
    var intro = getData(entry, 'intro', '');
    var featuredImage = getData(entry, 'featured_image', '');
    var body = this.props.widgetFor('body');

    var formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : '';

    return h('div', {},
      h('section', { className: 'article-hero' },
        h('div', { className: 'container' },
          h('div', { className: 'article-hero-content' },
            h('div', { className: 'article-meta' },
              h('span', { className: 'article-category' }, category),
              h('span', { className: 'meta-separator' }, ' • '),
              h('span', { className: 'article-date' }, formattedDate)
            ),
            h('h1', {}, title),
            h('p', { className: 'article-intro' }, intro)
          )
        )
      ),
      featuredImage ? h('section', { className: 'article-featured-image' },
        h('div', { className: 'container' },
          h('img', { src: this.props.getAsset(featuredImage).toString(), alt: '' })
        )
      ) : null,
      h('article', { className: 'article-body' },
        h('div', { className: 'container' },
          h('div', { className: 'article-content' }, body)
        )
      ),
      h('section', { className: 'cta-section' },
        h('div', { className: 'container' },
          h('h2', {}, 'Ready to build your LinkedIn presence?'),
          h('button', { className: 'btn btn-primary btn-large' }, 'Book a Free Meeting →')
        )
      ),
      h('div', { style: { height: '100px' } })
    );
  }
});

// ===========================================
// INDUSTRY PAGE PREVIEW
// ===========================================
var IndustryPagePreview = createClass({
  render: function() {
    var entry = this.props.entry;
    var hero = toJS(getData(entry, 'hero', {})) || {};
    var whoThisIsFor = toJS(getData(entry, 'whoThisIsFor', {})) || {};
    var whatWeSolve = toJS(getData(entry, 'whatWeSolve', {})) || {};
    var whiteGloveService = toJS(getData(entry, 'whiteGloveService', {})) || {};
    var caseStudies = toJS(getData(entry, 'caseStudies', null));
    var whyChooseUs = toJS(getData(entry, 'whyChooseUs', {})) || {};
    var cta = toJS(getData(entry, 'cta', {})) || {};

    var whoItems = whoThisIsFor.items || [];
    var solveItems = whatWeSolve.items || [];
    var tabs = whiteGloveService.tabs || [];
    var whyItems = whyChooseUs.items || [];

    return h('div', {},
      h('section', { className: 'industry-hero' },
        h('div', { className: 'container' },
          h('div', { className: 'industry-hero-content' },
            h('span', { className: 'section-tag' }, hero.tag || ''),
            h('h1', {}, (hero.headline || '') + ' ', h('span', { className: 'highlight' }, hero.headlineHighlight || '')),
            h('p', { className: 'industry-hero-subtext' }, hero.subtext || ''),
            h('button', { className: 'btn btn-primary btn-large' }, 'Book a Strategy Call →')
          )
        )
      ),
      h('section', { className: 'industry-section' },
        h('div', { className: 'container' },
          h('div', { className: 'industry-flow' },
            h('div', { className: 'industry-flow-item left reveal-visible' },
              h('div', { className: 'industry-flow-content' },
                h('h3', {}, whoThisIsFor.heading || 'Who This Is For'),
                whoThisIsFor.content ? h('p', {}, whoThisIsFor.content) : null,
                whoItems.length > 0 ? h('ul', { className: 'industry-list' },
                  whoItems.map(function(item, i) { return h('li', { key: i }, item); })
                ) : null
              )
            ),
            h('div', { className: 'industry-flow-item right reveal-visible' },
              h('div', { className: 'industry-flow-content' },
                h('h3', {}, whatWeSolve.heading || 'What We Solve'),
                whatWeSolve.intro ? h('p', {}, whatWeSolve.intro) : null,
                solveItems.length > 0 ? h('ul', { className: 'industry-list' },
                  solveItems.map(function(item, i) { return h('li', { key: i }, item); })
                ) : null
              )
            )
          )
        )
      ),
      h('section', { className: 'industry-section alt-bg' },
        h('div', { className: 'container' },
          h('h2', { className: 'section-heading-center' }, whiteGloveService.heading || ''),
          h('div', { className: 'industry-service-tabs' },
            h('div', { className: 'industry-tabs-nav' },
              tabs.map(function(tab, i) {
                return h('button', { key: i, className: 'industry-tab-btn' + (i === 0 ? ' active' : '') }, tab.label || '');
              })
            ),
            h('div', { className: 'industry-tabs-content' },
              tabs.map(function(tab, i) {
                var tabItems = tab.items || [];
                return h('div', { key: i, className: 'industry-tab-panel' + (i === 0 ? ' active' : '') },
                  h('div', { className: 'industry-tab-panel-content' },
                    h('h3', {}, tab.title || ''),
                    h('p', { className: 'industry-tab-lead' }, tab.lead || ''),
                    tabItems.length > 0 ? h('ul', { className: 'industry-list' },
                      tabItems.map(function(item, j) { return h('li', { key: j }, item); })
                    ) : null
                  )
                );
              })
            )
          )
        )
      ),
      h('section', { className: 'industry-section' },
        h('div', { className: 'container' },
          h('div', { className: 'why-choose-block' },
            h('h2', {}, whyChooseUs.heading || ''),
            h('ul', { className: 'why-choose-list' },
              whyItems.map(function(item, i) {
                return h('li', { key: i }, h('span', { className: 'check-icon' }, '✓'), h('span', {}, item));
              })
            ),
            whyChooseUs.closing ? h('p', { className: 'why-choose-closing' }, whyChooseUs.closing) : null
          )
        )
      ),
      h('section', { className: 'industry-cta-section' },
        h('div', { className: 'container' },
          h('h3', {}, cta.headline || ''),
          h('p', { className: 'industry-cta-subtext' }, cta.subtext || ''),
          h('button', { className: 'btn btn-primary btn-large' }, 'Book a Strategy Call →')
        )
      ),
      h('div', { style: { height: '100px' } })
    );
  }
});

// ===========================================
// SERVICE PAGE PREVIEW
// ===========================================
var ServicePagePreview = createClass({
  render: function() {
    var entry = this.props.entry;
    var hero = toJS(getData(entry, 'hero', {})) || {};
    var overview = toJS(getData(entry, 'overview', {})) || {};
    var deliverables = toJS(getData(entry, 'deliverables', {})) || {};
    var process = toJS(getData(entry, 'process', {})) || {};
    var trust = toJS(getData(entry, 'trust', {})) || {};
    var cta = toJS(getData(entry, 'cta', {})) || {};

    var tabs = deliverables.tabs || [];
    var steps = process.steps || [];

    return h('div', {},
      h('section', { className: 'service-detail-hero' },
        h('div', { className: 'container' },
          h('span', { className: 'section-tag' }, hero.tag || ''),
          h('h1', {}, (hero.headline || '') + ' ', h('span', { className: 'highlight' }, hero.headlineHighlight || '')),
          h('p', { className: 'service-detail-subhead' }, hero.subtext || '')
        )
      ),
      h('section', { className: 'service-overview-section' },
        h('div', { className: 'container' },
          h('div', { className: 'service-overview-content' },
            h('h2', {}, overview.heading || ''),
            h('p', { className: 'overview-lead' }, overview.leadText || ''),
            h('p', {}, overview.bodyText || '')
          )
        )
      ),
      h('section', { className: 'service-detail-section deliverables-section' },
        h('div', { className: 'container' },
          h('h2', {}, deliverables.heading || ''),
          h('div', { className: 'tabs-component' },
            h('div', { className: 'tabs-nav' },
              tabs.map(function(tab, i) {
                return h('button', { key: i, className: 'tab-btn' + (i === 0 ? ' active' : '') }, tab.label || '');
              })
            ),
            h('div', { className: 'tabs-content' },
              tabs.map(function(tab, i) {
                return h('div', { key: i, className: 'tab-panel' + (i === 0 ? ' active' : '') },
                  h('div', { className: 'tab-panel-content' },
                    h('h3', {}, tab.title || ''),
                    h('p', { className: 'tab-lead' }, tab.lead || ''),
                    h('p', {}, tab.content || '')
                  )
                );
              })
            )
          )
        )
      ),
      steps.length > 0 ? h('section', { className: 'how-we-work-section' },
        h('div', { className: 'container' },
          h('h2', { className: 'section-title-center' }, process.heading || ''),
          h('div', { className: 'process-timeline' },
            h('div', { className: 'timeline-line' }),
            steps.map(function(step, i) {
              return h('div', { key: i, className: 'process-step process-step-' + (step.position || 'left') + ' revealed' },
                h('div', { className: 'process-step-content scroll-reveal revealed' },
                  h('span', { className: 'process-number' }, step.number || ''),
                  h('h3', {}, step.title || ''),
                  h('p', {}, step.description || '')
                ),
                h('div', { className: 'process-step-dot' })
              );
            })
          )
        )
      ) : null,
      trust.heading ? h('section', { className: 'trust-section' },
        h('div', { className: 'container' },
          h('div', { className: 'trust-grid' },
            h('div', { className: 'trust-content' },
              h('h2', {}, trust.heading || ''),
              h('p', { className: 'trust-lead' }, trust.leadText || ''),
              h('p', { className: 'trust-emphasis' }, trust.emphasisText || ''),
              h('p', {}, trust.bodyText || '')
            )
          )
        )
      ) : null,
      h('section', { className: 'cta-section cta-section-compact' },
        h('div', { className: 'container' },
          h('h2', {}, cta.headline || ''),
          h('button', { className: 'btn btn-primary btn-large' }, (cta.buttonText || 'Book a Call') + ' →')
        )
      ),
      h('div', { style: { height: '100px' } })
    );
  }
});

// ===========================================
// HOMEPAGE PREVIEW
// ===========================================
var HomepagePreview = createClass({
  render: function() {
    var entry = this.props.entry;
    var hero = toJS(getData(entry, 'hero', {})) || {};
    var stats = toJS(getData(entry, 'stats', [])) || [];
    var valueProps = toJS(getData(entry, 'valueProps', {})) || {};
    var differentiator = toJS(getData(entry, 'differentiator', {})) || {};
    var testimonials = toJS(getData(entry, 'testimonials', {})) || {};
    var cta = toJS(getData(entry, 'cta', {})) || {};

    var features = valueProps.features || [];
    var impactStats = valueProps.impactStats || [];
    var paragraphs = differentiator.paragraphs || [];
    var testimonialItems = testimonials.items || [];

    return h('div', {},
      // Hero
      h('section', { className: 'hero' },
        h('div', { className: 'container' },
          h('div', { className: 'hero-content' },
            h('h1', { className: 'hero-headline' },
              hero.headline || '',
              h('span', { className: 'highlight' }, ' ' + (hero.headlineHighlight1 || '')),
              ' ' + (hero.headlineMiddle || '') + ' ',
              h('span', { className: 'highlight' }, hero.headlineHighlight2 || ''),
              ' ' + (hero.headlineEnd || '')
            ),
            h('p', { className: 'hero-subhead' }, hero.subhead || ''),
            h('div', { className: 'hero-cta' },
              h('button', { className: 'btn btn-primary btn-large' }, hero.primaryCta || 'Book a Call'),
              h('a', { href: '#', className: 'btn btn-secondary btn-large' }, hero.secondaryCta || 'Learn More')
            )
          )
        )
      ),
      // Stats
      stats.length > 0 ? h('section', { className: 'stats-section' },
        h('div', { className: 'container' },
          h('div', { className: 'stats-grid' },
            stats.map(function(stat, i) {
              return h('div', { key: i, className: 'stat-item' },
                h('span', { className: 'stat-number' }, stat.number || ''),
                h('span', { className: 'stat-label' }, stat.label || '')
              );
            })
          )
        )
      ) : null,
      // Value Props
      h('section', { className: 'value-props' },
        h('div', { className: 'container' },
          h('span', { className: 'section-tag' }, valueProps.tag || ''),
          h('h2', {}, valueProps.heading || ''),
          h('p', { className: 'section-intro' }, valueProps.intro || ''),
          features.length > 0 ? h('div', { className: 'features-list' },
            h('h3', {}, valueProps.featuresHeading || ''),
            h('ul', {},
              features.map(function(feature, i) { return h('li', { key: i }, feature); })
            )
          ) : null,
          impactStats.length > 0 ? h('div', { className: 'impact-stats' },
            impactStats.map(function(stat, i) {
              return h('div', { key: i, className: 'impact-stat' },
                h('span', { className: 'impact-number' }, stat.number || ''),
                h('span', { className: 'impact-label' }, stat.label || '')
              );
            })
          ) : null
        )
      ),
      // Differentiator
      h('section', { className: 'differentiator' },
        h('div', { className: 'container' },
          h('span', { className: 'section-tag' }, differentiator.tag || ''),
          h('h2', {},
            (differentiator.heading || '') + ' ',
            h('span', { className: 'highlight' }, differentiator.headlineHighlight || ''),
            ' ' + (differentiator.headlineEnd || '')
          ),
          paragraphs.map(function(p, i) { return h('p', { key: i }, p); }),
          h('button', { className: 'btn btn-primary' }, differentiator.cta || 'Learn More')
        )
      ),
      // Testimonials
      testimonialItems.length > 0 ? h('section', { className: 'testimonials-section' },
        h('div', { className: 'container' },
          h('span', { className: 'section-tag' }, testimonials.tag || ''),
          h('h2', {}, testimonials.heading || ''),
          h('div', { className: 'testimonials-grid' },
            testimonialItems.map(function(item, i) {
              return h('div', { key: i, className: 'testimonial-card' },
                h('p', { className: 'testimonial-quote' }, item.quote || ''),
                h('div', { className: 'testimonial-author' },
                  h('span', { className: 'author-title' }, item.authorTitle || ''),
                  h('span', { className: 'author-company' }, item.authorCompany || '')
                )
              );
            })
          )
        )
      ) : null,
      // CTA
      h('section', { className: 'cta-section' },
        h('div', { className: 'container' },
          h('h2', {},
            (cta.heading || '') + ' ',
            h('span', { className: 'highlight' }, cta.headingHighlight || '')
          ),
          h('p', {}, cta.subtext || ''),
          h('button', { className: 'btn btn-primary btn-large' }, cta.buttonText || 'Book a Call')
        )
      ),
      h('div', { style: { height: '100px' } })
    );
  }
});

// ===========================================
// ABOUT PAGE PREVIEW
// ===========================================
var AboutPagePreview = createClass({
  render: function() {
    var entry = this.props.entry;
    var heroSection = toJS(getData(entry, 'heroSection', {})) || {};
    var bothSides = toJS(getData(entry, 'bothSides', {})) || {};
    var philosophy = toJS(getData(entry, 'philosophy', {})) || {};
    var ross = toJS(getData(entry, 'ross', {})) || {};
    var cta = toJS(getData(entry, 'cta', {})) || {};

    var heroParagraphs = heroSection.paragraphs || [];
    var cards = philosophy.cards || [];
    var rossParagraphs = ross.paragraphs || [];
    var journalism = bothSides.journalism || {};
    var entrepreneurship = bothSides.entrepreneurship || {};

    return h('div', {},
      // Hero
      h('section', { className: 'about-hero' },
        h('div', { className: 'container' },
          h('span', { className: 'section-tag' }, heroSection.tag || ''),
          h('h1', {},
            (heroSection.headline || '') + ' ',
            h('span', { className: 'highlight' }, heroSection.headlineHighlight || ''),
            ' ' + (heroSection.headlineEnd || '')
          ),
          heroParagraphs.map(function(p, i) { return h('p', { key: i }, p); }),
          heroSection.emphasis ? h('p', { className: 'emphasis' }, heroSection.emphasis) : null
        )
      ),
      // Both Sides
      h('section', { className: 'both-sides-section' },
        h('div', { className: 'container' },
          h('h2', {},
            (bothSides.headline || '') + ' ',
            h('span', { className: 'highlight' }, bothSides.headlineHighlight || ''),
            ' ' + (bothSides.headlineEnd || '')
          ),
          h('div', { className: 'sides-grid' },
            h('div', { className: 'side-card' },
              h('span', { className: 'side-label' }, journalism.label || ''),
              h('h3', {}, journalism.title || ''),
              h('p', {}, journalism.content || ''),
              journalism.highlight ? h('p', { className: 'highlight-text' }, journalism.highlight) : null
            ),
            h('div', { className: 'side-card' },
              h('span', { className: 'side-label' }, entrepreneurship.label || ''),
              h('h3', {}, entrepreneurship.title || ''),
              h('p', {}, entrepreneurship.content || ''),
              entrepreneurship.highlight ? h('p', { className: 'highlight-text' }, entrepreneurship.highlight) : null
            )
          ),
          h('p', { className: 'conclusion' }, bothSides.conclusion || ''),
          h('p', {}, bothSides.conclusionText || '')
        )
      ),
      // Philosophy
      cards.length > 0 ? h('section', { className: 'philosophy-section' },
        h('div', { className: 'container' },
          h('span', { className: 'section-tag' }, philosophy.tag || ''),
          h('h2', {}, philosophy.headline || ''),
          h('div', { className: 'philosophy-cards' },
            cards.map(function(card, i) {
              return h('div', { key: i, className: 'philosophy-card' },
                h('h3', {}, card.title || ''),
                h('p', {}, card.content || '')
              );
            })
          )
        )
      ) : null,
      // Ross Section
      h('section', { className: 'ross-section' },
        h('div', { className: 'container' },
          h('span', { className: 'section-tag' }, ross.tag || ''),
          h('h2', {}, ross.headline || ''),
          rossParagraphs.map(function(p, i) { return h('p', { key: i }, p); }),
          h('p', { className: 'closing' }, ross.closing || ''),
          h('button', { className: 'btn btn-primary' }, ross.ctaText || 'Learn More')
        )
      ),
      // CTA
      h('section', { className: 'cta-section' },
        h('div', { className: 'container' },
          h('h2', {}, cta.headline || ''),
          h('p', {}, cta.subtext || ''),
          h('button', { className: 'btn btn-primary btn-large' }, cta.buttonText || 'Book a Call')
        )
      ),
      h('div', { style: { height: '100px' } })
    );
  }
});

// ===========================================
// CONTACT PAGE PREVIEW
// ===========================================
var ContactPagePreview = createClass({
  render: function() {
    var entry = this.props.entry;
    var hero = toJS(getData(entry, 'hero', {})) || {};
    var contactInfo = toJS(getData(entry, 'contactInfo', {})) || {};

    var items = contactInfo.items || [];

    return h('div', {},
      // Hero
      h('section', { className: 'contact-hero' },
        h('div', { className: 'container' },
          h('h1', {},
            (hero.headline || '') + ' ',
            h('span', { className: 'highlight' }, hero.headlineHighlight || '')
          ),
          h('p', { className: 'hero-subhead' }, hero.subhead || '')
        )
      ),
      // Contact Info
      h('section', { className: 'contact-info-section' },
        h('div', { className: 'container' },
          h('h2', {}, contactInfo.heading || ''),
          h('div', { className: 'contact-items' },
            items.map(function(item, i) {
              return h('div', { key: i, className: 'contact-item' },
                h('strong', {}, item.boldText || ''),
                h('p', {}, item.text || '')
              );
            })
          ),
          h('p', {}, contactInfo.directContactText || ''),
          h('a', { href: 'mailto:' + (contactInfo.email || ''), className: 'email-link' }, contactInfo.email || '')
        )
      ),
      h('div', { style: { height: '100px' } })
    );
  }
});

// ===========================================
// SERVICES LANDING PREVIEW
// ===========================================
var ServicesLandingPreview = createClass({
  render: function() {
    var entry = this.props.entry;
    var hero = toJS(getData(entry, 'hero', {})) || {};
    var servicesHeading = getData(entry, 'servicesHeading', '');
    var services = toJS(getData(entry, 'services', [])) || [];
    var process = toJS(getData(entry, 'process', {})) || {};
    var cta = toJS(getData(entry, 'cta', {})) || {};

    var steps = process.steps || [];

    return h('div', {},
      // Hero
      h('section', { className: 'service-detail-hero' },
        h('div', { className: 'container' },
          h('h1', {},
            (hero.headline || '') + ' ',
            h('span', { className: 'highlight' }, hero.headlineHighlight || '')
          ),
          h('p', { className: 'service-detail-subhead' }, hero.subhead || '')
        )
      ),
      // Services List
      h('section', { className: 'services-list-section' },
        h('div', { className: 'container' },
          h('h2', {}, servicesHeading || ''),
          h('div', { className: 'services-grid' },
            services.map(function(service, i) {
              return h('div', { key: i, className: 'service-card' },
                h('h3', {}, service.title || ''),
                h('p', {}, service.description || ''),
                h('a', { href: service.link || '#', className: 'service-link' }, 'Learn More →')
              );
            })
          )
        )
      ),
      // Process
      steps.length > 0 ? h('section', { className: 'how-we-work-section' },
        h('div', { className: 'container' },
          h('h2', { className: 'section-title-center' }, process.heading || ''),
          h('div', { className: 'process-timeline' },
            h('div', { className: 'timeline-line' }),
            steps.map(function(step, i) {
              return h('div', { key: i, className: 'process-step process-step-' + (step.position || 'left') + ' revealed' },
                h('div', { className: 'process-step-content scroll-reveal revealed' },
                  h('span', { className: 'process-number' }, step.number || ''),
                  h('h3', {}, step.title || ''),
                  h('p', {}, step.description || '')
                ),
                h('div', { className: 'process-step-dot' })
              );
            })
          )
        )
      ) : null,
      // CTA
      h('section', { className: 'cta-section' },
        h('div', { className: 'container' },
          h('h2', {}, cta.headline || ''),
          h('button', { className: 'btn btn-primary btn-large' }, cta.buttonText || 'Book a Call')
        )
      ),
      h('div', { style: { height: '100px' } })
    );
  }
});

// ===========================================
// INDUSTRIES LANDING PREVIEW
// ===========================================
var IndustriesLandingPreview = createClass({
  render: function() {
    var entry = this.props.entry;
    var hero = toJS(getData(entry, 'hero', {})) || {};
    var industries = toJS(getData(entry, 'industries', [])) || [];
    var cta = toJS(getData(entry, 'cta', {})) || {};

    return h('div', {},
      // Hero
      h('section', { className: 'service-detail-hero' },
        h('div', { className: 'container' },
          h('h1', {},
            (hero.headline || '') + ' ',
            h('span', { className: 'highlight' }, hero.headlineHighlight || '')
          ),
          h('p', { className: 'service-detail-subhead' }, hero.subhead || '')
        )
      ),
      // Industries List
      h('section', { className: 'industries-list-section' },
        h('div', { className: 'container' },
          h('div', { className: 'industries-grid' },
            industries.map(function(industry, i) {
              return h('div', { key: i, className: 'industry-card' },
                h('h3', {}, industry.title || ''),
                h('p', {}, industry.description || ''),
                h('a', { href: industry.link || '#', className: 'industry-link' }, 'Learn More →')
              );
            })
          )
        )
      ),
      // CTA
      h('section', { className: 'cta-section' },
        h('div', { className: 'container' },
          h('h2', {}, cta.headline || ''),
          h('p', {}, cta.subtext || ''),
          h('button', { className: 'btn btn-primary btn-large' }, cta.buttonText || 'Book a Call')
        )
      ),
      h('div', { style: { height: '100px' } })
    );
  }
});

// ===========================================
// UNIFIED PAGES PREVIEW (handles all main pages)
// ===========================================
var PagesPreview = createClass({
  render: function() {
    console.log('[PagesPreview] render() called');
    var entry = this.props.entry;
    var data = entry.get('data');

    // Get all field keys to detect page type
    var keys = data ? data.keySeq().toArray() : [];
    console.log('[PagesPreview] Detected keys:', keys);

    // Detect page type by unique field presence
    var isHomepage = keys.indexOf('stats') !== -1;
    var isAbout = keys.indexOf('heroSection') !== -1;
    var isContact = keys.indexOf('contactInfo') !== -1;
    var isServicesLanding = keys.indexOf('servicesHeading') !== -1;
    var isIndustriesLanding = keys.indexOf('industries') !== -1 && keys.indexOf('whoThisIsFor') === -1;

    // Render based on detected page type
    if (isHomepage) {
      var hero = toJS(getData(entry, 'hero', {})) || {};
      var stats = toJS(getData(entry, 'stats', [])) || [];
      var valueProps = toJS(getData(entry, 'valueProps', {})) || {};
      var differentiator = toJS(getData(entry, 'differentiator', {})) || {};
      var testimonials = toJS(getData(entry, 'testimonials', {})) || {};
      var cta = toJS(getData(entry, 'cta', {})) || {};
      var features = valueProps.features || [];
      var impactStats = valueProps.impactStats || [];
      var paragraphs = differentiator.paragraphs || [];
      var testimonialItems = testimonials.items || [];

      return h('div', {},
        h('section', { className: 'hero' },
          h('div', { className: 'container' },
            h('div', { className: 'hero-content' },
              h('h1', { className: 'hero-headline' },
                hero.headline || '',
                h('span', { className: 'highlight' }, ' ' + (hero.headlineHighlight1 || '')),
                ' ' + (hero.headlineMiddle || '') + ' ',
                h('span', { className: 'highlight' }, hero.headlineHighlight2 || ''),
                ' ' + (hero.headlineEnd || '')
              ),
              h('p', { className: 'hero-subhead' }, hero.subhead || ''),
              h('div', { className: 'hero-cta' },
                h('button', { className: 'btn btn-primary btn-large' }, hero.primaryCta || 'Book a Call'),
                h('a', { href: '#', className: 'btn btn-secondary btn-large' }, hero.secondaryCta || 'Learn More')
              )
            )
          )
        ),
        stats.length > 0 ? h('section', { className: 'stats-section' },
          h('div', { className: 'container' },
            h('div', { className: 'stats-grid' },
              stats.map(function(stat, i) {
                return h('div', { key: i, className: 'stat-item' },
                  h('span', { className: 'stat-number' }, stat.number || ''),
                  h('span', { className: 'stat-label' }, stat.label || '')
                );
              })
            )
          )
        ) : null,
        h('section', { className: 'value-props' },
          h('div', { className: 'container' },
            h('span', { className: 'section-tag' }, valueProps.tag || ''),
            h('h2', {}, valueProps.heading || ''),
            h('p', { className: 'section-intro' }, valueProps.intro || ''),
            features.length > 0 ? h('ul', {},
              features.map(function(f, i) { return h('li', { key: i }, f); })
            ) : null
          )
        ),
        h('section', { className: 'differentiator' },
          h('div', { className: 'container' },
            h('span', { className: 'section-tag' }, differentiator.tag || ''),
            h('h2', {}, (differentiator.heading || '') + ' ', h('span', { className: 'highlight' }, differentiator.headlineHighlight || '')),
            paragraphs.map(function(p, i) { return h('p', { key: i }, p); })
          )
        ),
        testimonialItems.length > 0 ? h('section', { className: 'testimonials-section' },
          h('div', { className: 'container' },
            h('span', { className: 'section-tag' }, testimonials.tag || ''),
            h('h2', {}, testimonials.heading || ''),
            h('div', { className: 'testimonials-grid' },
              testimonialItems.map(function(item, i) {
                return h('div', { key: i, className: 'testimonial-card' },
                  h('p', { className: 'testimonial-quote' }, item.quote || ''),
                  h('span', { className: 'author-title' }, item.authorTitle || '')
                );
              })
            )
          )
        ) : null,
        h('section', { className: 'cta-section' },
          h('div', { className: 'container' },
            h('h2', {}, (cta.heading || '') + ' ', h('span', { className: 'highlight' }, cta.headingHighlight || '')),
            h('p', {}, cta.subtext || ''),
            h('button', { className: 'btn btn-primary btn-large' }, cta.buttonText || 'Book a Call')
          )
        ),
        h('div', { style: { height: '100px' } })
      );
    }

    if (isAbout) {
      var heroSection = toJS(getData(entry, 'heroSection', {})) || {};
      var bothSides = toJS(getData(entry, 'bothSides', {})) || {};
      var philosophy = toJS(getData(entry, 'philosophy', {})) || {};
      var ross = toJS(getData(entry, 'ross', {})) || {};
      var cta = toJS(getData(entry, 'cta', {})) || {};
      var heroParagraphs = heroSection.paragraphs || [];
      var cards = philosophy.cards || [];
      var rossParagraphs = ross.paragraphs || [];
      var journalism = bothSides.journalism || {};
      var entrepreneurship = bothSides.entrepreneurship || {};

      return h('div', {},
        h('section', { className: 'about-hero' },
          h('div', { className: 'container' },
            h('span', { className: 'section-tag' }, heroSection.tag || ''),
            h('h1', {}, (heroSection.headline || '') + ' ', h('span', { className: 'highlight' }, heroSection.headlineHighlight || ''), ' ' + (heroSection.headlineEnd || '')),
            heroParagraphs.map(function(p, i) { return h('p', { key: i }, p); }),
            heroSection.emphasis ? h('p', { className: 'emphasis' }, heroSection.emphasis) : null
          )
        ),
        h('section', { className: 'both-sides-section' },
          h('div', { className: 'container' },
            h('h2', {}, (bothSides.headline || '') + ' ', h('span', { className: 'highlight' }, bothSides.headlineHighlight || '')),
            h('div', { className: 'sides-grid', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' } },
              h('div', { className: 'side-card' },
                h('span', { className: 'side-label' }, journalism.label || ''),
                h('h3', {}, journalism.title || ''),
                h('p', {}, journalism.content || '')
              ),
              h('div', { className: 'side-card' },
                h('span', { className: 'side-label' }, entrepreneurship.label || ''),
                h('h3', {}, entrepreneurship.title || ''),
                h('p', {}, entrepreneurship.content || '')
              )
            ),
            h('p', { className: 'conclusion' }, bothSides.conclusion || ''),
            h('p', {}, bothSides.conclusionText || '')
          )
        ),
        cards.length > 0 ? h('section', { className: 'philosophy-section' },
          h('div', { className: 'container' },
            h('span', { className: 'section-tag' }, philosophy.tag || ''),
            h('h2', {}, philosophy.headline || ''),
            h('div', { className: 'philosophy-cards', style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' } },
              cards.map(function(card, i) {
                return h('div', { key: i, className: 'philosophy-card' },
                  h('h3', {}, card.title || ''),
                  h('p', {}, card.content || '')
                );
              })
            )
          )
        ) : null,
        h('section', { className: 'ross-section' },
          h('div', { className: 'container' },
            h('span', { className: 'section-tag' }, ross.tag || ''),
            h('h2', {}, ross.headline || ''),
            rossParagraphs.map(function(p, i) { return h('p', { key: i }, p); }),
            h('p', { className: 'closing' }, ross.closing || '')
          )
        ),
        h('section', { className: 'cta-section' },
          h('div', { className: 'container' },
            h('h2', {}, cta.headline || ''),
            h('p', {}, cta.subtext || ''),
            h('button', { className: 'btn btn-primary btn-large' }, cta.buttonText || 'Book a Call')
          )
        ),
        h('div', { style: { height: '100px' } })
      );
    }

    if (isContact) {
      var hero = toJS(getData(entry, 'hero', {})) || {};
      var contactInfo = toJS(getData(entry, 'contactInfo', {})) || {};
      var items = contactInfo.items || [];

      return h('div', {},
        h('section', { className: 'contact-hero' },
          h('div', { className: 'container' },
            h('h1', {}, (hero.headline || '') + ' ', h('span', { className: 'highlight' }, hero.headlineHighlight || '')),
            h('p', { className: 'hero-subhead' }, hero.subhead || '')
          )
        ),
        h('section', { className: 'contact-info-section' },
          h('div', { className: 'container' },
            h('h2', {}, contactInfo.heading || ''),
            h('div', { className: 'contact-items' },
              items.map(function(item, i) {
                return h('div', { key: i, className: 'contact-item' },
                  h('strong', {}, item.boldText || ''),
                  h('p', {}, item.text || '')
                );
              })
            ),
            h('p', {}, contactInfo.directContactText || ''),
            h('a', { href: 'mailto:' + (contactInfo.email || ''), className: 'email-link' }, contactInfo.email || '')
          )
        ),
        h('div', { style: { height: '100px' } })
      );
    }

    if (isServicesLanding) {
      var hero = toJS(getData(entry, 'hero', {})) || {};
      var servicesHeading = getData(entry, 'servicesHeading', '');
      var services = toJS(getData(entry, 'services', [])) || [];
      var process = toJS(getData(entry, 'process', {})) || {};
      var cta = toJS(getData(entry, 'cta', {})) || {};
      var steps = process.steps || [];

      return h('div', {},
        h('section', { className: 'service-detail-hero' },
          h('div', { className: 'container' },
            h('h1', {}, (hero.headline || '') + ' ', h('span', { className: 'highlight' }, hero.headlineHighlight || '')),
            h('p', { className: 'service-detail-subhead' }, hero.subhead || '')
          )
        ),
        h('section', { className: 'services-list-section' },
          h('div', { className: 'container' },
            h('h2', {}, servicesHeading || ''),
            h('div', { className: 'services-grid', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' } },
              services.map(function(service, i) {
                return h('div', { key: i, className: 'service-card', style: { background: 'var(--bg-card)', padding: '32px', borderRadius: '12px' } },
                  h('h3', {}, service.title || ''),
                  h('p', {}, service.description || ''),
                  h('a', { href: '#', className: 'service-link' }, 'Learn More →')
                );
              })
            )
          )
        ),
        steps.length > 0 ? h('section', { className: 'how-we-work-section' },
          h('div', { className: 'container' },
            h('h2', { className: 'section-title-center' }, process.heading || ''),
            h('div', { className: 'process-timeline' },
              steps.map(function(step, i) {
                return h('div', { key: i, className: 'process-step revealed', style: { marginBottom: '40px' } },
                  h('span', { className: 'process-number' }, step.number || ''),
                  h('h3', {}, step.title || ''),
                  h('p', {}, step.description || '')
                );
              })
            )
          )
        ) : null,
        h('section', { className: 'cta-section' },
          h('div', { className: 'container' },
            h('h2', {}, cta.headline || ''),
            h('button', { className: 'btn btn-primary btn-large' }, cta.buttonText || 'Book a Call')
          )
        ),
        h('div', { style: { height: '100px' } })
      );
    }

    if (isIndustriesLanding) {
      var hero = toJS(getData(entry, 'hero', {})) || {};
      var industries = toJS(getData(entry, 'industries', [])) || [];
      var cta = toJS(getData(entry, 'cta', {})) || {};

      return h('div', {},
        h('section', { className: 'service-detail-hero' },
          h('div', { className: 'container' },
            h('h1', {}, (hero.headline || '') + ' ', h('span', { className: 'highlight' }, hero.headlineHighlight || '')),
            h('p', { className: 'service-detail-subhead' }, hero.subhead || '')
          )
        ),
        h('section', { className: 'industries-list-section' },
          h('div', { className: 'container' },
            h('div', { className: 'industries-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' } },
              industries.map(function(industry, i) {
                return h('div', { key: i, className: 'industry-card', style: { background: 'var(--bg-card)', padding: '32px', borderRadius: '12px' } },
                  h('h3', {}, industry.title || ''),
                  h('p', {}, industry.description || ''),
                  h('a', { href: '#', className: 'industry-link' }, 'Learn More →')
                );
              })
            )
          )
        ),
        h('section', { className: 'cta-section' },
          h('div', { className: 'container' },
            h('h2', {}, cta.headline || ''),
            h('p', {}, cta.subtext || ''),
            h('button', { className: 'btn btn-primary btn-large' }, cta.buttonText || 'Book a Call')
          )
        ),
        h('div', { style: { height: '100px' } })
      );
    }

    // Fallback for unknown page type
    var hero = toJS(getData(entry, 'hero', {})) || {};
    var title = getData(entry, 'title', 'Page');
    return h('div', {},
      h('section', { className: 'service-detail-hero' },
        h('div', { className: 'container' },
          h('h1', {}, (hero.headline || title || '')),
          hero.subhead ? h('p', {}, hero.subhead) : null
        )
      ),
      h('div', { style: { height: '100px' } })
    );
  }
});

// ===========================================
// REGISTER ALL PREVIEW TEMPLATES
// ===========================================

// Blog - folder collection
CMS.registerPreviewTemplate('blog', BlogPostPreview);

// Industries - folder collection
CMS.registerPreviewTemplate('industries', IndustryPagePreview);

// Services - file collection
CMS.registerPreviewTemplate('services', ServicePagePreview);

// Pages - file collection (register each file individually)
CMS.registerPreviewTemplate('homepage', PagesPreview);
CMS.registerPreviewTemplate('about', PagesPreview);
CMS.registerPreviewTemplate('contact', PagesPreview);
CMS.registerPreviewTemplate('services-landing', PagesPreview);
CMS.registerPreviewTemplate('industries-landing', PagesPreview);


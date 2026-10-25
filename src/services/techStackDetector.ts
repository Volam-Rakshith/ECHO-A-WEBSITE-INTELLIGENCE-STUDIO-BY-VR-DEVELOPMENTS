import { TechStackItem } from '../types';

interface TechRule {
  name: string;
  category: TechStackItem['category'];
  description: string;
  test: (html: string, doc: Document, scripts: string[], styles: string[]) => { match: boolean; version?: string };
}

const TECH_RULES: TechRule[] = [
  // 1. Frameworks
  {
    name: 'Next.js',
    category: 'framework',
    description: 'React Production Framework with SSR/SSG',
    test: (html, doc, scripts) => {
      const match =
        html.includes('__NEXT_DATA__') ||
        html.includes('/_next/') ||
        doc.querySelector('#__next') !== null ||
        scripts.some(s => s.includes('/_next/'));
      return { match };
    },
  },
  {
    name: 'React',
    category: 'framework',
    description: 'Declarative component-based UI library',
    test: (html, doc, scripts) => {
      const match =
        html.includes('data-reactroot') ||
        html.includes('__NEXT_DATA__') ||
        html.includes('/_next/') ||
        doc.querySelector('#__next') !== null ||
        html.includes('react.production.min.js') ||
        scripts.some(s => /react(-dom)?(\.production)?/i.test(s));
      return { match };
    },
  },
  {
    name: 'Vue.js',
    category: 'framework',
    description: 'Progressive component JavaScript framework',
    test: (html, doc, scripts) => {
      const match =
        html.includes('data-v-') ||
        html.includes('__NUXT__') ||
        doc.querySelector('[data-v-]') !== null ||
        scripts.some(s => /vue(\.runtime)?(\.min)?\.js/i.test(s));
      return { match };
    },
  },
  {
    name: 'Nuxt.js',
    category: 'framework',
    description: 'Intuitive Vue Framework for SSR & static generation',
    test: (html, doc, scripts) => {
      const match = html.includes('__NUXT__') || scripts.some(s => s.includes('/_nuxt/'));
      return { match };
    },
  },
  {
    name: 'Angular',
    category: 'framework',
    description: 'Enterprise web framework by Google',
    test: (html, doc, scripts) => {
      const match =
        doc.querySelector('[ng-version]') !== null ||
        doc.querySelector('app-root') !== null ||
        scripts.some(s => /angular(\.min)?\.js/i.test(s));
      const ngVer = doc.querySelector('[ng-version]')?.getAttribute('ng-version') || undefined;
      return { match, version: ngVer };
    },
  },
  {
    name: 'Svelte / SvelteKit',
    category: 'framework',
    description: 'Cybernetically enhanced reactive compiler',
    test: (html, doc, scripts) => {
      const match =
        html.includes('__svelte__') ||
        html.includes('svelte-') ||
        scripts.some(s => s.includes('_app/immutable'));
      return { match };
    },
  },
  {
    name: 'jQuery',
    category: 'library',
    description: 'Fast, small, feature-rich DOM manipulation library',
    test: (html, doc, scripts) => {
      const match =
        scripts.some(s => /jquery[-.]\d/i.test(s) || s.includes('jquery.min.js') || s.includes('jquery.js'));
      const verMatch = html.match(/jquery[/-]([0-9.]+)/i);
      return { match, version: verMatch ? verMatch[1] : undefined };
    },
  },
  {
    name: 'Alpine.js',
    category: 'library',
    description: 'Lightweight reactive framework for HTML',
    test: html => {
      const match = html.includes('x-data=') || html.includes('x-bind=') || html.includes('alpinejs');
      return { match };
    },
  },

  // 2. Styling
  {
    name: 'Tailwind CSS',
    category: 'styling',
    description: 'Utility-first modern CSS framework',
    test: (html, doc, scripts, styles) => {
      const match =
        html.includes('tailwindcss') ||
        styles.some(s => s.includes('tailwindcss') || s.includes('--tw-')) ||
        html.includes('--tw-shadow') ||
        html.includes('--tw-ring');
      return { match };
    },
  },
  {
    name: 'Bootstrap',
    category: 'styling',
    description: 'Mobile-first responsive styling framework',
    test: (html, doc, scripts, styles) => {
      const match =
        styles.some(s => s.includes('bootstrap') || s.includes('.col-md-') || s.includes('.navbar-nav')) ||
        scripts.some(s => s.includes('bootstrap.bundle') || s.includes('bootstrap.min.js'));
      return { match };
    },
  },

  // 3. CMS & E-Commerce
  {
    name: 'WordPress',
    category: 'cms',
    description: 'World leading open-source content management system',
    test: (html, doc) => {
      const gen = doc.querySelector('meta[name="generator"]')?.getAttribute('content') || '';
      const match =
        gen.toLowerCase().includes('wordpress') ||
        html.includes('wp-content/') ||
        html.includes('wp-includes/');
      const verMatch = gen.match(/WordPress\s*([0-9.]+)/i);
      return { match, version: verMatch ? verMatch[1] : undefined };
    },
  },
  {
    name: 'Shopify',
    category: 'cms',
    description: 'Global commerce platform for online stores',
    test: html => {
      const match =
        html.includes('cdn.shopify.com') ||
        html.includes('Shopify.theme') ||
        html.includes('shopify-features');
      return { match };
    },
  },
  {
    name: 'Webflow',
    category: 'cms',
    description: 'Visual development platform for custom websites',
    test: (html, doc) => {
      const gen = doc.querySelector('meta[name="generator"]')?.getAttribute('content') || '';
      const match = gen.toLowerCase().includes('webflow') || html.includes('data-wf-page');
      return { match };
    },
  },

  // 4. Infrastructure & CDNs
  {
    name: 'Cloudflare',
    category: 'infrastructure',
    description: 'Global CDN, DDoS mitigation, and edge proxy',
    test: html => {
      const match =
        html.includes('challenges.cloudflare.com') ||
        html.includes('static.cloudflareinsights.com') ||
        html.includes('__cf_bm');
      return { match };
    },
  },
  {
    name: 'Vercel Edge',
    category: 'infrastructure',
    description: 'Frontend cloud platform with serverless edge compute',
    test: (html, doc, scripts) => {
      const match = html.includes('/_vercel/') || scripts.some(s => s.includes('_vercel'));
      return { match };
    },
  },

  // 5. Analytics
  {
    name: 'Google Analytics 4 / GTM',
    category: 'analytics',
    description: 'Web traffic telemetry and tag manager container',
    test: (html, doc, scripts) => {
      const match =
        html.includes('googletagmanager.com') ||
        html.includes('google-analytics.com') ||
        scripts.some(s => s.includes('gtm.js') || s.includes('gtag'));
      return { match };
    },
  },
  {
    name: 'Meta Pixel',
    category: 'analytics',
    description: 'Conversion tracking pixel by Meta',
    test: html => {
      const match = html.includes('fbevents.js') || html.includes('fbq(');
      return { match };
    },
  },

  // 6. Tools & Libraries
  {
    name: 'Font Awesome',
    category: 'library',
    description: 'Icon library and toolkit',
    test: (html, doc, scripts, styles) => {
      const match =
        styles.some(s => s.includes('font-awesome') || s.includes('fontawesome')) ||
        html.includes('fa-solid') ||
        html.includes('fa-brands');
      return { match };
    },
  },
  {
    name: 'Prism.js',
    category: 'library',
    description: 'Lightweight, extensible syntax highlighter',
    test: html => {
      const match = html.includes('prism.js') || html.includes('prismjs') || html.includes('language-');
      return { match };
    },
  },
];

export function detectTechStack(html: string, doc: Document, externalScripts: string[], externalStyles: string[]): TechStackItem[] {
  const detected: TechStackItem[] = [];

  for (const rule of TECH_RULES) {
    const result = rule.test(html, doc, externalScripts, externalStyles);
    if (result.match) {
      detected.push({
        name: rule.name,
        category: rule.category,
        version: result.version,
        confidence: 'HIGH',
        description: rule.description,
      });
    }
  }

  // If no framework found, add Modern HTML5/CSS3
  if (!detected.some(t => t.category === 'framework')) {
    detected.unshift({
      name: 'HTML5 / Modern ECMAScript',
      category: 'framework',
      confidence: 'HIGH',
      description: 'Standard semantic document structure with vanilla Web APIs',
    });
  }

  return detected;
}

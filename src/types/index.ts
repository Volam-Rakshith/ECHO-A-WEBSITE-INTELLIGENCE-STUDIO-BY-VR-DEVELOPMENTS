export type RetrievalStatus =
  | 'RETRIEVED'
  | 'DISCOVERED_ONLY'
  | 'USER_PROVIDED'
  | 'INFERRED'
  | 'UNAVAILABLE'
  | 'FAILED';

export type ResourceKind =
  | 'html'
  | 'stylesheet'
  | 'script'
  | 'image'
  | 'font'
  | 'manifest'
  | 'other';

export interface ResourceFile {
  id: string;
  name: string;
  url: string;
  kind: ResourceKind;
  status: RetrievalStatus;
  content?: string;
  sizeBytes?: number;
  mimeType?: string;
  strategyUsed?: string;
  fetchTimeMs?: number;
  errorMessage?: string;
  isInline?: boolean;
}

export interface SecurityAudit {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  isHttps: boolean;
  hasHsts: boolean;
  hasCsp: boolean;
  hasXFrameOptions: boolean;
  hasXContentTypeOptions: boolean;
  referrerPolicy?: string;
  notes: string[];
  riskPoints: string[];
}

export interface TechStackItem {
  name: string;
  category: 'framework' | 'library' | 'cms' | 'styling' | 'analytics' | 'infrastructure' | 'tool';
  version?: string;
  confidence: 'HIGH' | 'MEDIUM';
  description: string;
}

export interface FormAuditItem {
  id?: string;
  name?: string;
  action: string;
  method: string;
  inputCount: number;
  inputs: Array<{ name: string; type: string; required: boolean }>;
  hasCsrf: boolean;
}

export interface SchemaJsonLd {
  type?: string;
  raw: string;
  parsed?: any;
}

export interface MediaQueryToken {
  query: string;
  type: 'mobile' | 'tablet' | 'desktop' | 'dark-mode' | 'print' | 'other';
}

export interface WebsiteMetadata {
  url: string;
  domain: string;
  protocol: string;
  title: string;
  description: string;
  favicon: string | null;
  language: string;
  charset: string;
  canonicalUrl: string | null;
  author: string | null;
  keywords: string[];
  viewport: string | null;
  generator: string | null;
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
  headers?: Record<string, string>;
  security: SecurityAudit;
  techStack: TechStackItem[];
  forms: FormAuditItem[];
  schemas: SchemaJsonLd[];
  mediaQueries: MediaQueryToken[];
}

export interface ExtractedColor {
  hex: string;
  rgb: string;
  hsl: string;
  frequency: number;
  role: 'background' | 'text' | 'accent' | 'border' | 'gradient';
  contrastBlack: number;
  contrastWhite: number;
  wcagRating: 'AAA' | 'AA' | 'FAIL';
}

export interface FontToken {
  family: string;
  source: 'google' | 'face' | 'inline' | 'system';
  weights?: string[];
}

export interface HeadingSample {
  level: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  sample: string;
}

export interface ButtonStyleToken {
  selector: string;
  background: string;
  color: string;
  borderRadius: string;
  border: string;
  padding: string;
}

export interface BrandIntelligence {
  brandName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  fonts: FontToken[];
  headingSamples: HeadingSample[];
  buttonStyles: ButtonStyleToken[];
  shadowTokens: string[];
  borderRadiusTokens: string[];
  cssVariables: Array<{ name: string; value: string }>;
}

export interface HeadingItem {
  level: number;
  text: string;
  id?: string;
}

export interface LinkItem {
  text: string;
  href: string;
  isExternal: boolean;
  rel?: string;
  target?: string;
}

export interface ImageItem {
  src: string;
  alt: string;
  hasAlt: boolean;
  isDecorative: boolean;
}

export interface ContentAnalysis {
  headings: HeadingItem[];
  wordCount: number;
  readingTimeMinutes: number;
  paragraphs: string[];
  links: LinkItem[];
  images: ImageItem[];
}

export interface DOMTreeNode {
  id: string;
  tag: string;
  idAttr?: string;
  classes: string[];
  attributes: Record<string, string>;
  childCount: number;
  textPreview?: string;
  children?: DOMTreeNode[];
}

export interface RelationshipNode {
  id: string;
  label: string;
  type: 'document' | 'stylesheet' | 'script' | 'image' | 'font' | 'manifest' | 'external';
  status: RetrievalStatus;
  size?: number;
  url?: string;
}

export interface RelationshipLink {
  source: string;
  target: string;
  relationship: 'loads' | 'links_to' | 'references' | 'styles';
}

export interface DiagnosticEvent {
  id: string;
  timestamp: number;
  stage: string;
  strategy: string;
  targetUrl: string;
  status: 'pending' | 'success' | 'warn' | 'failed';
  message: string;
  details?: string;
  durationMs?: number;
}

export interface AnalysisStats {
  htmlStatus: RetrievalStatus;
  totalDiscovered: number;
  totalRetrieved: number;
  totalFailed: number;
  totalSize: number;
  analysisDurationMs: number;
  primaryStrategy: string;
  isPrivateOrLocal?: boolean;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  targetUrl: string;
  metadata: WebsiteMetadata;
  resources: ResourceFile[];
  colors: ExtractedColor[];
  brand: BrandIntelligence;
  content: ContentAnalysis;
  domTree: DOMTreeNode;
  relationships: {
    nodes: RelationshipNode[];
    links: RelationshipLink[];
  };
  diagnostics: DiagnosticEvent[];
  stats: AnalysisStats;
  isUserProvided?: boolean;
}

export interface VaultProject {
  id: string;
  name: string;
  domain: string;
  url: string;
  favicon: string | null;
  createdAt: number;
  updatedAt: number;
  starred: boolean;
  tags: string[];
  summary: {
    title: string;
    resourceCount: number;
    colorCount: number;
    wordCount: number;
    primaryStrategy: string;
  };
  data: AnalysisResult;
}

export interface RetrievalOptions {
  headers?: Record<string, string>;
  basicAuth?: { username: string; password: string };
  bypassCache?: boolean;
}

export type WorkspaceTab =
  | 'overview'
  | 'source'
  | 'visual'
  | 'brand'
  | 'colors'
  | 'content'
  | 'search'
  | 'export'
  | 'vault';

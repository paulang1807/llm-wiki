export type ViewType = 'welcome' | 'read' | 'graph' | 'ingest' | 'health';

export interface Frontmatter {
  title?: string;
  category?: string;
  tags?: string[] | string;
  last_updated?: string;
  confidence?: number;
  stale?: boolean;
  related?: string[] | string;
  source?: string;
  [key: string]: unknown;
}

export interface WikiPage {
  frontmatter: Frontmatter;
  content: string;
}

export interface TreeNode {
  type: 'dir' | 'file';
  name: string;
  title?: string;
  path: string;
  children?: TreeNode[];
}

export interface DomainSummary {
  name: string;
  icon: string;
  subdomainsCount: number;
  pagesCount: number;
  desc: string;
  path: string | null;
}

export interface SearchResult {
  path: string;
  title: string;
  category: string;
  snippet: string;
  confidence: number;
}

export interface PageNode {
  id: string;
  title: string;
  category: string;
  confidence: number;
  stale: boolean;
  tags: string[];
  snippet: string;
  connectionsCount?: number;
  x?: number;
  y?: number;
}

export interface Edge {
  source: string;
  target: string;
}

export interface HealthIssueDetails {
  suggested?: string;
  tags?: string[];
  suggestedLink?: string;
  [key: string]: unknown;
}

export interface HealthIssue {
  id: string;
  type:
    | 'broken_link'
    | 'orphan'
    | 'stale'
    | 'missing_title'
    | 'empty_content'
    | 'untagged'
    | 'duplicate_title'
    | 'tag_inconsistency'
    | 'missing_connection'
    | string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  file: string;
  details?: HealthIssueDetails;
  fixable: boolean;
}


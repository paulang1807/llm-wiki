export type ViewType = 'welcome' | 'read' | 'graph' | 'ingest' | 'health';

export interface Frontmatter {
  title?: string;
  category?: string;
  tags?: string[];
  last_updated?: string;
  confidence?: number;
  stale?: boolean;
}

export interface WikiPage {
  frontmatter: Frontmatter;
  content: string;
}

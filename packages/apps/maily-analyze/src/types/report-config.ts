export interface ReportConfig {
  campaignId: string;
  reportType: ReportType;
  format: ReportFormat;
  filters?: ReportFilters;
  options?: ReportOptions;
}

export enum ReportType {
  SUMMARY = 'summary',
  DETAILED = 'detailed',
  PERFORMANCE = 'performance',
  TRENDS = 'trends',
}

export enum ReportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  JSON = 'json',
  HTML = 'html',
}

export interface ReportFilters {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  segment?: string; // e.g., 'geo', 'device'
}

export interface ReportOptions {
  includeCharts?: boolean;
  includeRawData?: boolean;
}
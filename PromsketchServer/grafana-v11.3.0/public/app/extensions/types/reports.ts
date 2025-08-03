import { SelectableValue } from '@grafana/data';
import { DashboardPickerDTO } from 'app/core/components/Select/DashboardPicker';

export interface ReportsState {
  reports: Report[];
  report: Report;
  hasFetchedList: boolean;
  hasFetchedSingle: boolean;
  searchQuery: string;
  reportCount: number;
  isLoading: boolean;
  settings: ReportsSettings;
  testEmailIsSending?: boolean;
  isDownloadingCSV?: boolean;
  lastUid?: string;
  isUpdated?: boolean;
  visitedSteps: StepKey[];
}

export type ReportDashboard = {
  dashboard?: {
    uid: string;
    name: string;
  };
  reportVariables?: Record<string, string[]>;
  timeRange: ReportTimeRange;
};

export interface Report<Vars = Record<string, string[]>> {
  id: number;
  name: string;
  schedule: SchedulingOptions;
  dashboardId?: number;
  dashboardUid?: string;
  dashboardName?: string;
  recipients: string;
  message: string;
  replyTo: string;
  formats: ReportFormat[];
  options: ReportOptions;
  templateVars?: Vars;
  enableDashboardUrl?: boolean;
  state: ReportState;
  dashboards: ReportDashboard[];
  scaleFactor?: number;
  pdfShowTemplateVariables?: boolean;
}

interface ReportBase<Vars = Record<string, string[]>> {
  id?: number;
  name: string;
  dashboardId?: number;
  dashboardUid?: string;
  recipients: string;
  replyTo: string;
  message: string;
  formats: ReportFormat[];
  options: ReportOptions;
  templateVars?: Vars;
  enableDashboardUrl?: boolean;
  state?: ReportState;
  dashboards?: ReportDashboard[];
  scaleFactor?: number;
}

export interface ReportDTO extends ReportBase {
  schedule: SchedulingOptions;
}

export interface ReportFormData extends ReportBase<Record<string, Array<SelectableValue<string>>>> {
  schedule: SchedulingData;
  dashboard: DashboardPickerDTO;
}

export enum SchedulingFrequency {
  Monthly = 'monthly',
  Weekly = 'weekly',
  Daily = 'daily',
  Hourly = 'hourly',
  Never = 'never',
  Custom = 'custom',
  Once = 'once',
}

export enum IntervalFrequency {
  Hours = 'hours',
  Days = 'days',
  Weeks = 'weeks',
  Months = 'months',
}

export enum FooterMode {
  Default = '',
  SentBy = 'sent-by',
  None = 'none',
}

export enum ReportState {
  Paused = 'paused',
  Scheduled = 'scheduled',
  Expired = 'expired',
  Draft = 'draft',
  Never = 'not scheduled',
}

export type ReportTime = {
  hour: number;
  minute: number;
};

export interface SchedulingOptions {
  frequency: SchedulingFrequency;
  dayOfMonth?: string;
  timeZone: string;
  startDate?: string;
  endDate?: string;
  intervalFrequency?: IntervalFrequency;
  intervalAmount?: number;
  workdaysOnly?: boolean;
}

export interface SchedulingData {
  frequency: SchedulingFrequency;
  dayOfMonth?: string;
  time?: ReportTime;
  endTime?: ReportTime;
  timeZone: string;
  startDate?: Date | string;
  endDate?: Date | string;
  intervalFrequency?: IntervalFrequency;
  intervalAmount?: string;
  workdaysOnly?: boolean;
  sendTime: 'later' | 'now' | '';
}

export type ReportOrientation = 'portrait' | 'landscape';

export type ReportLayout = 'simple' | 'grid';

export enum ReportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  Image = 'image',
  PDFTables = 'pdf-tables',
  PDFTablesAppendix = 'pdf-tables-appendix',
}

export interface BrandingOptions {
  reportLogoUrl: string;
  emailLogoUrl: string;
  emailFooterMode: FooterMode;
  emailFooterText: string;
  emailFooterLink: string;
}

export interface ReportsSettings {
  branding: BrandingOptions;
}

export interface ReportOptions {
  orientation: ReportOrientation;
  layout: ReportLayout;
  timeRange: ReportTimeRange;
  pdfShowTemplateVariables: boolean;
}

export interface ReportTimeRange {
  from: string;
  to: string;
  raw?: ReportTimeRange;
}

export const reportOrientations: Array<SelectableValue<ReportOrientation>> = [
  { value: 'landscape', label: 'Landscape', icon: 'gf-landscape' },
  { value: 'portrait', label: 'Portrait', icon: 'gf-portrait' },
];

export const reportLayouts: Array<SelectableValue<ReportLayout>> = [
  { value: 'grid', label: 'Grid', icon: 'table' },
  { value: 'simple', label: 'Simple', icon: 'gf-layout-simple' },
];

export enum StepKey {
  SelectDashboard = 'select-dashboard',
  FormatReport = 'format-report',
  Schedule = 'schedule',
  Share = 'share',
  Confirm = 'confirm',
}

export type FormRequiredFields = Array<{
  step: StepKey;
  fields: Array<keyof Report>;
}>;

export type ReportDataToRender = Array<{
  title: string;
  id: StepKey;
  items: Array<{
    title: string;
    value: React.ReactNode;
    id?: keyof Report;
    required?: boolean;
  }>;
}>;

export const LAST_DAY_OF_MONTH = 'last';

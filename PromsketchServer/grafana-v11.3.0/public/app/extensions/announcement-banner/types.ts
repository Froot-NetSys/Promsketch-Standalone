import { DateTime } from '@grafana/data';

export type AnnouncementBannerVisibility = 'authenticated' | 'everyone';
export type AnnouncementBannerFormData = {
  enabled: boolean;
  startTime?: DateTime | null;
  endTime?: DateTime | null;
  message: string;
  variant: 'error' | 'info' | 'warning';
  visibility: AnnouncementBannerVisibility;
};

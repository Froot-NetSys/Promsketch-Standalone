import { ResourceForCreate } from 'app/features/apiserver/types';

export interface RequestArg {
  /** UID of the AnnouncementBanner */
  name: string;
}

export interface UpdateRequestArg<T> extends RequestArg {
  /** AnnouncementBannerSpec */
  body: ResourceForCreate<Partial<T>>;
}

export type AnnouncementBannerSpec = {
  /** Should this be shown */
  enabled: boolean;
  /** When to stop showing the banner */
  endTime?: string | null;
  /** Banner markdown string */
  message: string;
  /** When to start showing the banner */
  startTime?: string | null;
  /** Type of banner */
  variant: 'error' | 'info' | 'warning';
  /** Who can see this */
  visibility: 'authenticated' | 'everyone';
};

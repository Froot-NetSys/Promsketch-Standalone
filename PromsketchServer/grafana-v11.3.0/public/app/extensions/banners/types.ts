import * as React from 'react';

import { BusEventWithPayload } from '@grafana/data';

/** @alpha */
export class PageBannerDisplayEvent extends BusEventWithPayload<PageBannerEventPayload> {
  static type = 'page-banner-display';
}

/** @alpha */
export type PageBannerEventPayload = {
  onClose?: () => void;
  severity?: PageBannerSeverity;
  body: React.ElementType<PageBannerBodyProps>;
};

/** @alpha */
export type PageBannerBodyProps = {
  severity: PageBannerSeverity;
};

/** @alpha */
export type PageBannerAction = {
  text: string;
  href: string;
};

/** @alpha */
export enum PageBannerSeverity {
  info,
  warning,
  error,
}

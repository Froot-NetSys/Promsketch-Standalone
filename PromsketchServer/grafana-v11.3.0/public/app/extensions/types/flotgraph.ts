import { YAxis } from '@grafana/data';
import { LegendDisplayMode, LegendPlacement } from '@grafana/schema';

/** @deprecated */
export interface SeriesOptions {
  color?: string;
  yAxis?: YAxis;
  [key: string]: any;
}

/** @deprecated */
export interface GraphLegendEditorLegendOptions {
  displayMode: LegendDisplayMode;
  showLegend: boolean;
  placement: LegendPlacement;
  stats?: string[];
  decimals?: number;
  sortBy?: string;
  sortDesc?: boolean;
}

import { PureComponent } from 'react';

import {
  DataFrame,
  dateTime,
  FieldType,
  TimeRange,
  PanelData,
  LoadingState,
  FieldConfigSource,
  FieldColorModeId,
} from '@grafana/data';
import { PanelRenderer } from '@grafana/runtime';
import {
  LegendDisplayMode,
  TooltipDisplayMode,
  VisibilityMode,
  SortOrder,
  StackingMode,
  GraphDrawStyle,
} from '@grafana/schema';
import { Themeable2, PanelChrome } from '@grafana/ui';
import {
  FieldConfig as TimeseriesFieldConfig,
  Options as TimeseriesOptions,
} from 'app/plugins/panel/timeseries/panelcfg.gen';

import { DAILY_SUMMARY_DATE_FORMAT, DashboardDailySummaryDTO } from '../api';
import { getInsightsStyles } from '../styles';

interface Props extends Themeable2 {
  dailySummaries: DashboardDailySummaryDTO[];
}

interface ChartField {
  name: keyof DashboardDailySummaryDTO;
  type: FieldType;
  color?: string;
  label?: string;
}

interface ChartConfig {
  title: string;
  fields: ChartField[];
  width: number;
  timeRange: TimeRange;
  showBars: boolean;
  showLines: boolean;
  isStacked?: boolean;
}

// AnalyticsTab is a class made to share functions between the different Tabs of the Analytics Drawer
export class AnalyticsTab<P extends Props, State = unknown> extends PureComponent<P, State> {
  convertSummariesToDataFrame(field: ChartField, data: DashboardDailySummaryDTO[]): DataFrame {
    const time: number[] = [];
    const values: unknown[] = [];

    data.forEach((dailySummary) => {
      time.push(dateTime(dailySummary.day, DAILY_SUMMARY_DATE_FORMAT).valueOf());
      values.push(dailySummary[field.name]);
    });

    return {
      fields: [
        { name: 'Time', type: FieldType.time, config: {}, values: time },
        {
          name: field.name,
          type: field.type,
          config: {
            displayName: field.label ?? field.name,
            color: field.color
              ? {
                  mode: FieldColorModeId.Fixed,
                  fixedColor: field.color,
                }
              : undefined,
          },
          values,
        },
      ],
      length: data.length,
    };
  }

  buildTimeRange(): TimeRange {
    const { dailySummaries } = this.props;
    const from = dateTime(dailySummaries[0].day);
    const to = dateTime(dailySummaries[dailySummaries.length - 1].day).add(12, 'hours');

    return {
      from: from,
      to: to,
      raw: { from, to },
    };
  }

  renderChart(config: ChartConfig) {
    const { dailySummaries, theme } = this.props;
    const { timeRange, showBars, title, width, fields, isStacked = false } = config;
    const styles = getInsightsStyles(theme);

    const dataFrames = fields.map((field) => this.convertSummariesToDataFrame(field, dailySummaries));

    const panelData: PanelData = {
      series: dataFrames,
      state: LoadingState.Done,
      timeRange, // this.buildTimeRange(),
    };

    const panelOptions: TimeseriesOptions = {
      legend: {
        showLegend: dataFrames.length > 1,
        displayMode: LegendDisplayMode.List,
        placement: 'bottom',
        calcs: [],
      },
      tooltip: {
        mode: TooltipDisplayMode.Multi,
        sort: SortOrder.Descending,
      },
    };

    const fieldConfig: FieldConfigSource<TimeseriesFieldConfig> = {
      defaults: {
        custom: {
          showPoints: VisibilityMode.Never,
          drawStyle: showBars ? GraphDrawStyle.Bars : GraphDrawStyle.Line,
          stacking: isStacked ? { mode: StackingMode.Normal } : undefined,
          fillOpacity: showBars ? 50 : 0,
        },
      },
      overrides: [],
    };

    return (
      <div className={styles.graphContainer}>
        <PanelChrome title={title} width={width} height={220} displayMode="transparent" loadingState={panelData.state}>
          {(innerWidth, innerHeight) => (
            <PanelRenderer
              title={title}
              width={innerWidth}
              height={innerHeight}
              pluginId="timeseries"
              data={panelData}
              fieldConfig={fieldConfig}
              options={panelOptions}
            />
          )}
        </PanelChrome>
      </div>
    );
  }
}

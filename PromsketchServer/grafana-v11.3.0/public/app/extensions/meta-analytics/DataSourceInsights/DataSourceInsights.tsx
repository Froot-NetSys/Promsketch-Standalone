import { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';

import {
  DataFrame,
  dateTime,
  FieldType,
  TimeRange,
  FieldConfigSource,
  PanelData,
  LoadingState,
} from '@grafana/data';
import { featureEnabled, PanelRenderer } from '@grafana/runtime';
import { TooltipDisplayMode, VisibilityMode, SortOrder, GraphDrawStyle, LegendDisplayMode } from '@grafana/schema';
import { InfoBox, Themeable2, withTheme2, PanelChrome } from '@grafana/ui';
import { UpgradeBox } from 'app/core/components/Upgrade/UpgradeBox';
import { highlightTrial } from 'app/features/admin/utils';
import { loadDataSource, loadDataSourceMeta } from 'app/features/datasources/state/actions';
import {
  FieldConfig as TimeseriesFieldConfig,
  Options as TimeseriesOptions,
} from 'app/plugins/panel/timeseries/panelcfg.gen';

import { EnterpriseStoreState } from '../../types';
import { DAILY_SUMMARY_DATE_FORMAT, DataSourceDailySummaryDTO, getDataSourceDailySummaries } from '../api';
import { getInsightsStyles, InsightsStyles } from '../styles';

export type ExternalProps = {
  uid: string;
};

const mapStateToProps = (state: EnterpriseStoreState, props: ExternalProps) => {
  return {
    dataSourceUid: props.uid,
  };
};

const mapDispatchToProps = {
  loadDataSource,
  loadDataSourceMeta,
};

export const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = Themeable2 & ConnectedProps<typeof connector>;

interface State {
  dailySummaries: DataSourceDailySummaryDTO[];
  from: string;
  to: string;
}

interface ChartConfig {
  title: string;
  valueField: keyof DataSourceDailySummaryDTO;
  fieldType: FieldType;
  width: number;
  timeRange: TimeRange;
  color: string;
  showBars: boolean;
  showLines: boolean;
}

class DataSourceInsights extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      dailySummaries: [],
      from: '',
      to: '',
    };
  }

  async componentDidMount(): Promise<void> {
    const { dataSourceUid, loadDataSource, loadDataSourceMeta } = this.props;

    loadDataSource(dataSourceUid).then(loadDataSourceMeta);

    if (featureEnabled('analytics')) {
      let from = dateTime().subtract(30, 'days').format(DAILY_SUMMARY_DATE_FORMAT);
      let to = dateTime().format(DAILY_SUMMARY_DATE_FORMAT);
      const dailySummaries = await getDataSourceDailySummaries(dataSourceUid, from, to);
      this.setState({ dailySummaries, from, to });
    }
  }

  buildTimeRange(): TimeRange {
    const { from, to } = this.state;

    const timeRangeFrom = dateTime(from);
    const timeRangeTo = dateTime(to).add(24, 'hours');

    return {
      from: timeRangeFrom,
      to: timeRangeTo,
      raw: { from, to },
    };
  }

  convertDailySummariesToDataFrame(
    data: DataSourceDailySummaryDTO[],
    valueField: keyof DataSourceDailySummaryDTO,
    valueFieldType: FieldType
  ): DataFrame {
    const time: number[] = [];
    const values: any[] = [];

    data.forEach((dailySummary) => {
      time.push(dateTime(dailySummary.day, DAILY_SUMMARY_DATE_FORMAT).valueOf());
      let value = dailySummary[valueField];
      if (valueField === 'loadDuration') {
        value = dailySummary.queries ? dailySummary.loadDuration / (dailySummary.queries * 1000000) : 0;
      }
      values.push(value);
    });

    return {
      name: valueField,
      fields: [
        { name: 'Time', type: FieldType.time, config: {}, values: time },
        { name: valueField, type: valueFieldType, config: {}, values: values },
      ],
      length: data.length,
    };
  }

  renderChart(config: ChartConfig, styles: InsightsStyles) {
    const { dailySummaries } = this.state;
    const { color, fieldType, showBars, timeRange, title, valueField, width } = config;

    let dataFrame = this.convertDailySummariesToDataFrame(dailySummaries, valueField, fieldType);

    // const series = getGraphSeriesModel(
    //   [dataFrame],
    //   'browser',
    //   seriesOptions,
    //   { showBars: showBars, showLines: showLines, showPoints: false },
    //   { placement: 'bottom', displayMode: LegendDisplayMode.List, showLegend: false }
    // );

    const panelData: PanelData = {
      series: [dataFrame],
      state: LoadingState.Done,
      timeRange, // this.buildTimeRange(),
    };

    const panelOptions: TimeseriesOptions = {
      legend: {
        showLegend: false,
        displayMode: LegendDisplayMode.Hidden,
        calcs: [],
        placement: 'bottom',
      },
      tooltip: {
        mode: TooltipDisplayMode.Multi,
        sort: SortOrder.Descending,
      },
    };

    const fieldConfig: FieldConfigSource<TimeseriesFieldConfig> = {
      defaults: {
        color: {
          mode: 'fixed',
          fixedColor: color,
        },
        custom: {
          showPoints: VisibilityMode.Never,
          drawStyle: showBars ? GraphDrawStyle.Bars : GraphDrawStyle.Line,
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

  renderContent() {
    const { theme } = this.props;
    const styles = getInsightsStyles(theme);
    const { dailySummaries } = this.state;
    const timeRange = this.buildTimeRange();

    return dailySummaries?.length > 0 ? (
      <AutoSizer disableHeight>
        {({ width }) => {
          const charts: ChartConfig[] = [
            {
              title: 'Queries last 30 days',
              valueField: 'queries',
              fieldType: FieldType.number,
              width,
              timeRange,
              color: 'green',
              showBars: true,
              showLines: false,
            },
            {
              title: 'Errors last 30 days',
              valueField: 'errors',
              fieldType: FieldType.number,
              width,
              timeRange,
              color: theme.colors.error.border,
              showBars: true,
              showLines: false,
            },
            {
              title: 'Average load duration last 30 days (ms)',
              valueField: 'loadDuration',
              fieldType: FieldType.number,
              width,
              timeRange,
              color: theme.colors.primary.border,
              showBars: true,
              showLines: false,
            },
          ];

          return <main style={{ width }}>{charts.map((chart) => this.renderChart(chart, styles))}</main>;
        }}
      </AutoSizer>
    ) : (
      <span>No available data for this data source.</span>
    );
  }

  render() {
    if (featureEnabled('analytics.writers') && !featureEnabled('analytics')) {
      return (
        <InfoBox
          title="Feature not available with an expired license"
          url="https://grafana.com/docs/grafana/latest/enterprise/license-expiration/"
          urlTitle="Read more on license expiration"
        >
          <span>
            Data source insights are not available with an expired license. Data will continue to be collected but you
            need to update your license to see this page.
          </span>
        </InfoBox>
      );
    }

    return (
      <>
        {highlightTrial() && (
          <UpgradeBox
            featureId={'data-source-insights'}
            eventVariant={'trial'}
            featureName={'data source usage insights'}
            text={'Enable data source usage insights for free during your trial of Grafana Pro.'}
          />
        )}
        {this.renderContent()}
      </>
    );
  }
}

export default connector(withTheme2(DataSourceInsights));

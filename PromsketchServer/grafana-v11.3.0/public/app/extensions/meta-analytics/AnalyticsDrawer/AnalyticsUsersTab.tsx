import { connect } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';

import {
  FieldType,
  DataFrame,
  DateTime,
  dateTime,
  FieldConfig,
  GrafanaTheme2,
  applyFieldOverrides,
  FieldConfigSource,
} from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { Button, Table, Themeable2, withTheme2, UserIcon } from '@grafana/ui';
import { TableFieldOptions, TableCellDisplayMode } from '@grafana/ui/src/components/Table/types';
import { DashboardModel } from 'app/features/dashboard/state';

import { getDashboardUsersInfo, DashboardDailySummaryDTO, DashboardUsersInfoDTO, UserViewDTO } from '../api';
import { setDrawerOpen } from '../state/reducers';
import { getInsightsStyles, InsightsStyles } from '../styles';

import { AnalyticsTab } from './AnalyticsTab';

export interface Props extends Themeable2 {
  dashboard: DashboardModel;
  dailySummaries: DashboardDailySummaryDTO[];
  userViews: UserViewDTO[];
  setDrawerOpen: typeof setDrawerOpen;
}

interface State {
  dashboardUsersInfo: DashboardUsersInfoDTO | null;
}

export class AnalyticsUsersTab extends AnalyticsTab<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      dashboardUsersInfo: null,
    };
  }

  async componentDidMount(): Promise<void> {
    const { dashboard } = this.props;

    try {
      const dashboardUsersInfo = await getDashboardUsersInfo(dashboard.id);
      this.setState({ dashboardUsersInfo });
    } catch (err) {
      console.log('Error getting dashboard users info', err);
    }
  }

  formatDate(date: DateTime): string {
    const diffDays = date.diff(dateTime().startOf('day'), 'days', true);

    if (diffDays < -6) {
      return date.format('YYYY-MM-DD');
    } else if (diffDays < -1) {
      return date.locale('en').format('dddd');
    } else if (diffDays < 0) {
      return 'Yesterday';
    } else {
      const diffMinutes = date.diff(dateTime(), 'minutes', true);

      if (diffMinutes < -60) {
        return 'Today';
      } else if (diffMinutes < -15) {
        return 'Last hour';
      } else {
        return 'Currently viewing';
      }
    }
  }

  onOpenVersionHistory = () => {
    const { setDrawerOpen } = this.props;
    setDrawerOpen(false);
    locationService.partial({ editview: 'versions' });
  };

  renderUserBox(title: string, userView: UserViewDTO, styles: InsightsStyles) {
    return (
      <div className={styles.userBox} aria-label="User information box">
        <h6 aria-label="User box title">{title}</h6>
        <UserIcon userView={userView} showTooltip={false} />
        <div className={styles.userName}>{userView.user.name}</div>
        <div>{dateTime(userView.lastActiveAt).format('YYYY-MM-DD')}</div>
      </div>
    );
  }

  renderViewsChart() {
    const timeRange = this.buildTimeRange();

    return (
      <AutoSizer disableHeight>
        {({ width }) => {
          if (width === 0) {
            return null;
          }

          return (
            <main style={{ width }}>
              {this.renderChart({
                title: 'Views last 30 days',
                fields: [
                  {
                    name: 'views',
                    type: FieldType.number,
                  },
                ],
                width,
                timeRange,
                showBars: true,
                showLines: false,
              })}
            </main>
          );
        }}
      </AutoSizer>
    );
  }

  convertUserViewsToDataFrame(styles: InsightsStyles, theme: GrafanaTheme2): DataFrame | null {
    const { userViews } = this.props;
    if (userViews && userViews.length > 0) {
      const time: string[] = [];
      const users: string[] = [];
      const avatars: JSX.Element[] = [];

      userViews.forEach((userView) => {
        time.push(this.formatDate(dateTime(userView.lastActiveAt)));
        users.push(userView.user.name);
        avatars.push(<UserIcon className={styles.userIcon} userView={userView} showTooltip={false} />);
      });

      const avatarFieldConfig: FieldConfig<TableFieldOptions> = {
        displayName: ' ',
        filterable: false,
        custom: {
          width: 50,
          align: 'center',
          minWidth: 50,
          cellOptions: {
            type: TableCellDisplayMode.ColorText,
          },
          inspect: false,
        },
      };
      const data = [
        {
          fields: [
            { name: ' ', type: FieldType.other, config: avatarFieldConfig, values: avatars },
            { name: 'User', type: FieldType.string, config: {}, values: users },
            { name: 'When', type: FieldType.string, config: {}, values: time },
          ],
          length: userViews.length,
        },
      ];
      const processedData = applyFieldOverrides({
        data,
        theme,
        replaceVariables: (value: string) => value,
        fieldConfig: {} as unknown as FieldConfigSource,
      });
      return processedData.length > 0 ? processedData[0] : null;
    } else {
      return null;
    }
  }

  render() {
    const { dailySummaries, dashboard, theme, userViews } = this.props;
    const { dashboardUsersInfo } = this.state;
    const styles = getInsightsStyles(theme);
    const userViewsDataFrame = this.convertUserViewsToDataFrame(styles, theme);
    return (
      <div>
        {dailySummaries && dailySummaries.length > 0 && this.renderViewsChart()}
        <div className={styles.userBoxesContainer}>
          {dashboardUsersInfo?.creator && this.renderUserBox('Created', dashboardUsersInfo.creator, styles)}
          {dashboardUsersInfo?.lastEditor && this.renderUserBox('Last edited', dashboardUsersInfo.lastEditor, styles)}
          {userViews?.length > 0 && this.renderUserBox('Last viewed', userViews[0], styles)}
        </div>
        {userViews?.length > 0 && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h4>Last 30 dashboard viewers</h4>
              {dashboard.meta.showSettings && (
                <Button
                  icon="history"
                  variant="secondary"
                  onClick={this.onOpenVersionHistory}
                  aria-label="Version history button"
                >
                  Dashboard version history
                </Button>
              )}
            </div>
            <AutoSizer disableHeight>
              {({ width }) => {
                if (width === 0) {
                  return null;
                }

                const fullTableHeight = 35 * (userViewsDataFrame!.length + 1);
                return (
                  <main style={{ width }}>
                    <Table
                      data={userViewsDataFrame!}
                      height={fullTableHeight}
                      width={width}
                      aria-label="Recent users table"
                    />
                  </main>
                );
              }}
            </AutoSizer>
          </div>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = {
  setDrawerOpen,
};

export default withTheme2(connect(null, mapDispatchToProps)(AnalyticsUsersTab));

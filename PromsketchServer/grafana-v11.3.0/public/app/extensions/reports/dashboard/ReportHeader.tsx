import { css } from '@emotion/css';
import { forwardRef } from 'react';

import { dateMath, dateTime, dateTimeForTimeZone, GrafanaTheme2 } from '@grafana/data';
import { SceneObject, SceneTimeRangeState } from '@grafana/scenes';
import { Stack, useTheme2 } from '@grafana/ui';

interface HeaderProps {
  reportTitle: string;
  dashboardTitle: string;
  timeRange: SceneTimeRangeState;
  scaleFactor: number;
  showTemplateVariables: boolean;
  variableControls?: SceneObject[];
}

function getReadableDateTimes(timeRange: SceneTimeRangeState) {
  const dateDisplayFormat = 'YYYY-MM-DD HH:mm:ss Z';

  // converting time range to date time (the timezone value is deprecated)
  const dateTimeFrom = dateMath.parse(timeRange.from, false, undefined, timeRange.fiscalYearStartMonth);
  const dateTimeTo = dateMath.parse(timeRange.to, true, undefined, timeRange.fiscalYearStartMonth);

  // formatting date time using the time zone
  const displayFrom = dateTimeForTimeZone(timeRange.timeZone, dateTimeFrom).format(dateDisplayFormat);
  const displayTo = dateTimeForTimeZone(timeRange.timeZone, dateTimeTo).format(dateDisplayFormat);

  return { displayFrom, displayTo };
}

const ReportHeader = forwardRef<HTMLDivElement, HeaderProps>(
  ({ reportTitle, dashboardTitle, timeRange, scaleFactor, showTemplateVariables, variableControls }, ref) => {
    const theme = useTheme2();
    const styles = getStyles(theme, scaleFactor);
    const { displayFrom, displayTo } = getReadableDateTimes(timeRange);

    return (
      <div ref={ref} className={styles.header}>
        <div className={styles.subHeader}>
          <div>
            {reportTitle} - Generated on {dateMath.parse(dateTime(Date.now()))?.format('dddd, MMM DD YYYY')}
          </div>
          <div className={styles.timeRangeBlock}>
            <div>
              Data time range: {displayFrom}
              <br />
              {displayTo}
            </div>
          </div>
        </div>
        <div className={styles.dashboardTitle}>{dashboardTitle}</div>
        <hr className={styles.divider} />
        {showTemplateVariables && (
          <div className={styles.subHeader}>
            <Stack grow={1} wrap={'wrap'}>
              {variableControls?.map((c) => <c.Component model={c} key={c.state.key} />)}
            </Stack>
          </div>
        )}
      </div>
    );
  }
);

function getStyles(theme: GrafanaTheme2, scaleFactor: number) {
  return {
    subHeader: css({
      label: 'subheader',
      display: 'flex',
      fontWeight: theme.typography.fontWeightMedium,
      // TODO: We should use value from theme
      fontSize: `${0.85 * scaleFactor}rem`,
      paddingTop: theme.spacing(2),
    }),
    timeRangeBlock: css({
      label: 'time-range-block',
      display: 'flex',
      justifyContent: 'flex-end',
      textAlign: 'right',
      flexGrow: 1,
    }),
    dashboardTitle: css({
      label: 'dashboard-title',
      // TODO: We should use value from theme
      fontSize: `${1.7 * scaleFactor}rem`,
      fontWeight: theme.typography.fontWeightMedium,
    }),
    divider: css({
      marginTop: 0,
      marginBottom: 0,
    }),
    header: css({
      marginBottom: theme.spacing(2 * scaleFactor),
    }),
  };
}

ReportHeader.displayName = 'ReportHeader';

export default ReportHeader;

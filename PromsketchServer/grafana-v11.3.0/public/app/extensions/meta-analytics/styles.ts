import { css } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { stylesFactory } from '@grafana/ui';

export interface InsightsStyles {
  tabContent: string;
  tabsBar: string;
  graphContainer: string;
  panelContent: string;
  userBoxesContainer: string;
  userBox: string;
  userName: string;
  tableContainer: string;
  tableHeader: string;
  userIcon: string;
}

export const getInsightsStyles = stylesFactory((theme: GrafanaTheme2): InsightsStyles => {
  const containerBg = theme.colors.background.secondary;

  return {
    tabContent: css`
      height: 100%;
    `,
    tabsBar: css`
      padding-left: ${theme.spacing(2)};
      margin: ${theme.spacing(3, -1, -3, -3)};
    `,
    graphContainer: css`
      margin-top: ${theme.spacing(2)};
      background-color: ${containerBg};
    `,
    panelContent: css`
      contain: none;
    `,
    userBoxesContainer: css`
      display: flex;
      margin-top: ${theme.spacing(3)};

      > div + div {
        margin-left: ${theme.spacing(2)};
      }
    `,
    userBox: css`
      padding: ${theme.spacing(2)};
      flex: 1;
      text-align: center;
      background-color: ${containerBg};
      border-radius: 3px;

      button,
      img {
        margin: ${theme.spacing(0, 0, 1, 0)};
      }
    `,
    userName: css`
      font-weight: ${theme.typography.fontWeightBold};
    `,
    tableContainer: css`
      margin-top: ${theme.spacing(3)};
      background-color: ${containerBg};
      padding-bottom: ${theme.spacing(1)};
      border-radius: 3px;

      [role='cell']:first-child > div {
        padding: 4px;
      }
      [role='columnheader']:first-child {
        height: 33px;
      }
      [role='row']:not(:only-child):nth-child(odd) {
        background-color: ${theme.colors.background.primary};
      }
    `,
    tableHeader: css`
      padding: ${theme.spacing(0, 2, 0.5, 2)};
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin-bottom: 0px;
        padding: ${theme.spacing(3, 0)};
      }
    `,
    userIcon: css`
      margin: 0 0;
      width: 26px;
      height: 26px;
      line-height: 20px;

      & > * {
        width: 26px;
        height: 26px;
        line-height: 20px;
      }
    `,
  };
});

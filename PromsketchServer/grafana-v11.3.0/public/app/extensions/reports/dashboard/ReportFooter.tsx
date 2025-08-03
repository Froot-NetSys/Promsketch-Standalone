import { css } from '@emotion/css';
import { useLocation } from 'react-router';

import { GrafanaTheme2 } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';

import { defaultReportLogo } from '.././constants';
import { getResourceUrl } from '../../shared/utils/data';

interface FooterProps {
  scaleFactor: number;
  currentPage: number;
  totalPageCount: number;
}

function ReportFooter({ scaleFactor, currentPage, totalPageCount }: FooterProps) {
  const theme = useTheme2();
  const styles = getStyles(theme, scaleFactor);

  return (
    <div className={styles.footer}>
      <div className={styles.pageCount}>
        Page {currentPage}/{totalPageCount}
      </div>
      <div className={styles.logo}>
        <img className={styles.logoImg} src={useReportLogoUrl()} alt="Report logo" />
      </div>
    </div>
  );
}

function useReportLogoUrl() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const reportLogo = urlParams.get('reportLogo');

  return reportLogo ? getResourceUrl(reportLogo ) : defaultReportLogo;
}

function getStyles(theme: GrafanaTheme2, scaleFactor: number) {
  return {
    footer: css({
      bottom: 0,
      height: theme.spacing(4 * scaleFactor),
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(1),
    }),
    pageCount: css({
      flex: 1,
      textAlign: 'center',
      fontWeight: theme.typography.fontWeightMedium,
      fontSize: `${0.85 * scaleFactor}rem`,
    }),
    logo: css({
      top: theme.spacing(0.5 * scaleFactor),
      right: theme.spacing(2 + 0.5 * scaleFactor),
    }),
    logoImg: css({
      maxWidth: theme.spacing(3 * scaleFactor),
      maxHeight: theme.spacing(3 * scaleFactor),
    }),
  };
}

export default ReportFooter;

import { t } from 'app/core/internationalization';

export const defaultReportLogo = '/public/img/grafana_icon.svg';
export const defaultEmailLogo = 'https://grafana.com/static/assets/img/grafana_logo_lockup_ltbg.png';

export const BASE_URL = '/reports';
export const API_ROOT = 'api/reports/images/';

export const defaultScaleFactor = 2;
export const reportScales = (): Record<number, { style?: React.CSSProperties; label: string }> => {
  return {
    1: { label: t('export.pdf.zoom-in-label','Zoom in'), style: { transform: 'translateX(-10%)' } },
    2: { label: t('export.pdf.zoom-standard-label','Standard') },
    3: { label: t('export.pdf.zoom-out-label','Zoom out'), style: { width: '100%', left: '91%' } },
  }
};

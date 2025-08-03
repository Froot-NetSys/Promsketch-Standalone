import { Alert } from '@grafana/ui';
import { Trans, t } from 'app/core/internationalization';

export interface Props {
  variant?: 'info' | 'error';
}

const ActionMessage = () => {
  return (
    <Trans i18nKey="reporting.errors.action-message">
      Please contact your Grafana administrator to install the plugin.
    </Trans>
  );
};

const NoRendererInfoMessage = (): JSX.Element => {
  return (
    <Trans i18nKey="reporting.errors.no-renderer-description">
      To generate PDF reports, you must install the{' '}
      <a
        href="https://grafana.com/grafana/plugins/grafana-image-renderer"
        target="_blank"
        rel="noopener noreferrer"
        className="external-link"
      >
        Grafana Image Renderer
      </a>{' '}
      plugin.
    </Trans>
  );
};

export const NoRendererInfoBox = ({ variant = 'info' }: Props): JSX.Element => {
  return (
    <Alert title={t('reporting.errors.no-renderer-title', 'Image renderer plugin not installed')} severity={variant}>
      <NoRendererInfoMessage /> <br />
      <ActionMessage />
    </Alert>
  );
};

const OldRendererInfoMessage = (): JSX.Element => {
  return (
    <Trans i18nKey="reporting.errors.old-renderer-description">
      To generate CSV files, you must update the{' '}
      <a
        href="https://grafana.com/grafana/plugins/grafana-image-renderer"
        target="_blank"
        rel="noopener noreferrer"
        className="external-link"
      >
        Grafana Image Renderer
      </a>{' '}
      plugin.
    </Trans>
  );
};

export const OldRendererInfoBox = (): JSX.Element => {
  return (
    <Alert
      title={t('reporting.errors.old-renderer-title', 'You are using an old version of the image renderer plugin')}
      severity="warning"
    >
      <OldRendererInfoMessage /> <br />
      <ActionMessage />
    </Alert>
  );
};

import { css, cx } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { config } from '@grafana/runtime';
import { useStyles2 } from '@grafana/ui';

interface DashboardLinkProps {
  uid?: string;
  name?: string;
  className?: string;
}

export const DashboardLink = ({ uid, name, className }: DashboardLinkProps) => {
  const styles = useStyles2(getLinkStyles);

  if (!uid) {
    return null;
  }

  return (
    <a href={`${config.appUrl}d/${uid}`} className={cx(styles.link, className)} target={'_blank'} rel="noreferrer">
      {name || 'View dashboard'}
    </a>
  );
};

const getLinkStyles = (theme: GrafanaTheme2) => {
  return {
    link: css`
      display: inline-block;
      color: ${theme.colors.text.link};
      margin-top: ${theme.spacing(1)};
      font-size: ${theme.typography.bodySmall.fontSize};

      :hover {
        text-decoration: underline;
      }
    `,
  };
};

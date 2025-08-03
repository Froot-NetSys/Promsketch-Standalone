import { css, cx } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { Alert, CardContainer, Icon, IconName, stylesFactory, Tooltip, useStyles2, useTheme2 } from '@grafana/ui';

import { CustomerSupportButton } from './CustomerSupportButton';

export type CardState = 'warning' | 'error' | 'info' | '';
export interface Props {
  title?: string;
  footer?: JSX.Element;
  state?: CardState;
  status?: string;
  children: JSX.Element;
  className?: string;
}

export const LicenseCard = ({ title, children, footer, state, status, className }: Props) => {
  const theme = useTheme2();
  const styles = getStyles(theme, state);
  return (
    <CardContainer className={cx(styles.container, className)} disableHover>
      <div className={styles.inner}>
        {(title || status) && (
          <div className={styles.row}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {status && <CardStatus state={state} status={status} />}
          </div>
        )}
        <div className={styles.content}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </CardContainer>
  );
};

const getStyles = stylesFactory((theme: GrafanaTheme2, state?: CardState) => {
  return {
    container: css`
      padding: ${theme.spacing(2)};
      margin-bottom: 0;
      ${state && `border: 1px solid ${theme.colors[state].border}`};
    `,
    inner: css`
      display: flex;
      flex-direction: column;
      width: 100%;
    `,
    title: css`
      font-size: ${theme.typography.h3.fontSize};
      color: ${theme.colors.text.secondary};
      margin-bottom: 0;
    `,
    row: css`
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-bottom: ${theme.spacing(2)};
      align-items: center;
    `,
    content: css`
      display: flex;
      flex-direction: column;
      flex: 1 0 auto;
      width: 100%;
    `,
    footer: css`
      display: flex;
      flex-direction: column;
      align-items: self-start;
      margin-top: ${theme.spacing(2)};
    `,
  };
});

export type CardStatusProps = {
  state?: CardState;
  status?: string;
};

export const CardStatus = ({ state, status }: CardStatusProps) => {
  const iconMap = new Map<CardState, IconName>([
    ['warning', 'bell'],
    ['error', 'exclamation-triangle'],
  ]);
  const theme = useTheme2();
  const styles = getStatusStyles(theme, state);

  if (state && iconMap.has(state)) {
    return (
      <div role={'alert'} className={styles.container}>
        <Icon name={iconMap.get(state)!} />
        {status}
      </div>
    );
  }
  return null;
};

const getStatusStyles = (theme: GrafanaTheme2, state?: CardState) => {
  return {
    container: css`
      background-color: ${theme.colors.background.primary};
      color: ${state && theme.colors[state].text};
      padding: ${theme.spacing(0.5)} ${theme.spacing(1)};

      svg {
        margin-right: ${theme.spacing(1)};
      }
    `,
  };
};

type CardAlertProps = {
  state?: CardState;
  title: string;
  orgSlug: string;
  licenseId: string;
};

export const CardAlert = ({ state, title, orgSlug, licenseId }: CardAlertProps) => {
  const styles = useStyles2(getAlertStyles);
  return state ? (
    <Alert title={title} severity={state} className={styles.container}>
      <CustomerSupportButton orgSlug={orgSlug} licenseId={licenseId} />
    </Alert>
  ) : null;
};

const getAlertStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      background: ${theme.colors.secondary.main};
      margin-bottom: ${theme.spacing(3)};
    `,
  };
};

type CardContentItem = {
  name: string;
  value: string | number | JSX.Element;
  highlight?: boolean;
  tooltip?: string;
  indentLevel?: number; // Add indentLevel
};

export const CardContent = ({ content, state }: { content: Array<CardContentItem | null>; state?: CardState }) => {
  const theme = useTheme2();
  const styles = getContentStyles(theme, state);

  return (
    <>
      {content.map((item) => {
        if (!item) {
          return null;
        }
        const indentStyle = { marginLeft: `${item.indentLevel || 0}em` }; // Use indentLevel to control indentation
        return (
          <div key={item.name} className={styles.row}>
            <span style={indentStyle}>
              {item.name}
              {item.tooltip && (
                <Tooltip placement="top" content={item.tooltip} theme={'info'}>
                  <Icon name="info-circle" size="sm" />
                </Tooltip>
              )}
            </span>
            <span className={item.highlight ? styles.highlight : ''}>{item.value}</span>
          </div>
        );
      })}
    </>
  );
};

const getContentStyles = (theme: GrafanaTheme2, state?: CardState) => {
  return {
    row: css`
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-bottom: ${theme.spacing(2)};
      align-items: center;
      svg {
        margin-left: ${theme.spacing(0.5)};
        cursor: pointer;
      }
    `,
    highlight: css`
      background-color: ${theme.colors.background.primary};
      color: ${state && theme.colors[state].text};
      padding: ${theme.spacing(0.5)} ${theme.spacing(1)};
      margin-right: -${theme.spacing(1)};

      svg {
        margin-right: ${theme.spacing(1)};
      }
    `,
  };
};

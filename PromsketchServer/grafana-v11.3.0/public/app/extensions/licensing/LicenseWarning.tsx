import { css } from '@emotion/css';
import * as React from 'react';

import { GrafanaTheme } from '@grafana/data';
import { Alert, useStyles } from '@grafana/ui';

interface WarningProps {
  title: string;
  subTitle: JSX.Element;
  severity: 'info' | 'error';
  onButtonClick?: () => void;
  buttonText?: string;
}

const Warning = ({ title, subTitle, severity, onButtonClick, buttonText }: WarningProps) => {
  const styles = useStyles(getStyles);

  return (
    <div className={styles.container}>
      <div className="page-container">
        <Alert title={title} severity={severity} buttonContent={buttonText} onRemove={onButtonClick}>
          {subTitle}
        </Alert>
      </div>
    </div>
  );
};

interface LicensingLinkProps {
  isLicensingReader: boolean;
  children: React.ReactNode;
}

export const LicensingLink = ({ isLicensingReader, children }: LicensingLinkProps) => {
  if (isLicensingReader) {
    return <a href="/admin/licensing">{children}</a>;
  }

  return (
    <a
      href="https://grafana.com/docs/grafana/latest/enterprise/license-expiration/"
      target="_blank"
      rel="noreferrer noopener"
    >
      {children}
    </a>
  );
};

interface HasExpiredProps {
  isLicensingReader: boolean;
}

export const HasExpired = ({ isLicensingReader }: HasExpiredProps) => {
  return (
    <Warning
      title="Your Grafana Enterprise license has expired"
      subTitle={
        <>
          <LicensingLink isLicensingReader={isLicensingReader}>Some features</LicensingLink> have been disabled.
        </>
      }
      severity="error"
    />
  );
};

interface IsInvalidProps {
  isLicensingReader: boolean;
}

export const IsInvalid = ({ isLicensingReader }: IsInvalidProps) => {
  return (
    <Warning
      title="Your Grafana Enterprise license is invalid"
      subTitle={
        <>
          <LicensingLink isLicensingReader={isLicensingReader}>Some features</LicensingLink> have been disabled.
        </>
      }
      severity="error"
    />
  );
};

interface ExpiresSoonProps {
  days: number;
  onCloseWarning?(): void;
  isLicensingReader: boolean;
}

export const ExpiresSoon = ({ days, onCloseWarning, isLicensingReader }: ExpiresSoonProps) => {
  return (
    <Warning
      onButtonClick={onCloseWarning}
      title="Your Grafana Enterprise license will expire soon"
      subTitle={
        <>
          {days} days remaining, after which{' '}
          <LicensingLink isLicensingReader={isLicensingReader}>Enterprise features will be disabled.</LicensingLink>
        </>
      }
      severity="info"
      buttonText="Dismiss"
    />
  );
};

interface TokenExpiresSoonProps {
  days: number;
  onCloseWarning?(): void;
  isLicensingReader: boolean;
}

export const TokenExpiresSoon = ({ days, onCloseWarning, isLicensingReader }: TokenExpiresSoonProps) => {
  return (
    <Warning
      onButtonClick={onCloseWarning}
      title="Your Grafana Enterprise token needs to be renewed"
      subTitle={
        <>
          Your license token has {days} days remaining, after which{' '}
          <LicensingLink isLicensingReader={isLicensingReader}>Enterprise features will be disabled.</LicensingLink>
        </>
      }
      severity="info"
      buttonText="Dismiss"
    />
  );
};

interface MaxUsersReachedProps {
  activeUsers: number;
  maxUsers: number;
  onRefreshWarning?: () => void;
  slug?: string;
}

export const MaxUsersReached = ({ activeUsers, maxUsers, slug, onRefreshWarning }: MaxUsersReachedProps) => {
  return (
    <Warning
      onButtonClick={onRefreshWarning}
      title={'You have exceeded the included number of active users'}
      subTitle={
        <>
          Your Grafana Enterprise license includes {maxUsers} active users; you currently have {activeUsers} active
          users. Please{' '}
          {slug ? (
            <a href={'https://grafana.com/orgs/' + slug + '/licenses'} target="_blank" rel="noreferrer noopener">
              upgrade your license.
            </a>
          ) : (
            'upgrade your license.'
          )}
        </>
      }
      severity="error"
      buttonText="Refresh"
    />
  );
};

export const getStyles = (theme: GrafanaTheme) => {
  return {
    container: css`
      position: absolute;
      bottom: 0;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      z-index: 3;
    `,
  };
};

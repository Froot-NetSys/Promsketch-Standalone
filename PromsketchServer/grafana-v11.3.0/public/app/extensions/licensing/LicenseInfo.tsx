import { css } from '@emotion/css';
import { FormEvent, useState } from 'react';

import { dateTimeFormat, GrafanaTheme2 } from '@grafana/data';
import { config, locationService } from '@grafana/runtime';
import { Alert, Button, LinkButton, useStyles2, Icon } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { UpgradeInfo } from 'app/features/admin/UpgradePage';
import { Loader } from 'app/features/plugins/admin/components/Loader';

import { AccessControlAction } from '../types';

import { CustomerSupportButton } from './CustomerSupportButton';
import { CardAlert, CardContent, CardState, LicenseCard } from './LicenseCard';
import { LicenseTokenUpload } from './LicenseTokenUpload';
import { EXPIRED, VALID, WARNING_RATE, LIMIT_BY_USERS, AWS_MARKEPLACE_ISSUER } from './constants';
import { postLicenseToken, renewLicenseToken } from './state/api';
import { ActiveUserStats, LicenseToken } from './types';
import { calculateActiveUsers, getRate, getTokenStatus, getTrialStatus, getUserStatMessage, getUtilStatus } from './utils';

export interface Props {
  token: LicenseToken | null;
  stats: ActiveUserStats | null;
  tokenRenewed?: boolean;
  tokenUpdated?: boolean;
  isLoading?: boolean;
  licensedUrl?: string;
}

export const LicenseInfo = ({ token, stats, tokenRenewed, tokenUpdated, isLoading, licensedUrl }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const tokenState = getTokenStatus(token).state;
  const utilState = getUtilStatus(token, stats).state;
  const isLicensingEditor = contextSrv.hasPermission(AccessControlAction.LicensingWrite);

  const styles = useStyles2(getStyles);
  const activeUsers = calculateActiveUsers(stats, token);
  const anonymousRatio = token?.anonymousRatio || 1;

  const onFileUpload = (event: FormEvent<HTMLInputElement>) => {
    const file = event.currentTarget?.files?.[0];

    if (file) {
      locationService.partial({ tokenUpdated: null, tokenRenewed: null });
      const reader = new FileReader();
      const readerOnLoad = () => {
        return async (e: any) => {
          setIsUploading(true);
          try {
            await postLicenseToken(e.target.result);
            locationService.partial({ tokenUpdated: true });
            setTimeout(() => {
              // reload from server to pick up the new token
              location.reload();
            }, 1000);
          } catch (error) {
            setIsUploading(false);
            throw error;
          }
        };
      };
      reader.onload = readerOnLoad();
      reader.readAsText(file);
    }
  };

  const onRenewClick = async () => {
    locationService.partial({ tokenUpdated: null, tokenRenewed: null });

    setIsRenewing(true);

    try {
      await renewLicenseToken();
      locationService.partial({ tokenRenewed: true });
      setTimeout(() => {
        // reload from server to pick up the new token
        location.reload();
      }, 1000);
    } catch (error) {
      setIsRenewing(false);
      throw error;
    }
  };

  if (!contextSrv.hasPermission(AccessControlAction.LicensingRead)) {
    return null;
  }

  if (isLoading) {
    return <Loader text={'Loading licensing info...'} />;
  }

  let editionNotice = 'You are running Grafana Enterprise without a license. The Enterprise features are disabled.';
  if (token && ![VALID, EXPIRED].includes(token.status)) {
    editionNotice = 'There is a problem with your Enterprise license token. The Enterprise features are disabled.';
  }


  return !token || ![VALID, EXPIRED].includes(token.status) ? (
    <>
      <UpgradeInfo editionNotice={editionNotice} />
      <div className={styles.uploadWrapper}>
        <LicenseTokenUpload
          title="Have a license?"
          onFileUpload={onFileUpload}
          isUploading={isUploading}
          isDisabled={!isLicensingEditor}
          licensedUrl={licensedUrl}
        />
      </div>
    </>
  ) : (
    <div>
      <h2 className={styles.title}>License details</h2>
      <PageAlert {...getUtilStatus(token, stats)} orgSlug={token.slug} licenseId={token.lid} />
      <PageAlert {...getTokenStatus(token)} orgSlug={token.slug} licenseId={token.lid} />
      <PageAlert {...getTrialStatus(token)} orgSlug={token.slug} licenseId={token.lid} />
      {tokenUpdated && (
        <Alert
          title="License token uploaded. Restart Grafana for the changes to take effect."
          severity="success"
          onRemove={() => locationService.partial({ tokenUpdated: null })}
        />
      )}
      {tokenRenewed && (
        <Alert
          title="License token renewed."
          severity="success"
          onRemove={() => locationService.partial({ tokenRenewed: null })}
        />
      )}
      <div className={styles.row}>
        <LicenseCard
          title={'License'}
          className={styles.licenseCard}
          footer={
            <LinkButton
              variant="secondary"
              href={token.details_url || `${token.iss}/licenses/${token.lid}`}
              aria-label="View details about your license in Grafana Cloud"
              target="_blank"
              rel="noopener noreferrer"
            >
              License details
            </LinkButton>
          }
        >
          <CardContent
            content={[
              {
                name: token.prod?.length <= 1 ? 'Product' : 'Products',
                value:
                  token.prod?.length <= 1 ? (
                    token.prod[0] || 'None'
                  ) : (
                    <ul>
                      {token.prod?.map((product) => (
                        <li key={product}>{product}</li>
                      ))}
                    </ul>
                  ),
              },
              token.iss === AWS_MARKEPLACE_ISSUER && token.account
                ? { name: 'AWS Account', value: token.account }
                : { name: 'Company', value: token.company },
              { name: 'License ID', value: token.lid },
              token.iss === AWS_MARKEPLACE_ISSUER
                ? null
                : {
                    name: 'URL',
                    value: token.sub,
                    tooltip:
                      'License URL is the root URL of your Grafana instance. The license will not work on an instance of Grafana with a different root URL.',
                  },
              { name: 'Purchase date', value: dateTimeFormat(token.nbf * 1000) },
              token.iss === AWS_MARKEPLACE_ISSUER
                ? null
                : {
                    name: 'License expires',
                    value: dateTimeFormat(token.lexp * 1000),
                    highlight: !!getTokenStatus(token)?.state,
                    tooltip:
                      'The license expiration date is the date when the current license is no longer active. As the license expiration date approaches, Grafana Enterprise displays a banner.',
                  },
              token.iss === AWS_MARKEPLACE_ISSUER
                ? null
                : {
                    name: 'Usage billing',
                    value: token.usage_billing ? 'On' : 'Off',
                    tooltip:
                      'You can request Grafana Labs to turn on usage billing to allow an unlimited number of active users. When usage billing is enabled, Grafana does not enforce active user limits or display warning banners. Instead, you are charged for active users above the limit, according to your customer contract.',
                  },
            ]}
          />
        </LicenseCard>
        <LicenseCard
          {...getTokenStatus(token)}
          title={'Token'}
          footer={
            <div className={styles.row}>
              {token.iss !== AWS_MARKEPLACE_ISSUER && (
                <LicenseTokenUpload
                  onFileUpload={onFileUpload}
                  isUploading={isUploading}
                  isDisabled={!isLicensingEditor}
                />
              )}
              {isRenewing ? (
                <span> (Renewing...)</span>
              ) : (
                <Button variant="secondary" onClick={onRenewClick} disabled={!isLicensingEditor}>
                  Renew token
                </Button>
              )}
            </div>
          }
        >
          <>
            {tokenState && (
              <CardAlert
                title={'Contact support to renew your token, or visit the Cloud portal to learn more.'}
                state={tokenState}
                orgSlug={token.slug}
                licenseId={token.lid}
              />
            )}
            <div className={styles.message}>
              <Icon name={'document-info'} />
              Read about{' '}
              <a
                href={'https://grafana.com/docs/grafana/latest/enterprise/license/license-expiration/'}
                target="_blank"
                rel="noreferrer noopener"
              >
                license expiration
              </a>{' '}
              and{' '}
              <a
                href={'https://grafana.com/docs/grafana/latest/enterprise/license/activate-license/'}
                target="_blank"
                rel="noreferrer noopener"
              >
                license activation
              </a>
              .
            </div>
            <CardContent
              content={[
                { name: 'Token ID', value: token.jti },
                { name: 'Token issued', value: dateTimeFormat(token.iat * 1000) },
                {
                  name: 'Token expires',
                  value: dateTimeFormat(token.exp * 1000),
                  highlight: !!getTokenStatus(token)?.state,
                  tooltip:
                    'Grafana automatically updates the token before it expires. If your token is not updating, contact support.',
                },
              ]}
              state={tokenState}
            />
          </>
        </LicenseCard>
        <LicenseCard
          {...getUtilStatus(token, stats)}
          title={'Utilization'}
          footer={
            <small className={styles.footerText}>
              Utilization of licenced users is determined based on signed-in users&apos; activity in the past 30 days.
            </small>
          }
        >
          <>
            <div className={styles.message}>
              <Icon name={'document-info'} />
              Read about{' '}
              <a
                href={
                  'https://grafana.com/docs/grafana/latest/enterprise/license/license-restrictions/#active-users-limit'
                }
                target="_blank"
                rel="noreferrer noopener"
              >
                active user limits
              </a>{' '}
              and{' '}
              <a
                href={
                  'https://grafana.com/docs/grafana/latest/enterprise/license/license-restrictions/#concurrent-sessions-limit'
                }
                target="_blank"
                rel="noreferrer noopener"
              >
                concurrent session limits
              </a>
              .
            </div>

            {token.limit_by === LIMIT_BY_USERS && (
              <CardContent
                content={[
                  {
                    name: 'Active licensed users',
                    value: getUserStatMessage(token.included_users, activeUsers),
                    highlight: getRate(token.included_users, activeUsers) >= WARNING_RATE,
                  },
                  ...(config.bootData.settings.anonymousEnabled?
                  [{
                    name: 'Authenticated users',
                    value: stats?.active_users || 0,
                    indentLevel: 1,
                  },
                  {
                    name: 'Anonymous users',
                    value: Math.floor(( stats?.active_anonymous_devices || 0 )/anonymousRatio),
                    tooltip: `For every ${anonymousRatio} anonymous ${anonymousRatio > 1 ? 'devices' : 'device'}, Grafana counts 1 user.`,
                    indentLevel: 1,
                  },]
                  : []),
                ]}
                state={utilState}
              />
            )}
          </>
        </LicenseCard>
      </div>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    title: css`
      margin: ${theme.spacing(4)} 0;
    `,
    infoText: css`
      font-size: ${theme.typography.size.sm};
    `,
    uploadWrapper: css`
      margin-left: 79px;
    `,
    row: css`
      display: flex;
      justify-content: space-between;
      width: 100%;
      flex-wrap: wrap;
      gap: ${theme.spacing(2)};

      & > div {
        flex: 1 1 340px;
      }
    `,
    footerText: css`
      margin-bottom: ${theme.spacing(2)};
    `,
    licenseCard: css`
      background: url('/public/img/licensing/card-bg-${theme.isLight ? 'light' : 'dark'}.svg') center no-repeat;
      background-size: cover;
    `,
    message: css`
      height: 70px;
      a {
        color: ${theme.colors.text.link};

        &:hover {
          text-decoration: underline;
        }
      }

      svg {
        margin-right: ${theme.spacing(0.5)};
      }
    `,
  };
};

type PageAlertProps = {
  state?: CardState;
  message?: string;
  title: string;
  orgSlug: string;
  licenseId: string;
};

const PageAlert = ({ state, message, title, orgSlug, licenseId }: PageAlertProps) => {
  const styles = useStyles2(getPageAlertStyles);
  if (!state) {
    return null;
  }

  return (
    <Alert title={title} severity={state || undefined}>
      <div className={styles.container}>
        <div>
          <p>{message}</p>
          <a
            className={styles.link}
            href={'https://grafana.com/docs/grafana/latest/enterprise/license/license-restrictions/'}
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn about Enterprise licenses
          </a>
        </div>
        <CustomerSupportButton orgSlug={orgSlug} licenseId={licenseId} />
      </div>
    </Alert>
  );
};

const getPageAlertStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      width: 100%;
    `,
    link: css`
      font-size: ${theme.typography.bodySmall.fontSize};
      text-decoration: underline;
      color: ${theme.colors.text.secondary};

      &:hover {
        color: ${theme.colors.text.primary};
      }
    `,
  };
};

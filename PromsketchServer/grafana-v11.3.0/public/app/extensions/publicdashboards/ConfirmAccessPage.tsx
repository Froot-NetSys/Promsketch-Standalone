import { css } from '@emotion/css';
import { useParams } from 'react-router-dom-v5-compat';

import { GrafanaTheme2 } from '@grafana/data';
import { selectors as e2eSelectors } from '@grafana/e2e-selectors/src';
import { Button, Spinner, useStyles2 } from '@grafana/ui';
import { InnerBox, LoginLayout } from 'app/core/components/Login/LoginLayout';
import { useQueryParams } from 'app/core/hooks/useQueryParams';

import { useConfirmAccessMutation } from './api/emailSharingApi';

const selectors = e2eSelectors.pages.PublicDashboardConfirmAccess;
export function ConfirmAccessPage() {
  const styles = useStyles2(getStyles);

  const { accessToken = '' } = useParams<{ accessToken: string }>();
  const [{ magicLinkToken }] = useQueryParams();
  const [confirmAccess, { isLoading, isSuccess }] = useConfirmAccessMutation();
  const onConfirmAccessClick = async () => {
    await confirmAccess({ accessToken, magicLinkToken: String(magicLinkToken) });
  };

  return (
    <LoginLayout
      branding={{
        loginTitle: 'Dashboard access',
        loginSubtitle:
          'Get access to the dashboard for 30 days. After 30 days, you can request access again to continue viewing the dashboard.',
        hideFooter: true,
      }}
    >
      <InnerBox>
        <Button
          data-testid={selectors.submitButton}
          disabled={isLoading || isSuccess}
          type="submit"
          className={styles.form}
          onClick={onConfirmAccessClick}
        >
          <span>Confirm access</span>
          {isLoading && <Spinner className={styles.loadingSpinner} />}
        </Button>
      </InnerBox>
    </LoginLayout>
  );
}

export default ConfirmAccessPage;

const getStyles = (theme: GrafanaTheme2) => ({
  loadingSpinner: css({
    marginLeft: theme.spacing(1),
  }),
  form: css({
    justifyContent: 'center',
    width: '100%',
  }),
});

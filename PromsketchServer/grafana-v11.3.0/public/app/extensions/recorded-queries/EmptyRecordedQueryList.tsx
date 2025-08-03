import { css } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { CallToActionCard, Icon, useStyles2 } from '@grafana/ui';

export const EmptyRecordedQueryList = (): JSX.Element => {
  const styles = useStyles2(getStyles);

  return (
    <CallToActionCard
      className={styles.cta}
      message={'No recorded queries defined'}
      footer={
        <span key="proTipFooter">
          <Icon name="rocket" />
          ProTip: {'You can record queries from the query editor.'}
        </span>
      }
      callToActionElement={<></>}
    />
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    cta: css`
      text-align: center;
    `,
  };
};

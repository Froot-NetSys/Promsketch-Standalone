import { css } from '@emotion/css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import * as React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Icon, IconButton, IconName, useStyles2, useTheme2 } from '@grafana/ui';
import { useGrafana } from 'app/core/context/GrafanaContext';
import { appEvents } from 'app/core/core';

import { PageBannerDisplayEvent, PageBannerEventPayload, PageBannerSeverity } from './types';

export function PageBanner(): React.ReactElement | null {
  const [banner, setBanner] = useState<PageBannerEventPayload | undefined>();
  const severityStyling = useStylingBySeverity(banner?.severity);
  const styles = useStyles2((theme) => getStyles(theme, severityStyling));
  const { chrome } = useGrafana();
  const state = chrome.useState();

  // WARNING: do not use arrow functions here as it overrides the `this` binding in the subscription causing errors
  useEffect(
    function () {
      const sub = appEvents.subscribe(PageBannerDisplayEvent, (event) => {
        if (!state.chromeless) {
          setBanner(event.payload);
        }
      });
      return function () {
        sub.unsubscribe();
      };
    },
    [state.chromeless]
  );

  const onClose = useCallback(() => {
    setBanner(undefined);

    if (banner?.onClose) {
      banner.onClose();
    }
  }, [banner]);

  if (!banner) {
    return null;
  }

  const BannerBody = banner.body;

  return (
    <div className={styles.banner}>
      <div className={styles.icon}>
        <Icon size="xl" name={severityStyling.icon} />
      </div>
      <div className={styles.content}>
        <BannerBody severity={banner.severity ?? PageBannerSeverity.info} />
      </div>
      {banner?.onClose && (
        <div className={styles.icon}>
          <IconButton
            size="xl"
            name="times"
            onClick={onClose}
            className={styles.close}
            aria-label="Close banner"
            tooltip="Close"
          />
        </div>
      )}
    </div>
  );
}

type SeverityStyling = {
  text: string;
  background: string;
  icon: IconName;
};

function useStylingBySeverity(severity: PageBannerSeverity | undefined): SeverityStyling {
  const theme = useTheme2();
  return useMemo(() => {
    switch (severity) {
      case PageBannerSeverity.error:
        return {
          icon: 'exclamation-circle',
          background: theme.colors.error.main,
          text: theme.colors.error.contrastText,
        };

      case PageBannerSeverity.warning:
        return {
          icon: 'exclamation-triangle',
          background: theme.colors.warning.main,
          text: theme.colors.warning.contrastText,
        };

      case PageBannerSeverity.info:
      default:
        return {
          icon: 'info-circle',
          background: theme.colors.info.main,
          text: theme.colors.info.contrastText,
        };
    }
  }, [theme, severity]);
}

function getStyles(theme: GrafanaTheme2, severityStyling: SeverityStyling) {
  return {
    banner: css`
      flex-grow: 0;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      background-color: ${severityStyling.background};
      border-radius: 2px;
      height: 52px;
    `,
    icon: css`
      padding: ${theme.spacing(0, 2)};
      color: ${severityStyling.text};
      display: flex;
    `,
    content: css`
      flex-grow: 1;
      display: flex;
      align-items: center;
      color: ${severityStyling.text};
    `,
    close: css`
      color: ${severityStyling.text};
    `,
  };
}

// Uncomment to test this banner
// setTimeout(() => {
//   appEvents.publish(
//     new PageBannerDisplayEvent({
//       onClose: () => {},
//       body: function test() {
//         return (
//           <div>
//             This is a warning that you will be suspended{' '}
//             <Button fill="outline" variant="secondary">
//               Upgrade to Pro
//             </Button>
//           </div>
//         );
//       },
//     })
//   );
// }, 3000);

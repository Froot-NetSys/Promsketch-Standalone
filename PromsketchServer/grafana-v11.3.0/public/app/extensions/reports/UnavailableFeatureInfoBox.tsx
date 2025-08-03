import * as React from 'react';

import { InfoBox } from '@grafana/ui';

export interface Props {
  message: string;
}

export const UnavailableFeatureInfoBox: React.FC<Props> = ({ message }) => {
  return (
    <InfoBox
      title="Feature not available with an expired license"
      url="https://grafana.com/docs/grafana/latest/enterprise/license-expiration/"
      urlTitle="Read more on license expiration"
    >
      <span>{message}</span>
    </InfoBox>
  );
};

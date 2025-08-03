import { css } from '@emotion/css';
import * as React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Button, FileUpload, TextArea, useStyles2 } from '@grafana/ui';

export type Props = React.ComponentProps<typeof TextArea> & {
  isConfigured: boolean;
  onReset: () => void;
  onFileUpload: (event: React.FormEvent<HTMLInputElement>) => void;
};

export const TextInputWithReset = ({ isConfigured, onReset, onFileUpload, ...props }: Props): JSX.Element => {
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.inputWithReset}>
      <div className={styles.textAreaInput}>
        {isConfigured && <TextArea {...props} value="configured" disabled />}
        {!isConfigured && <TextArea {...props} />}
      </div>
      {isConfigured && (
        <Button className={styles.fileUploadButton} variant="primary" size="md" onClick={onReset}>
          Reset
        </Button>
      )}
      {!isConfigured && (
        <FileUpload className={styles.fileUploadButton} showFileName={false} onFileUpload={onFileUpload} />
      )}
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    resetButton: css`
      border-top-left-radius: 0px;
      border-bottom-left-radius: 0px;
    `,
    fileUploadButton: css`
      margin-left: ${theme.spacing(1)};
    `,
    inputWithReset: css`
      padding: 0;
      display: flex;
    `,
    textAreaInput: css`
      width: ${theme.spacing(60)};
    `,
  };
};

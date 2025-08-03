import { css } from '@emotion/css';
import { FormEvent } from 'react';

import { Button, FileUpload, stylesFactory } from '@grafana/ui';

interface Props {
  isUploading: boolean;
  title?: string;
  onFileUpload: (event: FormEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  licensedUrl?: string;
}

export const LicenseTokenUpload = ({ isUploading, title, onFileUpload, isDisabled, licensedUrl }: Props) => {
  const styles = getStyles();

  return (
    <>
      {title && <h2 className={styles.title}>{title}</h2>}
      {isUploading ? (
        <Button disabled={true}>Uploading…</Button>
      ) : isDisabled ? (
        <Button disabled={true}>Upload a new token</Button>
      ) : (
        <FileUpload onFileUpload={onFileUpload} accept=".jwt">
          Upload a new token
        </FileUpload>
      )}
      {licensedUrl && (
        <p className={styles.instanceUrl}>
          Instance URL: <code>{licensedUrl}</code>
        </p>
      )}
    </>
  );
};

const getStyles = stylesFactory(() => {
  return {
    title: css`
      margin-top: 30px;
      margin-bottom: 20px;
    `,
    instanceUrl: css`
      margin-top: 10px;
    `,
  };
});

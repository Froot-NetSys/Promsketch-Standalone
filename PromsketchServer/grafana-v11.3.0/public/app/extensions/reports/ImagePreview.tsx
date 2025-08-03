import { css, cx } from '@emotion/css';

import { GrafanaTheme } from '@grafana/data';
import { useStyles } from '@grafana/ui';

import { isValidImageExt } from '../utils/validators';

export interface Props {
  url: string;
  width?: string;
  altText: string;
}

const isValidImg = (val: string) => {
  if (val.startsWith('http')) {
    return isValidImageExt(val);
  }
  return true;
};

export const ImagePreview = ({ url, altText, width = '200px' }: Props) => {
  const styles = useStyles(getStyles);
  return url ? (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width};
        `
      )}
    >
      {isValidImg(url) ? <img src={url} className={styles.img} alt={altText} /> : 'Invalid image'}
    </div>
  ) : null;
};

const getStyles = (theme: GrafanaTheme) => {
  return {
    wrapper: css`
      padding: ${theme.spacing.sm};
      border: 1px solid ${theme.colors.border3};
      border-radius: ${theme.border.radius.sm};
      margin-bottom: ${theme.spacing.md};
    `,
    img: css`
      width: 100%;
    `,
  };
};

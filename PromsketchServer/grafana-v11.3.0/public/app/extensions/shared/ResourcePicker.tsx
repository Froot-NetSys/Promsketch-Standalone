import { css, cx } from '@emotion/css';
import { useState } from 'react';
import { Controller, Path, useFormContext } from 'react-hook-form';

import { GrafanaTheme2 } from '@grafana/data';
import {
  FileDropzone,
  Input,
  RadioButtonGroup,
  useStyles2,
  ColorPickerInput,
  FileListItem,
  Field,
  Stack,
} from '@grafana/ui';

import { getContentType, isFile } from './utils/content';
import { isValidUrl } from './utils/data';

export type ContentType = 'url' | 'file' | 'color';

export type TypeOptions = Array<{ label: string; value: ContentType }>;

export const resourceTypeOptions: TypeOptions = [
  { label: 'Paste URL', value: 'url' },
  { label: 'Upload file', value: 'file' },
  { label: 'Custom color', value: 'color' },
];

interface ResourcePickerProps<T> {
  name: Path<T>;
  disabled?: boolean;
  allowedTypes?: ContentType[];
}

export function ResourcePicker<T>({ name, disabled, allowedTypes = ['url', 'file'] }: ResourcePickerProps<T>) {
  const {
    control,
    register,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const [initialValue] = useState(getValues()[name]);
  const currentValue = watch(name, initialValue);
  const [contentType, setContentType] = useState<ContentType>(getContentType(getValues()[name]));
  const styles = useStyles2(getStyles);

  return (
    <Stack gap={2} direction={'column'} data-testid={`resource-picker-${name}`}>
      <div>
        <RadioButtonGroup
          options={resourceTypeOptions.filter((opt) => allowedTypes.includes(opt.value))}
          onChange={(value) => {
            setContentType(value);
            if (getContentType(initialValue) === value) {
              setValue(name, initialValue);
            } else {
              setValue<string>(name, '');
            }
          }}
          disabled={disabled}
          className={styles.buttonGroup}
          value={contentType}
        />
      </div>
      {contentType === 'file' && (
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, ref, ...field } }) => (
            <div className={cx(styles.dropzone, disabled && styles.disabled)}>
              <FileDropzone
                {...field}
                readAs={'readAsBinaryString'}
                onFileRemove={!disabled ? () => setValue<string>(name, '') : undefined}
                options={{
                  disabled,
                  multiple: false,
                  accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
                  onDrop: (file: File[]) => {
                    onChange(file[0]);
                  },
                }}
              />
              {!isFile(currentValue) && currentValue !== '' && (
                <FileListItem
                  removeFile={!disabled ? () => setValue<string>(name, '') : undefined}
                  file={{ file: new File([currentValue], currentValue), error: null, id: '' }}
                />
              )}
            </div>
          )}
        />
      )}
      {contentType === 'url' && (
        <Field
          invalid={!!errors[name]}
          error={errors[name] && String(errors[name]?.message)}
          className={styles.customField}
        >
          <Input
            {...register(name, {
              validate: (val) => isValidUrl(val) || 'Invalid URL',
            })}
            id={name}
            placeholder={'https://your.site/image.png'}
            disabled={disabled}
          />
        </Field>
      )}
      {contentType === 'color' && (
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <div className={styles.pickerContainer}>
              <ColorPickerInput {...field} id={name} placeholder={'Select color'} disabled={disabled} />
            </div>
          )}
        />
      )}
    </Stack>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    pickerContainer: css`
      display: flex;
      position: relative;
    `,
    // Hide accepted files text and fle size for previews
    // TODO Fix in the FileDropzone component instead
    dropzone: css`
      & > div {
        & > small:first-of-type {
          display: none;
        }
      }
      // FileListItem
      & > div:nth-of-type(2) {
        & > span {
          & > span:nth-of-type(2) {
            display: none;
          }
        }
      }
    `,
    colorValue: css`
      margin-left: ${theme.spacing(1)};
    `,
    buttonGroup: css`
      margin-bottom: ${theme.spacing(2)};
    `,
    disabled: css`
      div {
        cursor: not-allowed;
      }
    `,
    customField: css`
      margin-top: -${theme.spacing(2)};
    `,
  };
};

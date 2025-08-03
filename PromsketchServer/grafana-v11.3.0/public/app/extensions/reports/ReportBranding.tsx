import { useFormContext, Controller } from 'react-hook-form';

import { SelectableValue } from '@grafana/data';
import { Input, Field, RadioButtonGroup, FieldSet } from '@grafana/ui';
import { contextSrv } from 'app/core/core';

import { ResourcePicker } from '../shared/ResourcePicker';
import { getResourceUrl } from '../shared/utils/data';
import { AccessControlAction, FooterMode } from '../types';

import { ImagePreview } from './ImagePreview';
import { defaultEmailLogo, defaultReportLogo } from './constants';

const footerModeOptions: SelectableValue[] = [
  { label: 'Sent By', value: FooterMode.SentBy },
  { label: 'None', value: FooterMode.None },
];

const ReportBranding = () => {
  const { register, control, watch } = useFormContext();

  const watchReportLogo = watch('reportLogoUrl') || defaultReportLogo;
  const watchEmailLogo = watch('emailLogoUrl') || defaultEmailLogo;
  const watchFooterMode = watch('emailFooterMode');
  const canEditSettings = contextSrv.hasPermission(AccessControlAction.ReportingSettingsWrite);

  return (
    <>
      <FieldSet label="Report branding" disabled={!canEditSettings}>
        <Field
          htmlFor={'reportLogoUrl'}
          label="Company logo URL"
          description="The logo will be displayed in the document footer. Supported formats: png, jpg, gif."
        >
          <ResourcePicker name={'reportLogoUrl'} />
        </Field>
        <ImagePreview
          url={watchReportLogo === defaultReportLogo ? defaultReportLogo : getResourceUrl(watchReportLogo)}
          width="60px"
          altText="Company logo preview"
        />
      </FieldSet>

      <FieldSet label="Email branding" disabled={!canEditSettings}>
        <Field
          htmlFor={'emailLogoUrl'}
          label="Company logo URL"
          description="The logo will be displayed in the email header. Supported formats: png, jpg, gif."
        >
          <ResourcePicker name={'emailLogoUrl'} />
        </Field>
        <ImagePreview
          url={watchEmailLogo === defaultEmailLogo ? defaultEmailLogo : getResourceUrl(watchEmailLogo)}
          altText="Company logo preview"
        />
        <Field label="Email footer">
          <Controller
            name="emailFooterMode"
            render={({ field: { ref, ...field } }) => <RadioButtonGroup {...field} options={footerModeOptions} />}
            control={control}
          />
        </Field>
        {watchFooterMode === FooterMode.SentBy && (
          <>
            <Field label="Footer link text">
              <Input {...register('emailFooterText')} id="emailFooterText" placeholder="Grafana" type="text" />
            </Field>
            <Field label="Footer link URL">
              <Input {...register('emailFooterLink')} id="emailFooterLink" placeholder="https://your.site" type="url" />
            </Field>
          </>
        )}
      </FieldSet>
    </>
  );
};

export default ReportBranding;

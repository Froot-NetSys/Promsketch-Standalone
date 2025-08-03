import { css } from '@emotion/css';
import { useForm, Controller } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import { featureEnabled } from '@grafana/runtime';
import {
  Alert,
  Button,
  Checkbox,
  Field,
  FieldSet,
  Input,
  ModalsController,
  TagsInput,
  TextArea,
  useStyles2,
} from '@grafana/ui';
import { contextSrv } from 'app/core/core';

import { AccessControlAction, EnterpriseStoreState, ReportFormData, StepKey } from '../../types';
import { emailSeparator, isEmail, validateMultipleEmails } from '../../utils/validators';
import { SendTestEmailModal } from '../SendTestEmailModal';
import { selectors } from '../e2e-selectors/selectors';
import { sendTestEmail } from '../state/actions';
import { updateReportProp } from '../state/reducers';
import { dashboardsInvalid } from '../utils/dashboards';
import { canEditReport } from '../utils/permissions';

import ReportForm from './ReportForm';

type EmailData = Pick<ReportFormData, 'name' | 'replyTo' | 'recipients' | 'message' | 'enableDashboardUrl'>;

const mapStateToProps = (state: EnterpriseStoreState) => {
  const { testEmailIsSending, report } = state.reports;
  return {
    report,
    testEmailIsSending,
  };
};

const mapActionsToProps = {
  updateReportProp,
  sendTestEmail,
};

const connector = connect(mapStateToProps, mapActionsToProps);
export type Props = ConnectedProps<typeof connector> & { reportId?: string };

export const Share = ({ report, reportId, updateReportProp, sendTestEmail, testEmailIsSending }: Props) => {
  const { message, name, recipients, replyTo, enableDashboardUrl, dashboards } = report;
  const {
    handleSubmit,
    control,
    register,
    setError,
    clearErrors,
    watch,
    getValues,
    formState: { errors, isDirty },
  } = useForm<EmailData>({
    mode: 'onBlur',
  });
  const styles = useStyles2(getStyles);
  const canSendEmail = contextSrv.hasPermission(AccessControlAction.ReportingSend);
  const watchName = watch('name', name);
  const watchRecipients = watch('recipients', recipients);
  const sendEmailDisabled =
    !canSendEmail ||
    !featureEnabled('reports.email') ||
    !watchName ||
    !watchRecipients ||
    dashboardsInvalid(dashboards);

  const onSendTestEmail = (email: string, useEmailsFromReport: boolean) => {
    const reportData = { ...report, ...getValues() };
    const recipients = useEmailsFromReport ? reportData.recipients : email;
    return sendTestEmail({ ...reportData, recipients });
  };

  const saveData = (data: EmailData) => {
    if (isDirty) {
      const { name } = data;
      updateReportProp({ ...report, ...data, name: name.trim() });
    }
  };

  const getFormData = () => {
    const data = getValues();
    const { name } = data;
    return { ...data, name: name.trim() };
  };
  return (
    <ReportForm
      activeStep={StepKey.Share}
      onSubmit={handleSubmit(saveData)}
      confirmRedirect={isDirty}
      getFormData={getFormData}
      reportId={reportId}
      pageActions={[
        <ModalsController key={'send-test-email'}>
          {({ showModal, hideModal }) => (
            <Button
              disabled={sendEmailDisabled}
              size="xs"
              variant="secondary"
              data-testid={selectors.components.reportForm.sendTestEmailButton}
              onClick={(e) => {
                e.preventDefault();
                showModal(SendTestEmailModal, {
                  onDismiss: hideModal,
                  onSendTestEmail,
                  emails: watchRecipients,
                });
              }}
            >
              Send test email
            </Button>
          )}
        </ModalsController>,
      ]}
    >
      {testEmailIsSending && (
        <div className={'page-alert-list'}>
          <Alert title={'Sending test email...'} severity={'info'} elevated />
        </div>
      )}
      <FieldSet label={'4. Share'} disabled={!canEditReport}>
        <Field label="Report name" required invalid={!!errors.name} error="Name is required">
          <Input
            {...register('name')}
            type="text"
            id="name"
            defaultValue={name}
            placeholder="System status report"
            data-testid={selectors.components.reportForm.nameInput}
          />
        </Field>
        <Field
          className={styles.field}
          label="Recipients"
          required
          invalid={!!errors.recipients}
          error={errors.recipients?.message}
          description={'Separate multiple emails with a comma or semicolon.'}
        >
          <Controller
            name="recipients"
            control={control}
            defaultValue={recipients}
            render={({ field: { ref, value, onChange, ...field } }) => {
              return (
                <TagsInput
                  {...field}
                  id="recipients"
                  disabled={!canEditReport}
                  invalid={!!errors.recipients}
                  onChange={(tags) => {
                    const splitTags = tags
                      .join(';')
                      .split(emailSeparator)
                      .filter(Boolean)
                      .map((tag) => tag.trim());
                    const invalidEmails = splitTags.filter((tag) => !isEmail(tag));
                    if (invalidEmails.length) {
                      setError('recipients', {
                        type: 'manual',
                        message: `Invalid email${invalidEmails.length > 1 ? 's' : ''}: ${invalidEmails.join('; ')}`,
                      });
                    } else {
                      clearErrors('recipients');
                    }
                    onChange(splitTags.filter((tag) => isEmail(tag)).join(';'));
                  }}
                  placeholder={'Type in the recipients email addresses and press Enter'}
                  tags={value ? value.split(emailSeparator) : []}
                  className={styles.tagsInput}
                  addOnBlur
                />
              );
            }}
            rules={{
              validate: (val) => {
                return validateMultipleEmails(val) || 'Invalid email';
              },
            }}
          />
        </Field>
        <Field
          invalid={!!errors.replyTo}
          error={errors.replyTo?.message}
          className={styles.field}
          label="Reply-to email address"
          description={'The address that will appear in the Reply to field of the email'}
        >
          <Input
            {...register('replyTo', {
              validate: (val) => {
                return validateMultipleEmails(val) || 'Invalid email';
              },
            })}
            id="replyTo"
            placeholder="your.address@company.com - optional"
            type="email"
            defaultValue={replyTo}
          />
        </Field>
        <Field className={styles.field} label="Message">
          <TextArea {...register('message')} id="message" placeholder={message} rows={10} defaultValue={message} />
        </Field>
        <Field className={styles.field}>
          <Checkbox
            {...register('enableDashboardUrl')}
            defaultChecked={enableDashboardUrl}
            label="Include a dashboard link"
          />
        </Field>
      </FieldSet>
    </ReportForm>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    field: css`
      &:not(:last-of-type) {
        margin-bottom: ${theme.spacing(3)};
      }
    `,
    tagsInput: css`
      li {
        margin-bottom: ${theme.spacing(1)};
        background-color: ${theme.colors.background.secondary} !important;
        border-color: ${theme.components.input.borderColor} !important;
        color: ${theme.colors.text.primary};
      }
    `,
  };
};
export default connector(Share);

import { css } from '@emotion/css';
import { isLastDayOfMonth } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';

import { dateTime, GrafanaTheme2, SelectableValue } from '@grafana/data';
import {
  Checkbox,
  DatePickerWithInput,
  Field,
  FieldSet,
  Stack,
  Icon,
  Input,
  RadioButtonGroup,
  Select,
  TimeOfDayPicker,
  TimeZonePicker,
  useStyles2,
} from '@grafana/ui';

import {
  EnterpriseStoreState,
  IntervalFrequency,
  LAST_DAY_OF_MONTH,
  ReportFormData,
  SchedulingFrequency,
  StepKey,
} from '../../types';
import { getTimezone, updateReportProp } from '../state/reducers';
import { getDate, getTime, canBeLastDayOfMonth } from '../utils/dateTime';
import { canEditReport } from '../utils/permissions';
import { isHourFrequency, schedulePreview, showWorkdaysOnly, getOrdinal, getSchedule } from '../utils/scheduler';

import ReportForm from './ReportForm';

const mapStateToProps = (state: EnterpriseStoreState) => {
  const { report } = state.reports;
  return {
    report,
  };
};

const mapActionsToProps = {
  updateReportProp,
};

const connector = connect(mapStateToProps, mapActionsToProps);
export type Props = ConnectedProps<typeof connector> & { reportId?: string };

const frequencyOptions: SelectableValue[] = [
  { label: 'Once', value: SchedulingFrequency.Once },
  { label: 'Hourly', value: SchedulingFrequency.Hourly },
  { label: 'Daily', value: SchedulingFrequency.Daily },
  { label: 'Weekly', value: SchedulingFrequency.Weekly },
  { label: 'Monthly', value: SchedulingFrequency.Monthly },
  { label: 'Custom', value: SchedulingFrequency.Custom },
  { label: 'Never', value: SchedulingFrequency.Never },
];

const intervalOptions: SelectableValue[] = [
  { label: 'hours', value: IntervalFrequency.Hours },
  { label: 'days', value: IntervalFrequency.Days },
  { label: 'weeks', value: IntervalFrequency.Weeks },
  { label: 'months', value: IntervalFrequency.Months },
];

const sendOnTheLastDay = (sendTime: string) => sendTime === 'now' && canBeLastDayOfMonth(dateTime().toDate().getDate());

export const Schedule = ({ report, updateReportProp, reportId }: Props) => {
  const {
    handleSubmit,
    control,
    watch,
    register,
    setValue,
    getValues,
    formState: { isDirty },
  } = useForm();
  const { frequency, timeZone, startDate, endDate, dayOfMonth, intervalAmount, intervalFrequency } = report.schedule;
  const defaultStartDate = frequency === SchedulingFrequency.Never ? '' : startDate;
  const defaultSendTime = defaultStartDate ? 'later' : 'now';
  const defaultSchedule = {
    startDate: defaultStartDate,
    sendTime: defaultSendTime,
    intervalFrequency: IntervalFrequency.Hours,
    intervalAmount: '2',
    sendOnLastDayOfMonth: dayOfMonth === LAST_DAY_OF_MONTH,
    ...report.schedule,
  };
  const watchSchedule = watch('schedule', defaultSchedule) || {};
  const {
    frequency: watchFrequency,
    startDate: watchStartDate,
    endDate: watchEndDate,
    intervalFrequency: watchIntervalFrequency = IntervalFrequency.Hours,
    dayOfMonth: watchDayOfMonth,
    sendOnLastDayOfMonth: watchSendOnLastDayOfMonth,
    sendTime: watchSendTime = defaultSendTime,
    workdaysOnly: watchWorkdaysOnly,
  } = watchSchedule;
  const styles = useStyles2(getStyles);
  const date = new Date(watchStartDate);

  const saveData = (data: Partial<ReportFormData>) => {
    if (isDirty) {
      const schedule = getSchedule(data.schedule);
      updateReportProp({ ...report, schedule });
    }
  };

  const getFormData = () => {
    return { schedule: getSchedule(getValues().schedule) };
  };

  const onStartDateChange = (date: Date) => {
    const sendOnLastDayOfMonth = watchSendOnLastDayOfMonth && isLastDayOfMonth(date);
    setValue('schedule.sendOnLastDayOfMonth', sendOnLastDayOfMonth);
    setValue('schedule.dayOfMonth', sendOnLastDayOfMonth ? LAST_DAY_OF_MONTH : '');
  };

  const onSendOnLastDayOfMonthChange = (isChecked: boolean) => {
    const endOfMonthDate = dateTime(watchStartDate).endOf('month').toDate();
    setValue('schedule.startDate', endOfMonthDate);
    setValue('schedule.dayOfMonth', isChecked ? LAST_DAY_OF_MONTH : '');
  };

  return (
    <ReportForm
      activeStep={StepKey.Schedule}
      onSubmit={handleSubmit(saveData)}
      confirmRedirect={isDirty}
      getFormData={getFormData}
      reportId={reportId}
    >
      <FieldSet label="3. Schedule">
        <Field label="Frequency">
          <Controller
            defaultValue={frequency}
            name="schedule.frequency"
            render={({ field: { ref, onChange, ...field } }) => (
              <RadioButtonGroup
                {...field}
                fullWidth
                options={frequencyOptions}
                disabled={!canEditReport}
                onChange={(val) => {
                  if (!showWorkdaysOnly(val, watchIntervalFrequency)) {
                    setValue('schedule.workdaysOnly', false);
                  }
                  onChange(val);
                }}
              />
            )}
            control={control}
          />
        </Field>

        {watchFrequency !== SchedulingFrequency.Never && (
          <Field label={'Time'}>
            <Controller
              control={control}
              name={'schedule.sendTime'}
              defaultValue={defaultSendTime}
              render={({ field: { ref, onChange, ...field } }) => (
                <RadioButtonGroup
                  {...field}
                  onChange={(value) => {
                    if (value !== 'now' && !watchStartDate) {
                      setValue('schedule.startDate', dateTime().toDate());
                    } else if (value === 'now') {
                      setValue('schedule.startDate', '');
                    }
                    onChange(value);
                  }}
                  options={[
                    { label: 'Send now', value: 'now' },
                    { label: 'Send later', value: 'later' },
                  ]}
                />
              )}
            />
          </Field>
        )}

        <>
          {watchFrequency === SchedulingFrequency.Custom && (
            <Stack>
              <Field label={'Repeat every'}>
                <Input
                  type={'number'}
                  min={'2'}
                  {...register('schedule.intervalAmount')}
                  placeholder={'e.g. 2'}
                  defaultValue={intervalAmount || 2}
                  id={'repeat-frequency'}
                />
              </Field>
              <Field label={' '}>
                <Controller
                  control={control}
                  defaultValue={
                    intervalOptions.find((opt) => opt.value === intervalFrequency)?.value || IntervalFrequency.Hours
                  }
                  render={({ field: { ref, onChange, ...field } }) => (
                    <Select
                      {...field}
                      onChange={(interval) => onChange(interval.value)}
                      options={intervalOptions}
                      width={16}
                      placeholder={'hours'}
                      aria-label={'Custom frequency'}
                    />
                  )}
                  name={'schedule.intervalFrequency'}
                />
              </Field>
            </Stack>
          )}

          {watchFrequency === SchedulingFrequency.Monthly &&
            (sendOnTheLastDay(watchSendTime) || watchSendTime === 'later') && (
              <Field>
                <Controller
                  control={control}
                  defaultValue={watchDayOfMonth === LAST_DAY_OF_MONTH}
                  render={({ field: { onChange, ...field } }) => (
                    <Checkbox
                      {...field}
                      label={'Send on the last day of month'}
                      onChange={(e) => {
                        onSendOnLastDayOfMonthChange(e.currentTarget.checked);
                        onChange(e.currentTarget.checked);
                      }}
                    />
                  )}
                  name={'schedule.sendOnLastDayOfMonth'}
                />
              </Field>
            )}
        </>

        {/*Hide date/time fields instead of completely removing them, so the timezone value doesn't get reset */}
        <div className={watchSendTime !== 'now' && watchFrequency !== SchedulingFrequency.Never ? '' : styles.hidden}>
          <Stack>
            <Field label={'Start date'}>
              <Controller
                name={'schedule.startDate'}
                control={control}
                defaultValue={getDate(defaultStartDate)}
                render={({ field: { ref, onChange, ...field } }) => (
                  <DatePickerWithInput
                    {...field}
                    width={16}
                    placeholder={'Select date'}
                    aria-label={'Report schedule start date'}
                    closeOnSelect
                    onChange={(v) => {
                      const date = new Date(v);
                      onStartDateChange(date);
                      onChange(date);
                    }}
                  />
                )}
              />
            </Field>

            <Field label="Start time">
              <Controller
                name="schedule.time"
                render={({ field: { onChange, ref, value, ...field } }) => (
                  <TimeOfDayPicker
                    {...field}
                    value={value as any}
                    minuteStep={10}
                    disabled={!canEditReport}
                    onChange={(selected) => {
                      if (selected.isValid()) {
                        onChange({
                          hour: selected.hour?.(),
                          minute: selected.minute?.(),
                        });
                      }
                    }}
                  />
                )}
                defaultValue={getTime(startDate)}
                control={control}
              />
            </Field>
            <>
              <Field label="Time zone">
                <Controller
                  name="schedule.timeZone"
                  render={({ field: { ref, ...field } }) => (
                    <TimeZonePicker {...field} width={30} disabled={!canEditReport} />
                  )}
                  defaultValue={timeZone || getTimezone()}
                  control={control}
                />
              </Field>
            </>
          </Stack>
        </div>
        {watchFrequency === SchedulingFrequency.Monthly &&
          !watchSendOnLastDayOfMonth &&
          (canBeLastDayOfMonth(date.getDate()) || sendOnTheLastDay(watchSendTime)) && (
            <small className={styles.warningText}>
              Note: some months do not have a{' '}
              {getOrdinal(sendOnTheLastDay(watchSendTime) ? dateTime().toDate().getDate() : date.getDate())} day and
              reports will not be sent on those months. Choose an earlier date or{' '}
              <strong>&quot;Send on the last day of month&quot;</strong> to send a report at the end of each month.
            </small>
          )}
        {![SchedulingFrequency.Once, SchedulingFrequency.Never].includes(watchFrequency) && (
          <Stack>
            <Field label={'End date'}>
              <Controller
                name={'schedule.endDate'}
                control={control}
                defaultValue={getDate(endDate)}
                render={({ field: { ref, ...field } }) => (
                  <DatePickerWithInput
                    {...field}
                    width={16}
                    placeholder={'Does not end'}
                    aria-label={'Report schedule end date'}
                    minDate={new Date(watchStartDate)}
                    closeOnSelect
                  />
                )}
              />
            </Field>

            {watchEndDate &&
              (watchFrequency === SchedulingFrequency.Hourly ||
                isHourFrequency(watchFrequency, watchIntervalFrequency)) && (
                <Field label="End time">
                  <Controller
                    name="schedule.endTime"
                    render={({ field: { onChange, ref, value, ...field } }) => (
                      <TimeOfDayPicker
                        {...field}
                        // The component is missing MomentInput type, even though moment.js is used for conversion
                        value={value as any}
                        minuteStep={10}
                        disabled={!canEditReport}
                        onChange={(selected) => {
                          if (selected?.isValid()) {
                            onChange({
                              hour: selected.hour?.(),
                              minute: selected.minute?.(),
                            });
                          }
                        }}
                      />
                    )}
                    defaultValue={getTime(endDate)}
                    control={control}
                  />
                </Field>
              )}
          </Stack>
        )}

        {showWorkdaysOnly(watchFrequency, watchIntervalFrequency) && (
          <Field>
            <Checkbox
              {...register('schedule.workdaysOnly')}
              label={'Send Monday to Friday only'}
              defaultChecked={watchWorkdaysOnly}
            />
          </Field>
        )}
        <Stack alignItems={'center'}>
          <Icon name={'calendar-alt'} />
          {schedulePreview({ ...defaultSchedule, ...watchSchedule })}
        </Stack>
      </FieldSet>
    </ReportForm>
  );
};

export default connector(Schedule);

const getStyles = (theme: GrafanaTheme2) => {
  return {
    warningText: css`
      color: ${theme.colors.warning.main};
      display: block;
      margin: -${theme.spacing(1)} 0 ${theme.spacing(3)} 0;
    `,
    hidden: css`
      display: none;
    `,
  };
};

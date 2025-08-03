import { css } from '@emotion/css';
import { Controller, useForm } from 'react-hook-form';

import { GrafanaTheme2 } from '@grafana/data';
import { Button, Field, Input, Stack, useStyles2 } from '@grafana/ui';
import { TeamPicker } from 'app/core/components/Select/TeamPicker';
import { Trans } from 'app/core/internationalization';

import { EditableCell } from './EditableCell';
import { validateLBACRule } from './utils';

export interface LBACFormData {
  team: number;
  rule: string;
}

interface Props {
  onSubmit: (data: LBACFormData) => void;
}

export const CreateTeamLBACForm: React.FC<Props> = ({ onSubmit }) => {
  const styles = useStyles2(getStyles);
  const {
    handleSubmit,
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<LBACFormData>({
    mode: 'onChange',
  });

  const team = watch('team');
  const rule = watch('rule');

  const isValid = () => {
    return team > 0 && validateLBACRule(rule);
  };

  return (
    <div className={styles.container}>
      <h5 className={styles.heading}>New LBAC Rule</h5>
      <div className={styles.example}>
        Example: <EditableCell value='{ cluster="us-west-0", namespace=~"dev|prod" }' disabled={true} />
      </div>

      <form id="lbacForm" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Stack gap={2} direction="column">
          <Field label="Team">
            <Controller
              render={({ field: { onChange, ref, ...field } }) => (
                <TeamPicker {...field} onSelected={(t) => onChange(t.value?.id)} className={styles.teamPicker} />
              )}
              control={control}
              name="team"
              rules={{ required: { value: true, message: 'Required' } }}
            />
          </Field>
          <Field label="Rule" invalid={!!errors.rule} error={errors?.rule?.message}>
            <Input
              className={styles.input}
              type="text"
              {...register('rule', {
                required: 'Rule is required',
                validate: (val) => validateLBACRule(val) || 'Invalid LBAC rule syntax',
              })}
              placeholder='{ cluster="us-west-0", namespace=~"dev|prod" }'
              invalid={!!errors.rule}
            />
          </Field>
          <div className={styles.buttonContainer}>
            <Button type="submit" disabled={!isValid()}>
              <Trans i18nKey="access-control.add-permissions.save">Save</Trans>
            </Button>
          </div>
        </Stack>
      </form>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css({
      padding: theme.spacing(2),
    }),
    heading: css({
      color: theme.colors.text.primary,
      margin: `0 0 ${theme.spacing(2)} 0`,
      fontSize: theme.typography.h5.fontSize,
    }),
    example: css({
      marginBottom: theme.spacing(2),
      color: theme.colors.text.secondary,
      fontSize: theme.typography.size.sm,
    }),
    form: css({
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
      width: '100%',
      maxWidth: '500px',
    }),
    input: css({
      width: '100%',
      '& input': {
        fontFamily: theme.typography.fontFamilyMonospace,
        width: '100%',
      },
    }),
    teamPicker: css({
      width: '100%',
    }),
    buttonContainer: css({
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: theme.spacing(2),
    }),
  };
};

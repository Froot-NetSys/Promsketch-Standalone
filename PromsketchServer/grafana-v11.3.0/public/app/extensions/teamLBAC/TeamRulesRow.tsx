import { css } from '@emotion/css';
import { useEffect, useState } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Button, DeleteButton, IconButton, useStyles2 } from '@grafana/ui';
import { Team } from 'app/types';

import { EditableCell } from './EditableCell';
import { TeamLabel } from './TeamLabel';
import { validateLBACRule } from './utils';

interface TeamRulesRowProps {
  teamRules: string[];
  team: Pick<Team, 'name' | 'avatarUrl' | 'id'>;
  disabled?: boolean;
  onChange: (teamRules: string[]) => void;
  warning?: string;
}

export const TeamRulesRow = ({ teamRules, team, disabled, onChange, warning }: TeamRulesRowProps) => {
  const [rulesEditing, setRulesEditing] = useState<Record<number, boolean>>({});
  const [rulesValues, setRulesValues] = useState<Record<number, string | undefined>>({});
  const [rules, setRules] = useState(teamRules);
  const [errors, setErrors] = useState<Record<number, string | undefined>>({});
  const styles = useStyles2(getStyles);

  useEffect(() => {
    setRules(teamRules);
  }, [teamRules]);

  if (!teamRules?.length) {
    return null;
  }

  const onRuleEdit = (idx: number, value: boolean) => {
    setRulesValues({ ...rulesValues, [idx]: !!value ? rules[idx] : undefined });
    setRulesEditing({ ...rulesEditing, [idx]: value });
  };

  const onRuleChange = (idx: number, value: string) => {
    setRulesValues({ ...rulesValues, [idx]: value });
  };

  const onSave = (idx: number) => {
    const newRule = rulesValues[idx];
    if (newRule) {
      if (!validateLBACRule(newRule)) {
        setErrors({ ...errors, [idx]: 'Invalid LBAC rule syntax' });
        return;
      }
      const newRules = rules.map((rule, i) => {
        return i === idx && newRule ? newRule! : rule;
      });
      onChange(newRules);
      setRulesEditing({ ...rulesEditing, [idx]: false });
    }
  };

  const onDelete = (idx: number) => {
    const newRules = rules.slice(0, idx).concat(rules.slice(idx + 1));
    onChange(newRules);
  };

  const onAddRule = () => {
    setRulesEditing({ ...rulesEditing, [rules.length]: true });
    setRules(rules.concat(''));
  };

  const onCancel = (idx: number) => {
    onRuleEdit(idx, false);
    if (idx === rules.length - 1 && !rules[idx]) {
      // Handle cancel when adding new rule
      setRules(rules.slice(0, -1));
    }
  };

  return (
    <>
      <tr key={`${team.id}-${0}`} role="row">
        <td>
          <TeamLabel team={team} warning={warning} />
        </td>
        <td></td>
        <td>
          <EditableCell
            value={rules[0]}
            isEditing={rulesEditing[0]}
            error={errors[0]}
            onChange={(value) => onRuleChange(0, value)}
          />
        </td>
        <td>
          {!disabled ? (
            <div className={styles.buttonsCell}>
              {rules?.length === 1 && !rulesEditing[0] && (
                <div className={styles.buttonRight}>
                  <IconButton
                    name="plus-circle"
                    tooltip="Add new rule"
                    aria-label="add team rule"
                    onClick={() => onAddRule()}
                  />
                </div>
              )}
              {!rulesEditing[0] ? (
                <div className={styles.editButton}>
                  <IconButton name="pen" aria-label="edit team rule" onClick={() => onRuleEdit(0, true)} />
                </div>
              ) : (
                <>
                  <div className={styles.editButton}>
                    <Button size="sm" variant="primary" onClick={() => onSave(0)}>
                      Save
                    </Button>
                  </div>
                  <div className={styles.editButton}>
                    <Button size="sm" variant="secondary" onClick={() => onCancel(0)}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}
              <div className={styles.buttonRight}>
                <DeleteButton aria-label={'Delete rule'} size="sm" onConfirm={() => onDelete(0)} />
              </div>
            </div>
          ) : (
            <div className={styles.buttonsCell}>
              <Button tooltip="Provisioned rule" size="sm" icon="lock" />
            </div>
          )}
        </td>
      </tr>
      {rules.length > 1 &&
        rules.slice(1).map((teamRule, idx) => (
          <tr key={`${team.id}-${idx + 1}`} role="row">
            <td></td>
            <td className={styles.ruleOr}>OR</td>
            <td>
              <EditableCell
                value={teamRule}
                isEditing={rulesEditing[idx + 1]}
                error={errors[idx + 1]}
                onChange={(value) => onRuleChange(idx + 1, value)}
              />
            </td>
            <td>
              {!disabled ? (
                <div className={styles.buttonsCell}>
                  {idx === rules?.length - 2 && !rulesEditing[idx + 1] && (
                    <div className={styles.buttonRight}>
                      <IconButton
                        name="plus-circle"
                        tooltip="Add new rule"
                        aria-label="add team rule"
                        onClick={() => onAddRule()}
                      />
                    </div>
                  )}
                  {!rulesEditing[idx + 1] ? (
                    <div className={styles.editButton}>
                      <IconButton name="pen" aria-label="edit team rule" onClick={() => onRuleEdit(idx + 1, true)} />
                    </div>
                  ) : (
                    <>
                      <div className={styles.editButton}>
                        <Button size="sm" variant="primary" onClick={() => onSave(idx + 1)}>
                          Save
                        </Button>
                      </div>
                      <div className={styles.editButton}>
                        <Button size="sm" variant="secondary" onClick={() => onCancel(idx + 1)}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                  <div className={styles.buttonRight}>
                    <DeleteButton aria-label={'Delete rule'} size="sm" onConfirm={() => onDelete(idx + 1)} />
                  </div>
                </div>
              ) : (
                <div className={styles.buttonsCell}>
                  <Button tooltip="Provisioned rule" size="sm" icon="lock" />
                </div>
              )}
            </td>
          </tr>
        ))}
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    editButton: css({
      display: 'flex',
      alignItems: 'center',
      marginLeft: theme.spacing(2),
    }),
    buttonRight: css({
      display: 'flex',
      alignItems: 'center',
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(0.5),
    }),
    buttonsCell: css({
      display: 'flex',
      justifyContent: 'end',
      alignItems: 'center',
    }),
    ruleOr: css({
      color: theme.colors.text.secondary,
    }),
  };
};

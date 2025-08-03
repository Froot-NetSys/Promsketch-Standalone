import { css, cx } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { Avatar, Box, Icon, Tooltip, useStyles2 } from '@grafana/ui';
import { Team } from 'app/types';

interface Props {
  team?: Partial<Pick<Team, 'name' | 'avatarUrl' | 'id'>>;
  disabled?: boolean;
  warning?: string;
}

export const TeamLabel = ({ team, disabled, warning }: Props) => {
  const styles = useStyles2(getStyles);

  if (!team) {
    return <></>;
  }

  // Show placeholder if team not found
  if (!team.name && !team.avatarUrl) {
    return <span className={styles.notFound}>Team with id {team.id} not found</span>;
  }

  return (
    <div className={styles.wrapper}>
      {team.avatarUrl && <Avatar src={team.avatarUrl} alt="" />}
      <span className={cx(styles.label, { [styles.disabled]: disabled })}>{team.name}</span>
      {warning && (
        <Tooltip content={<Box>{warning}</Box>}>
          <Icon name="exclamation-triangle" className={styles.warning} />
        </Tooltip>
      )}
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    wrapper: css({
      display: 'flex',
      alignItems: 'center',
    }),
    label: css({
      overflow: 'hidden',
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    }),
    avatar: css({
      width: '24px',
      height: '24px',
    }),
    notFound: css({
      color: theme.colors.text.secondary,
    }),
    disabled: css({
      color: theme.colors.text.disabled,
    }),
    warning: css({
      color: theme.colors.warning.main,
    }),
  };
};

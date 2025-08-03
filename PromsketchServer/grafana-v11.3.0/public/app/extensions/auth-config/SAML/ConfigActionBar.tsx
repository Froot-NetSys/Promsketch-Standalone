import { css } from '@emotion/css';
import { useState } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, Badge, Button, BadgeProps, Tooltip, Menu, Dropdown, ConfirmModal, IconButton } from '@grafana/ui';

interface Props {
  enabled: boolean;
  isNewConfig: boolean;
  onSave: () => void;
  onSaveAndEnable: () => void;
  onEnable: () => void;
  onDisable: () => void;
  onRemove: () => void;
}

export const ConfigActionBar = ({
  enabled,
  isNewConfig,
  onSave,
  onSaveAndEnable,
  onDisable,
  onRemove,
}: Props): JSX.Element => {
  const styles = useStyles2(getStyles);

  let badgeProps: BadgeProps = { text: 'Not enabled', color: 'blue' };
  if (enabled) {
    badgeProps = { text: 'Enabled', color: 'green', icon: 'check' };
  } else if (!isNewConfig) {
    badgeProps = { text: 'Not enabled', color: 'blue' };
  }

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDiscard = () => {
    onRemove();
    setShowConfirmModal(false);
    window.location.href = '/admin/authentication';
  };

  const additionalActionsMenu = (
    <Menu>
      <Menu.Item
        label="Delete"
        icon="trash-alt"
        onClick={() => {
          setShowConfirmModal(true);
        }}
      />
    </Menu>
  );

  return (
    <>
      <div className={styles.actionBarContainer}>
        <div className={styles.protocolContainer}>
          <span className={styles.protocolLabel}>Protocol</span>
          <span>SAML 2.0</span>
        </div>
        {!isNewConfig && (
          <div className={styles.statusContainer}>
            <span className={styles.statusLabel}>Status</span>
            <Badge {...badgeProps} className={styles.statusBadge} />
          </div>
        )}

        {!enabled && (
          <>
            <Button variant="secondary" onClick={onSave}>
              Save
            </Button>
            <Button variant="primary" onClick={onSaveAndEnable}>
              Save and enable
            </Button>
          </>
        )}
        {enabled && (
          <>
            <Button variant="primary" onClick={onSave}>
              Save and apply
            </Button>
            <Tooltip content="Disable will disable Grafana to not use SAML auth." placement="top">
              <Button variant="secondary" fill="outline" onClick={onDisable}>
                Disable
              </Button>
            </Tooltip>
          </>
        )}
        {!isNewConfig && (
          <Dropdown overlay={additionalActionsMenu} placement="bottom-start">
            <IconButton tooltip="More actions" tooltipPlacement="top" variant="secondary" name="ellipsis-v" />
          </Dropdown>
        )}
      </div>
      <ConfirmModal
        title="Delete SAML configuration"
        body="Are you sure you want to permanently delete this SAML configuration? All changes made in the UI will be removed."
        confirmText="Delete configuration"
        confirmationText={enabled ? 'delete' : ''}
        dismissText="Back to editing"
        isOpen={showConfirmModal}
        onDismiss={() => setShowConfirmModal(false)}
        onConfirm={handleDiscard}
      />
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    actionBarContainer: css`
      display: flex;
      flexdirection: row;
      gap: ${theme.spacing(1)};
      align-items: center;
      justify-content: flex-end;
    `,
    iniFileLabel: css`
      display: flex;
      color: ${theme.colors.text.primary};
      justify-content: flex-end;
    `,
    tooltipContainer: css`
      padding: ${theme.spacing(0, 1)};
    `,
    statusContainer: css`
      display: flex;
      flex-direction: column;
      font-size: ${theme.typography.bodySmall.fontSize};
      border-left: 1px solid ${theme.colors.border.medium};
      padding: ${theme.spacing(0, 2)};
    `,
    statusBadge: css`
      span {
        font-size: ${theme.typography.size.xs};
      }
    `,
    statusLabel: css`
      color: ${theme.colors.text.secondary};
    `,
    protocolContainer: css`
      display: flex;
      flex-direction: column;
      font-size: ${theme.typography.bodySmall.fontSize};
      padding-right: ${theme.spacing(1)};
    `,
    protocolLabel: css`
      color: ${theme.colors.text.secondary};
    `,
  };
};

import { css } from '@emotion/css';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';

import { DataSourceJsonData, DataSourceSettings, GrafanaTheme2 } from '@grafana/data';
import { ConfigSection } from '@grafana/experimental';
import { getBackendSrv } from '@grafana/runtime';
import { Alert, Box, Collapse, Icon, LinkButton, Stack, Text, Tooltip, useStyles2 } from '@grafana/ui';
import { ResourcePermission } from 'app/core/components/AccessControl/types';
import { contextSrv } from 'app/core/core';
import { DataSourceReadOnlyMessage } from 'app/features/datasources/components/DataSourceReadOnlyMessage';
import { Team } from 'app/types';

import { AccessControlAction as EnterpriseActions, EnterpriseStoreState, TeamRule } from '../types';

import { CreateTeamLBACForm, LBACFormData } from './AddTeamLBACForm';
import { TeamRulesRow } from './TeamRulesRow';
import { getTeamLBAC, updateTeamLBACRules } from './state/actions';
import { formatLBACRule } from './utils';



export interface OwnProps {
  dataSourceConfig: DataSourceSettings<DataSourceJsonData, {}>;
  readOnly?: boolean;
  onTeamLBACUpdate: () => Promise<DataSourceSettings> | void;
  getWarnings?: (items: TeamRule[]) => TeamRule[];
  items?: ResourcePermission[];
}

function mapStateToProps(state: EnterpriseStoreState) {
  return {
    teamLBACConfig: state.teamLBAC?.teamLBACConfig,
  };
}

const mapDispatchToProps = {
  getTeamLBAC,
  updateTeamLBACRules,
};

export const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

export const TeamLBACEditorUnconnected = ({
  teamLBACConfig,
  dataSourceConfig,
  readOnly,
  onTeamLBACUpdate,
  getTeamLBAC,
  updateTeamLBACRules,
  items,
}: Props) => {
  const [teams, setTeams] = useState<Array<Pick<Team, 'name' | 'avatarUrl' | 'id'>>>([]);
  const [showLBACForm, setShowLBACForm] = useState(false);
  const [rolesWithoutLBAC, setRolesWithoutLBAC] = useState<Set<string>>(new Set<string>());
  const [serviceAccountsWithoutLBAC, setServiceAccountsWithoutLBAC] = useState<Set<number>>(new Set<number>());
  const [teamsWithoutLBAC, setTeamsWithoutLBAC] = useState<Set<string>>(new Set<string>());
  const [lbacTeamsWithoutTeamPermissions, setLBACTeamsWithoutTeamPermission] = useState<Set<string>>(new Set<string>());
  const teamLBACRules = useMemo(() => teamLBACConfig?.rules || [], [teamLBACConfig?.rules]);
  const styles = useStyles2(getStyles);
  const [recommendationIsOpen, setRecommendationIsOpen] = useState(false);

  useEffect(() => {
    getTeamLBAC(dataSourceConfig.uid);
  }, [dataSourceConfig.uid, getTeamLBAC]);

  useEffect(() => {
    const fetchTeams = async () => {
      const teamIds = teamLBACRules.map((r) => r.teamId);
      if (!teamIds?.length) {
        return;
      }

      // TODO: to only get the teams which have query permissions to the datasource
      const result = await getBackendSrv().get('/api/teams/search', { teamId: teamIds });
      const teamsArray: Team[] = result?.teams;
      const teams = teamsArray.map((team) => ({
        id: team.id,
        value: team.id,
        teamId: team.id,
        name: team.name,
        avatarUrl: team.avatarUrl,
      }));
      setTeams(teams);
    };
    fetchTeams();
  }, [teamLBACRules]);

  useEffect(() => {
    if (!items?.length) {
      return;
    }
    const lbacTeams = new Set(teamLBACRules.map((r) => r.teamId));
    const resourceTeams = new Set(items.map((r) => r.teamId));
    const resourceServiceAccounts: Set<number> = new Set(items.filter((r) => r.isServiceAccount).map((r) => r.id));
    const resourceRoles: Set<string> = new Set(
      items
        .filter((r) => typeof r.builtInRole === 'string' && r.builtInRole.trim() !== '' && r.permission !== 'Admin')
        .map((r) => r.builtInRole as string) // Assert that r.builtInRole is a string
    );

    const teamsWithoutLbac: Set<string> = new Set(
      Array.from(resourceTeams)
        .filter((x) => x !== undefined && !lbacTeams.has(x.toString()))
        .map((x) => x?.toString() || '')
    );
    const lbacTeamsWithoutTeamPermissions = new Set(
      Array.from(lbacTeams).filter((x) => x && !resourceTeams.has(Number(x)))
    );

    if (lbacTeamsWithoutTeamPermissions) {
      setLBACTeamsWithoutTeamPermission(lbacTeamsWithoutTeamPermissions);
    }
    if (teamsWithoutLbac) {
      setTeamsWithoutLBAC(teamsWithoutLbac);
    }
    if (resourceServiceAccounts) {
      setServiceAccountsWithoutLBAC(resourceServiceAccounts);
    }
    if (resourceRoles) {
      setRolesWithoutLBAC(resourceRoles);
    }
  }, [items, teamLBACRules]);

  const onTeamLBACUpdateInternal = useCallback(
    async (rules: TeamRule[]) => {
      await updateTeamLBACRules(dataSourceConfig.uid, { rules });
      await onTeamLBACUpdate();
    },
    [dataSourceConfig.uid, onTeamLBACUpdate, updateTeamLBACRules]
  );

  const onSubmitLBAC = async ({ team, rule }: LBACFormData) => {
    let updatedRules: TeamRule[] = [];
    const existingTeamRules = teamLBACRules.find((teamRules) => teamRules.teamId === team.toString());
    if (existingTeamRules) {
      updatedRules = teamLBACRules.map((teamRules) => {
        if (teamRules.teamId === team.toString()) {
          return { ...teamRules, rules: [...teamRules.rules, formatLBACRule(rule)] };
        }
        return { ...teamRules };
      });
    } else {
      updatedRules = teamLBACRules.concat({ teamId: team.toString(), rules: [formatLBACRule(rule)] });
    }
    await onTeamLBACUpdateInternal(updatedRules);
    setShowLBACForm(false);
  };

  const onRulesUpdate = async (teamId: string, updatedRules: string[]) => {
    const updatedTeamRules = teamLBACRules.map((r) => {
      if (r.teamId === teamId) {
        return { ...r, rules: updatedRules };
      }
      return r;
    });
    await onTeamLBACUpdateInternal(updatedTeamRules);
  };

  const canEdit = contextSrv.hasPermission(EnterpriseActions.DataSourcesPermissionsWrite) && !readOnly;
  const getDescription = (item: ResourcePermission) => {
    if (item.userId) {
      return item.userLogin;
    } else if (item.teamId) {
      return item.team;
    } else if (item.builtInRole) {
      return item.builtInRole;
    }
    return;
  };
  return (
    <Box paddingBottom={2}>
      {readOnly && <DataSourceReadOnlyMessage />}
      <Stack direction="column" gap={3}>
        <ConfigSection
          title="Data access"
          description="Here you can configure access to specific data within the datasource using LogQL label selectors."
        >
          {(lbacTeamsWithoutTeamPermissions.size > 0 ||
            teamsWithoutLBAC.size > 0 ||
            serviceAccountsWithoutLBAC.size > 0 ||
            rolesWithoutLBAC.size > 0 &&
            teamLBACRules.length > 0) && (
              <Box marginBottom={3}>
                <Collapse
                  label={
                    recommendationIsOpen ? (
                      'Hide Access Control Recommendations'
                    ) : (
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Tooltip content="Found recommendations">
                          <Icon name="exclamation-triangle" className={styles.warning} />
                        </Tooltip>
                        <span>Show Access Control Recommendations</span>
                      </Stack>
                    )
                  }
                  isOpen={recommendationIsOpen}
                  onToggle={() => setRecommendationIsOpen(!recommendationIsOpen)}
                />
                {recommendationIsOpen && (
                  <Alert title="Access Control Recommendations" severity="warning">
                    <p>To ensure proper access control, please follow these recommendations:</p>
                    <ul className={styles.warningList}>
                      {lbacTeamsWithoutTeamPermissions.size > 0 && (
                        <li>
                          <strong>Add Query Permissions:</strong> The following teams do not have query permissions for
                          the data source, and are therefore not able to query logs with the configured LBAC rules.
                          <ul>
                            {Array.from(lbacTeamsWithoutTeamPermissions).map((team) => {
                              const teamName = teams?.find((t) => t.id?.toString() === team)?.name;
                              return (
                                <li className={styles.warningList} key={team}>
                                  {teamName}
                                </li>
                              );
                            })}
                          </ul>
                        </li>
                      )}
                      {teamsWithoutLBAC.size > 0 && (
                        <li>
                          <strong>Add Team LBAC Rules:</strong> The following teams can query all logs. Please add Team
                          LBAC rules for them:
                          <ul>
                            {Array.from(teamsWithoutLBAC).map((team) => {
                              const i = items?.find((t) => t.teamId?.toString() === team);
                              if (!i) {
                                return null;
                              }
                              return (
                                <li className={styles.warningList} key={team}>
                                  {getDescription(i)}
                                </li>
                              );
                            })}
                          </ul>
                        </li>
                      )}
                      {serviceAccountsWithoutLBAC.size > 0 && (
                        <li>
                          <strong>Note:</strong> LBAC rules cannot be applied to service accounts. Consider reviewing their access if necessary.
                          <ul>
                            {Array.from(serviceAccountsWithoutLBAC).map((serviceaccount) => {
                              const sAID = items?.find((t) => t.id === serviceaccount);
                              if (!sAID) {
                                return null;
                              }
                              return (
                                <li
                                  className={styles.warningList}
                                  key={serviceaccount}
                                >{`Service Account: ${getDescription(sAID)}`}</li>
                              );
                            })}
                          </ul>
                        </li>
                      )}
                      {rolesWithoutLBAC.size > 0 && (
                        <li>
                          <strong>Remove Unrestricted Access:</strong> The following roles currently have unrestricted
                          access to logs.
                          <ul>
                            {Array.from(rolesWithoutLBAC).map((role) => {
                              return <li className={styles.warningList} key={role}>{`Role: ${role}`}</li>;
                            })}
                          </ul>
                        </li>
                      )}
                    </ul>
                  </Alert>
                )}
              </Box>
            )}
          <Stack direction="column" gap={2}>
            <Box>
              <h4>LBAC (Label-based access control)</h4>
              <p>
                Configure LBAC rules to restrict team log queries based on LogQL.
                <LinkButton
                  fill="text"
                  icon="external-link-alt"
                  variant="secondary"
                  size="sm"
                  href="https://grafana.com/docs/grafana/latest/administration/data-source-management/teamlbac/create-teamlbac-rules/#lbac-rule"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about LBAC rules
                </LinkButton>
              </p>
            </Box>
            {canEdit && (
              <Box>
                <LinkButton
                  onClick={() => setShowLBACForm(!showLBACForm)}
                  icon={showLBACForm ? 'angle-down' : 'plus'}
                >
                  {showLBACForm ? 'Hide LBAC rule' : 'Add a LBAC rule'}
                </LinkButton>
                {showLBACForm && (
                  <Box marginTop={2}>
                    <CreateTeamLBACForm onSubmit={onSubmitLBAC} />
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        </ConfigSection>

        {!isEmpty(teamLBACRules) && (
          <Box>
            <table className={styles.table} role="grid" aria-labelledby="team_lbac_rules">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Team</th>
                  <th style={{ width: '1%' }} />
                  <th>Label selector</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>
                {teamLBACRules.map((teamRules, idx) => {
                  const rules = teamRules.rules;
                  const teamId = teamRules.teamId;
                  let warning = '';
                  if (lbacTeamsWithoutTeamPermissions.has(teamRules.teamId)) {
                    warning = 'Warning: This team may not have permission to query the datasource.';
                  }
                  return (
                    <TeamRulesRow
                      key={idx}
                      teamRules={rules}
                      disabled={!canEdit}
                      team={
                        teams.find((t) => t.id?.toString() === teamId) || {
                          id: Number(teamId),
                          name: '',
                          avatarUrl: '',
                        }
                      }
                      onChange={(updatedRules) => onRulesUpdate(teamId, updatedRules)}
                      warning={warning}
                    />
                  );
                })}
              </tbody>
            </table>
            <Box marginTop={2}>
              <Text variant="bodySmall" color="secondary">
                Note: LBAC rules will NOT apply to the query if the authenticated Cloud Access Policy token has any label
                selectors configured in Grafana Cloud.
              </Text>
            </Box>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    warning: css({
      ...theme.typography.bodySmall,
      color: theme.colors.warning.text,
    }),
    warningList: css({
      ...theme.typography.bodySmall,
      listStylePosition: 'inside',
      marginLeft: theme.spacing(2),
    }),
    table: css({
      ...theme.typography.bodySmall,
      width: '100%',
      borderCollapse: 'collapse',
      '& th, & td': {
        padding: theme.spacing(2),
        borderBottom: `1px solid ${theme.colors.border.weak}`,
      },
      '& th': {
        textAlign: 'left',
        fontWeight: theme.typography.fontWeightMedium,
      },
    }),
  };
};

export const TeamLBACEditor = connector(TeamLBACEditorUnconnected);

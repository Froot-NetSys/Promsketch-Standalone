import { css } from '@emotion/css';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2, SelectableValue } from '@grafana/data';
import { Field, Input, Select, Switch, useStyles2, Tooltip, Icon, TextLink } from '@grafana/ui';
import { contextSrv } from 'app/core/core';

import { EnterpriseStoreState, SAMLFormData, SAMLStepKey } from '../../../types';
import { AssertionEditorRow } from '../../components/AssertionEditorRow';
import { InputWithReset } from '../../components/InputWithReset';
import SAMLForm from '../SAMLForm';
import { settingsUpdated } from '../state/reducers';

const nameIdFormatOptions: Array<SelectableValue<string>> = [
  { label: 'Default', value: '' },
  { label: 'Unspecified', value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified' },
  { label: 'Email address', value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress' },
  { label: 'Persistent', value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent' },
  { label: 'Transient', value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient' },
];

type AssertionMappingData = Pick<
  SAMLFormData,
  | 'assertionAttributeName'
  | 'assertionAttributeLogin'
  | 'assertionAttributeEmail'
  | 'assertionAttributeRole'
  | 'assertionAttributeGroups'
  | 'assertionAttributeOrg'
  | 'clientId'
  | 'clientSecret'
  | 'tokenUrl'
  | 'forceUseGraphApi'
  | 'roleValuesNone'
  | 'roleValuesViewer'
  | 'roleValuesEditor'
  | 'roleValuesAdmin'
  | 'roleValuesGrafanaAdmin'
  | 'orgMapping'
  | 'allowedOrganizations'
  | 'nameIdFormat'
  | 'skipOrgRoleSync'
>;

function mapStateToProps(state: EnterpriseStoreState) {
  return {
    samlSettings: state.samlConfig.samlSettings,
    clientSecretConfigured: true,
  };
}

const mapDispatchToProps = {
  settingsUpdated,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector>;

export const AssertionMappingUnconnected = ({ clientSecretConfigured, samlSettings, settingsUpdated }: Props): JSX.Element => {
  const styles = useStyles2(getStyles);

  const {
    assertionAttributeName,
    assertionAttributeLogin,
    assertionAttributeEmail,
    assertionAttributeRole,
    assertionAttributeGroups,
    assertionAttributeOrg,
    clientId,
    clientSecret,
    tokenUrl,
    forceUseGraphApi,
    roleValuesNone,
    roleValuesViewer,
    roleValuesEditor,
    roleValuesAdmin,
    roleValuesGrafanaAdmin,
    orgMapping,
    allowedOrganizations,
    nameIdFormat,
    skipOrgRoleSync,
  } = samlSettings;
  const {
    handleSubmit,
    control,
    register,
    getValues,
    setValue,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      assertionAttributeName,
      assertionAttributeLogin,
      assertionAttributeEmail,
      assertionAttributeRole,
      assertionAttributeGroups,
      assertionAttributeOrg,
      clientId,
      clientSecret,
      tokenUrl,
      forceUseGraphApi,
      roleValuesNone,
      roleValuesViewer,
      roleValuesEditor,
      roleValuesAdmin,
      roleValuesGrafanaAdmin,
      orgMapping,
      allowedOrganizations,
      nameIdFormat: nameIdFormat || '',
      skipOrgRoleSync,
    },
  });

  const onSubmit = ({ ...settings }: AssertionMappingData) => {
    if (isDirty) {
      settingsUpdated({
        ...samlSettings,
        ...settings,
      });
    }
  };

  const isClientSecretConfigured = (prop: 'clientSecret'): boolean => {
    return getValues(prop) !== '';
  };
  const onResetClientSecret = (prop: 'clientSecret') => {
    setValue(prop, '', { shouldDirty: true });
    setCsConfigured(false);
  };

  const [csConfigured, setCsConfigured] = useState(clientSecretConfigured && isClientSecretConfigured('clientSecret'));
  const checkIfConfigured = () => {
    setCsConfigured(clientSecretConfigured && isClientSecretConfigured('clientSecret'));
  };

  const { orgRole, isGrafanaAdmin } = contextSrv.user;
  const ableToEditGrafanaAdminFields = isGrafanaAdmin;
  const ableToEditAdminFields = orgRole === 'Admin' || ableToEditGrafanaAdminFields;
  const ableToEditEditorFields = orgRole === 'Editor' || ableToEditAdminFields;

  return (
    <SAMLForm
      activeStep={SAMLStepKey.AssertionMapping}
      onSubmit={handleSubmit(onSubmit)}
      confirmRedirect={isDirty}
      getFormData={getValues}
      className={styles.wrapper}
      label="User mapping"
    >
      <div className={styles.description}>
        Map SAML assertion attributes to the Grafana user attributes. Assertion attributes support template mappings.
        Team sync is available if groups attribute is configured.
      </div>
      <div className={styles.mappingContainer}>
        <div className={styles.mappingSection}>
          <div className={styles.mappingHeader}>
            Assertion attributes mappings
            <Tooltip
              content="Assertion attributes mapping in Grafana takes user information from a SAML response and uses it to create or update a user in its database. It reads attributes—key/value pairs—within the assertion, such as Name, Login handle, and email. Configurations allow for key selection modification."
              placement="top"
            >
              <Icon name="info-circle" className={styles.icon} />
            </Tooltip>
          </div>
          <Controller
            name={'assertionAttributeName'}
            control={control}
            render={({ field: { ref, ...field } }) => {
              return (
                <AssertionEditorRow
                  {...field}
                  label="Name attribute"
                  id="assertionAttributeName"
                  placeholder={'displayName'}
                />
              );
            }}
          />
          <Controller
            name={'assertionAttributeLogin'}
            control={control}
            render={({ field: { ref, ...field } }) => {
              return (
                <AssertionEditorRow
                  {...field}
                  label="Login attribute"
                  placeholder="mail"
                  id="assertionAttributeLogin"
                />
              );
            }}
          />
          <Controller
            name={'assertionAttributeEmail'}
            control={control}
            render={({ field: { ref, ...field } }) => {
              return (
                <AssertionEditorRow
                  {...field}
                  label="Email attribute"
                  placeholder="mail"
                  id="assertionAttributeEmail"
                />
              );
            }}
          />
          <Controller
            name={'assertionAttributeGroups'}
            control={control}
            render={({ field: { ref, ...field } }) => {
              return <AssertionEditorRow {...field} label="Groups attribute" id="assertionAttributeGroups" />;
            }}
          />
          <Controller
            name={'assertionAttributeRole'}
            control={control}
            render={({ field: { ref, ...field } }) => {
              return <AssertionEditorRow {...field} label="Role attribute" id="assertionAttributeRole" />;
            }}
          />
          {ableToEditAdminFields && (
            <Controller
              name={'assertionAttributeOrg'}
              control={control}
              render={({ field: { ref, ...field } }) => {
                return <AssertionEditorRow {...field} label="Org attribute" id="assertionAttributeOrg" />;
              }}
            />
          )}
        </div>
        <div className={styles.mappingSection}>
          {ableToEditEditorFields && (
            <>
              <div className={styles.mappingHeader}>
                Role mapping
                <Tooltip
                  content="Role mapping syncs user roles from your identity provider to Grafana by configuring role attributes for None, Viewer, Editor, Admin, and Grafana Admin roles. In case there is no match, the default role in Grafana is Viewer."
                  placement="top"
                >
                  <Icon name="info-circle" className={styles.icon} />
                </Tooltip>
              </div>
              <Controller
                name={'roleValuesNone'}
                control={control}
                render={({ field: { ref, ...field } }) => {
                  return <AssertionEditorRow {...field} label="None" width={60} id="roleValuesNone" />;
                }}
              />
              <Controller
                name={'roleValuesViewer'}
                control={control}
                render={({ field: { ref, ...field } }) => {
                  return <AssertionEditorRow {...field} label="Viewer" width={60} id="roleValuesViewer" />;
                }}
              />
              <Controller
                name={'roleValuesEditor'}
                control={control}
                render={({ field: { ref, ...field } }) => {
                  return <AssertionEditorRow {...field} label="Editor" width={60} id="roleValuesEditor" />;
                }}
              />
            </>
          )}
          {ableToEditAdminFields && (
            <Controller
              name={'roleValuesAdmin'}
              control={control}
              render={({ field: { ref, ...field } }) => {
                return <AssertionEditorRow {...field} label="Admin" width={60} id="roleValuesAdmin" />;
              }}
            />
          )}
          {ableToEditGrafanaAdminFields && (
            <Controller
              name={'roleValuesGrafanaAdmin'}
              control={control}
              render={({ field: { ref, ...field } }) => {
                return <AssertionEditorRow {...field} label="Grafana Admin" width={60} id="roleValuesGrafanaAdmin" />;
              }}
            />
          )}
          <Field
            label="Skip organization role sync"
            description="Prevent synchronizing for SAML users organization roles from your IdP."
          >
            <Switch {...register('skipOrgRoleSync')} defaultChecked={skipOrgRoleSync} id="skipOrgRoleSync" />
          </Field>
        </div>
        {ableToEditGrafanaAdminFields && (
          <div className={styles.mappingSection}>
            <div className={styles.mappingHeader}>
              Org mapping
              <Tooltip
                content="Organization mapping allows you to assign users to particular organization in Grafana depending on attribute value obtained from identity provider. Use the configuration to assign users from your organization to the Grafana organization."
                placement="top"
              >
                <Icon name="info-circle" className={styles.icon} />
              </Tooltip>
            </div>

            <Controller
              name={'orgMapping'}
              control={control}
              render={({ field: { ref, ...field } }) => {
                return <AssertionEditorRow {...field} label="Org mapping" width={60} id="orgMapping" />;
              }}
            />
          </div>
        )}
      </div>
      <div className={styles.mappingContainer}>
        <div className={styles.mappingSection}>
          <div className={styles.mappingHeader}>
            Azure AD Service Account Configuration
          </div>
          <div className={styles.description}>
            If you have users that belong to more than 150 groups in your Azure AD organization, you need to setup a service account in Azure AD to get all the groups via Graph API. This service account will be used to get all the groups for the user. Read more about Azure AD service account configuration in the&nbsp;
            <TextLink
              style={{ fontSize: 'inherit' }}
              external={true}
              href="https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/saml/#configure-a-graph-api-application-in-azure-ad"
            >
              documentation
            </TextLink>.
          </div>
          <Controller
            name={'clientId'}
            control={control}
            render={({ field: { ref, ...field } }) => {
              return <AssertionEditorRow {...field} label="Client ID" width={60} id="clientId" />;
            }}
          />
          <Controller
            name={'clientSecret'}
            control={control}
            render={({ field: { ref, ...field } }) => {
              return (
                <InputWithReset
                  {...field}
                  className={styles.clientSecretInput}
                  width={60}
                  id="clientSecret"
                  isConfigured={csConfigured}
                  onReset={() => onResetClientSecret('clientSecret')}
                  onBlur={checkIfConfigured}
                  label="Client Secret"
                />
              );
            }}
          />
          <Controller
            name={'tokenUrl'}
            control={control}
            render={({ field: { ref, ...field } }) => {
              return <AssertionEditorRow {...field} label="Access Token URL" width={60} id="tokenUrl" />;
            }}
          />
          <Field
            label="Force use Graph API"
            description="Force the use of Graph API to get all the groups for the user."
          >
            <Switch {...register('forceUseGraphApi')} defaultChecked={forceUseGraphApi} id="forceUseGraphApi" />
          </Field>
        </div>
      </div>
      <Field
        label="Allowed organizations"
        description="List of comma- or space-separated SAML organization names. User should be a member of at least one organization to log in."
      >
        <Input {...register('allowedOrganizations')} id="allowedOrganizations" width={60} />
      </Field>
      <Field
        label="Name identifier format"
        description="Name identifier formats control how the users at identity provider are mapped to users in Grafana"
      >
        <Controller
          name={'nameIdFormat'}
          control={control}
          render={({ field: { ref, onChange, ...field } }) => {
            return (
              <Select
                {...field}
                onChange={(option: SelectableValue<string>) => {
                  onChange(option.value);
                }}
                width={30}
                options={nameIdFormatOptions}
                aria-label="nameIdFormat"
              />
            );
          }}
        />
      </Field>
    </SAMLForm>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    wrapper: css`
      width: 100%;
    `,
    description: css`
      color: ${theme.colors.text.secondary};
      font-size: ${theme.typography.bodySmall.fontSize};
      margin-bottom: ${theme.spacing(2)};
      text-align: justify;
      width: ${theme.spacing(76.5)};
    `,
    mappingContainer: css`
      background: ${theme.colors.background.secondary};
      padding: ${theme.spacing(2)};
      margin-bottom: ${theme.spacing(4)};
    `,
    mappingSection: css`
      margin-bottom: ${theme.spacing(2)};
    `,
    mappingHeader: css`
      display: flex;
      margin-bottom: ${theme.spacing(2)};
    `,
    assertionEditorRow: css`
      display: flex;
      margin-bottom: ${theme.spacing(1)};
    `,
    icon: css`
      fill: ${theme.colors.secondary.text};
      margin-top: ${theme.spacing(0.5)};
      margin-left: ${theme.spacing(0.5)};
    `,
    clientSecretInput: css`
      background: ${theme.components.input.background};
      color: ${theme.components.input.text};
      margin-bottom: ${theme.spacing(1)};
      width: 480px;
    `,
  };
};

export default connector(AssertionMappingUnconnected);

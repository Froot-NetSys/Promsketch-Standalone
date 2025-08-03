import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProvider } from 'test/helpers/TestProvider';

import { getRouteComponentProps } from 'app/core/navigation/__mocks__/routeProps';
import { addRootReducer } from 'app/store/configureStore';

import { mockToolkitActionCreator } from '../../../../../test/core/redux/mocks';
import { authConfigSAMLReducer, settingsUpdated } from '../state/reducers';

import { AssertionMappingUnconnected, Props } from './AssertionMapping';

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('app/core/core', () => {
  return {
    contextSrv: {
      hasPermission: () => true,
      user: {
        orgRole: 'Admin',
        isGrafanaAdmin: true,
      },
    },
  };
});

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  config: {
    ...jest.requireActual('@grafana/runtime').config,
    buildInfo: {
      edition: 'Enterprise',
      version: '10.0.0',
      commit: 'abcdefa',
      env: 'dev',
      latestVersion: '',
      hasUpdate: false,
      hideVersion: false,
    },
    licenseInfo: {
      enabledFeatures: { saml: true },
    },
    featureToggles: {
      accesscontrol: true,
    },
    bootData: { navTree: [], user: {} },
  },
}));

const defaultSettings = {
  assertionAttributeName: '',
  assertionAttributeLogin: '',
  assertionAttributeEmail: '',
  assertionAttributeRole: '',
  assertionAttributeGroups: '',
  assertionAttributeOrg: '',
  roleValuesNone: '',
  roleValuesViewer: '',
  roleValuesEditor: '',
  roleValuesAdmin: '',
  roleValuesGrafanaAdmin: '',
  orgMapping: '',
  allowedOrganizations: '',
  nameIdFormat: '',
  skipOrgRoleSync: false,
};

const mockUpdate = mockToolkitActionCreator(settingsUpdated);

const setup = (propOverrides?: Partial<Props>) => {
  addRootReducer(authConfigSAMLReducer);
  const props: Props = {
    ...getRouteComponentProps(),
    samlSettings: defaultSettings,
    settingsUpdated: mockUpdate,
    ...propOverrides,
    clientSecretConfigured: true,
  };

  render(
    <TestProvider>
      <AssertionMappingUnconnected {...props} />
    </TestProvider>
  );

  return {
    user: userEvent.setup(),
  };
};

describe('StepAssertionMapping', () => {
  it('should render with default values', () => {
    setup();

    expect(screen.getByRole('textbox', { name: /Name attribute/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Login attribute/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Email attribute/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Groups attribute/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Role attribute/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Org attribute/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'None' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Viewer' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Editor' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Grafana Admin' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Org mapping/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Client ID/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Access Token Url/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Force use Graph API/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Skip organization role sync/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /nameIdFormat/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  it('should submit correct form data', async () => {
    const { user } = setup({ settingsUpdated: mockUpdate });

    await user.type(screen.getByRole('textbox', { name: /Name attribute/i }), 'name');
    await user.type(screen.getByRole('textbox', { name: /Login attribute/i }), 'login');
    await user.type(screen.getByRole('textbox', { name: 'None' }), 'none');
    await user.type(screen.getByRole('textbox', { name: 'Viewer' }), 'viewer');
    await user.type(screen.getByRole('textbox', { name: 'Editor' }), 'editor');
    await user.type(screen.getByRole('textbox', { name: 'Admin' }), 'admin');
    await user.type(screen.getByRole('textbox', { name: 'Grafana Admin' }), 'g_admin');
    await user.type(screen.getByRole('textbox', { name: /Org mapping/i }), 'Engineering:2:Editor, Sales:3:Admin');

    await user.type(screen.getByRole('textbox', { name: /Client ID/i }), '12345');
    await user.click(screen.getByRole('button', { name: /Reset/i }));
    await user.type(screen.getByLabelText(/Client Secret/i), 'secret_client_password');
    await user.type(screen.getByRole('textbox', { name: /Access Token URL/i }), 'https://token.url');
    await user.click(screen.getByRole('checkbox', { name: /Force use Graph API/i }));

    await user.click(screen.getByRole('checkbox', { name: /Skip organization role sync/i }));

    await user.click(screen.getByRole('button', { name: /^Next/i }));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({
        ...defaultSettings,
        assertionAttributeName: 'name',
        assertionAttributeLogin: 'login',
        roleValuesNone: 'none',
        roleValuesViewer: 'viewer',
        roleValuesEditor: 'editor',
        roleValuesAdmin: 'admin',
        roleValuesGrafanaAdmin: 'g_admin',
        orgMapping: 'Engineering:2:Editor, Sales:3:Admin',
        clientId: '12345',
        clientSecret: 'secret_client_password',
        forceUseGraphApi: true,
        tokenUrl: 'https://token.url',
        skipOrgRoleSync: true,
      })
    );
  });
});

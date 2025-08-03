import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProvider } from 'test/helpers/TestProvider';

import { getRouteComponentProps } from 'app/core/navigation/__mocks__/routeProps';
import { addRootReducer } from 'app/store/configureStore';

import { mockToolkitActionCreator } from '../../../../../test/core/redux/mocks';
import { authConfigSAMLReducer, settingsUpdated } from '../state/reducers';

import { GeneralUnconnected, Props } from './General';

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('app/core/core', () => {
  return {
    contextSrv: {
      hasPermission: () => true,
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
  allowSignUp: false,
  name: '',
  autoLogin: false,
  singleLogout: false,
  allowIdpInitiated: false,
  relayState: '',
  maxIssueDelay: '',
  metadataValidDuration: '',
};

const mockUpdate = mockToolkitActionCreator(settingsUpdated);

const setup = (propOverrides?: Partial<Props>) => {
  addRootReducer(authConfigSAMLReducer);
  const props: Props = {
    ...getRouteComponentProps(),
    samlSettings: defaultSettings,
    settingsUpdated: mockUpdate,
    ...propOverrides,
  };

  render(
    <TestProvider>
      <GeneralUnconnected {...props} />
    </TestProvider>
  );

  return {
    user: userEvent.setup(),
  };
};

describe('StepGeneral', () => {
  it('should render with default values', () => {
    setup();

    expect(screen.getByRole('checkbox', { name: /Allow signup/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Auto login/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Single logout/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Identity provider initiated login/i })).not.toBeChecked();
    expect(screen.queryByText(/^Relay state/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  it('should show relay state input only if IdP initiated login enabled', async () => {
    const { user } = setup({ settingsUpdated: mockUpdate });
    await user.click(screen.getByRole('checkbox', { name: /Identity provider initiated login/i }));
    expect(screen.queryByText(/^Relay state/i)).toBeInTheDocument();
  });

  it('should submit correct form data', async () => {
    const { user } = setup({ settingsUpdated: mockUpdate });

    await user.click(screen.getByRole('checkbox', { name: /Allow signup/i }));
    await user.click(screen.getByRole('checkbox', { name: /Identity provider initiated login/i }));
    await user.type(screen.getByRole('textbox', { name: /^Relay state/i }), 'mysecretrelaystate');
    await user.type(screen.getByRole('textbox', { name: /^Max issue delay/i }), '60s');
    await user.type(screen.getByRole('textbox', { name: /^Metadata valid duration/i }), '120s');

    await user.click(screen.getByRole('button', { name: /^Next/i }));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({
        ...defaultSettings,
        allowSignUp: true,
        allowIdpInitiated: true,
        relayState: 'mysecretrelaystate',
        maxIssueDelay: '60s',
        metadataValidDuration: '120s',
      })
    );
  });

  it('should show validation error if relay state is empty', async () => {
    const { user } = setup({ settingsUpdated: mockUpdate });

    await user.click(screen.getByRole('checkbox', { name: /Identity provider initiated login/i }));
    await user.click(screen.getByRole('button', { name: /^Next/i }));

    expect(screen.getByText(/^Relay state is required/i)).toBeInTheDocument();
  });

  it('should show validation error if Max issue delay is invalid', async () => {
    const { user } = setup({ settingsUpdated: mockUpdate });

    await user.type(screen.getByRole('textbox', { name: /^Max issue delay/i }), '-60s');
    await user.click(screen.getByRole('button', { name: /^Next/i }));

    expect(screen.getByText(/^Not a valid duration/i)).toBeInTheDocument();
  });

  it('should show validation error if Metadata valid duration is invalid', async () => {
    const { user } = setup({ settingsUpdated: mockUpdate });

    await user.type(screen.getByRole('textbox', { name: /^Metadata valid duration/i }), '-60s');
    await user.click(screen.getByRole('button', { name: /^Next/i }));

    expect(screen.getByText(/^Not a valid duration/i)).toBeInTheDocument();
  });
});

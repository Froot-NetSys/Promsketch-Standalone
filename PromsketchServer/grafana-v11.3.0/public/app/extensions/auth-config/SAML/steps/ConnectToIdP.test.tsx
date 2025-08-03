import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProvider } from 'test/helpers/TestProvider';

import { getRouteComponentProps } from 'app/core/navigation/__mocks__/routeProps';
import { addRootReducer } from 'app/store/configureStore';

import { mockToolkitActionCreator } from '../../../../../test/core/redux/mocks';
import { authConfigSAMLReducer, settingsUpdated, setMetadataValueType } from '../state/reducers';

import { ConnectToIdPUnconnected, Props } from './ConnectToIdP';

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
  idpMetadataUrl: '',
  idpMetadataPath: '',
  idpMetadata: '',
};

const mockUpdate = mockToolkitActionCreator(settingsUpdated);

const setup = (propOverrides?: Partial<Props>) => {
  addRootReducer(authConfigSAMLReducer);
  const props: Props = {
    ...getRouteComponentProps(),
    samlSettings: defaultSettings,
    metadataValueType: 'url',
    settingsUpdated: mockUpdate,
    setMetadataValueType: mockToolkitActionCreator(setMetadataValueType),
    ...propOverrides,
  };

  render(
    <TestProvider>
      <ConnectToIdPUnconnected {...props} />
    </TestProvider>
  );

  return {
    user: userEvent.setup(),
  };
};

describe('StepConnectToIdP', () => {
  it('should render with default values', () => {
    setup();

    expect(screen.getByRole('textbox', { name: /^Metadata URL/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  it('should submit correct form data', async () => {
    const { user } = setup({ settingsUpdated: mockUpdate });

    await user.type(screen.getByRole('textbox', { name: /^Metadata URL/i }), 'https://my.idp/metadata');
    await user.click(screen.getByRole('button', { name: /^Next/i }));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({
        ...defaultSettings,
        idpMetadataUrl: 'https://my.idp/metadata',
      })
    );
  });

  it('should show validation error if IdP metadata is empty', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /^Next/i }));

    expect(screen.getByText(/^One metadata type should be defined/i)).toBeInTheDocument();
  });

  it('should block validation type fields', async () => {
    const { user } = setup();

    await user.type(screen.getByRole('textbox', { name: /^Metadata URL/i }), 'https://my.idp/metadata');
    await user.click(screen.getByRole('radio', { name: /^Path to file/i }));
    expect(screen.queryByRole('textbox', { name: /^Path to IdP metadata file/i })).not.toBeInTheDocument();

    await user.clear(screen.getByRole('textbox', { name: /^Metadata URL/i }));
    await user.click(screen.getByRole('radio', { name: /^Path to file/i }));
    expect(screen.queryByRole('textbox', { name: /^Path to IdP metadata file/i })).toBeInTheDocument();
  })
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProvider } from 'test/helpers/TestProvider';

import { getRouteComponentProps } from 'app/core/navigation/__mocks__/routeProps';
import { addRootReducer } from 'app/store/configureStore';

import { mockToolkitActionCreator } from '../../../../../test/core/redux/mocks';
import {
  authConfigSAMLReducer,
  settingsUpdated,
  setSignRequests,
  setKeyCertValueType,
  setKeyConfigured,
  setCertConfigured,
} from '../state/reducers';

import { KeyCertUnconnected, Props } from './KeyCert';

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
  privateKey: '',
  privateKeyPath: '',
  certificate: '',
  certificatePath: '',
  signatureAlgorithm: '',
  keyCertValueType: 'base64',
  signRequests: false,
};

const mockUpdate = mockToolkitActionCreator(settingsUpdated);

const setup = (propOverrides?: Partial<Props>) => {
  addRootReducer(authConfigSAMLReducer);
  const props: Props = {
    ...getRouteComponentProps(),
    samlSettings: defaultSettings,
    storedSettings: {},
    signRequests: false,
    keyCertValueType: 'base64',
    keyConfigured: false,
    certConfigured: false,
    setSignRequests: mockToolkitActionCreator(setSignRequests),
    setKeyCertValueType: mockToolkitActionCreator(setKeyCertValueType),
    setKeyConfigured: mockToolkitActionCreator(setKeyConfigured),
    setCertConfigured: mockToolkitActionCreator(setCertConfigured),
    settingsUpdated: mockUpdate,
    ...propOverrides,
  };

  render(
    <TestProvider>
      <KeyCertUnconnected {...props} />
    </TestProvider>
  );

  return {
    user: userEvent.setup(),
  };
};

describe('StepKeyCert', () => {
  it('should render with default values', () => {
    setup();

    expect(screen.getByRole('checkbox', { name: /Sign requests/i })).not.toBeChecked();
    expect(screen.queryByText(/Signature algorithm/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  it('should show signature algorithm if sign request enabled', async () => {
    const { user } = setup({ settingsUpdated: mockUpdate });
    await user.click(screen.getByRole('checkbox', { name: /Sign requests/i }));

    expect(screen.getByText(/^Signature algorithm$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Private key$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Certificate$/i)).toBeInTheDocument();
  });

  it('should submit correct form data', async () => {
    const { user } = setup({ settingsUpdated: mockUpdate });

    await user.click(screen.getByRole('checkbox', { name: /Sign requests/i }));
    await user.click(screen.getByRole('radio', { name: /RSA-SHA512/i }));
    await user.type(
      screen.getByLabelText(/Private key/),
      `LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRRE5RSVdqT0ExdldIVXoKU1BNMUZJS09FNEdkSDY1VnRXbHBaOWRnaEg0Q0ZZTjBSN212Smo0S0JxODZEeHQ4dkp2TE1WMTZHVmgwTkdDUgo1MFFIOGFNYnhvbkRUcVhTb1hpTU00RERTUVRLQllLN2Fad2Z0YzdGRzM1Z0FmZE5VZHI4ZTdWYmRhUE9TaHVxCnFvdER5Q1FwWll6YnQ4NkFCbm9hSjVva0UzcFVGSXd4dzk3TGNkWXNHWno1TmdtYS9WMXRvN2FNZUVxSHlsOHIKRFJiWFpVencvVThnN3lDL2crRzcrNjRsaUo0RllxTEVFVExMU1VlUEtMRmdVSkhYYkYySGdJRGp1cjNueGxFYQplY05RWVZVVFZDR0JGcHdrSTVuMXQzbTMyYXZ3b3RwVUZoTUltamtSRVR5UEtacHZsMCtwN21vcDhtd0ptS3BhCkNWdU5TajIzQWdNQkFBRUNnZ0VBQm40SS9CMjB4eFhjTnpBU2lWWkp2dWE5RGRSSHRteFRsa0x6bkJqMHgyb1kKeTEvTmJzM2Qzb0ZSbjV1RXVoQlpPVGNwaHNnd2RSU0hEWFpzUDNnVU9iZXcrZDJOL3ppZVVJajhoTERWbHZKUApyVS9zNFUvbDUzUTBMaU5CeUU5VGh2TCt6SkxQQ0tKdGQ1dUhaakI1ZkZtNjkrUTdndTh4ZzR4SEl1YiswcFA1ClBIYW5tSENEcmJnTk4vb3FsYXI0RloyTVhUZ2VrVzZBbXljL2tvRTloSW40QmFhMktlL0IvQVVHWTRwTVJMcXAKVEFydCtHVFZlV2VvRlk5UUFDVXBhSHBKaEdiL1Bpb3U2dGxVNTdlNDJjTG9raTFmMCtTQVJzQkJLeVhBN0JCMQoxZk1IMTBLUVlGQTY4ZFRZV2xLelFhdS9LNHhhcWc0RkttdHdGNjZHUVFLQmdRRDlPcE5VUzdvUnhNSFZKYUJSClROV1crVjFGWHljcW9qZWtGcERpalBiMlg1Q1dWMTZvZVdnYVhwMG5PSEZkeTlFV3MzR3RHcGZaYXNhUlZIc1gKU0h0UGg0TmI4SnFIZEdFMC9DRDZ0MCs0RG5zOEJuOWNTcXRkUUI3UjNKbjdJTVhpOVgvVThMREtvK0ExOC9KcQpWOFZnVW5nTW55OVlqTWtRSWJLOFRSV2tZUUtCZ1FEUGY0bnhPNmp1K3RPSEhPUlF0eTNiWUREMCtPVjNJMCtMCjB5ejB1UHJlcnlCVmk5blk0M0tha0g1MkQ3VVpFd3dzQmpqR1hEK1dIOHhFc21CV3NHTlhKdTAyNVB2eklKb3oKbEFFaVh2TXAvTm1ZcCt0WTRyRG1POFJoeVZvY0JxV0h6aDM4bTBJRk9kNEJ5RkQ1bkxFRHJBM3BEVm8wYU5nWQpuMEd3UnlzWkZ3S0JnUURrQ2ozbTZaTVVzVVdFdHkrYVIwRUpobUt5T0RCRE9uWTA5SVZoSDJTL0ZleFZGelVOCkx0Zks5MjA2aHAvQXdlejNMbjJ1VDRaenFxNUs3Zk16VW5pSmRCV2RWQjAwNGw4dm9lWHBJZTlPWnV3ZmNCSjkKZ0ZpMXp5cHgvdUZEdjQyMUJ6UXBCTitRZk9kS2J2YmRRVkZqbnFDeGJTRHI4MHlWbEdNckk1ZmJ3UUtCZ0cwOQpvUnJlcE83RUlPOEdOL0dDcnVMSy9wdEtHa3loeTNRNnhuVkVtZGI0N2hYN25jSkE1SW9aUG1yYmxDVlNVTnN3Cm4xMVhIYWJrc0w4T0JnZzlydDhvUUVUaFF2L2FEelRPVzlhRGxKTnJhZ2VqaUJUd3E5OWFZZVoxZ2pvMUNacTQKMmpLdWJwQ2Z5WkM0ckdEdHJJZlpZaTFxK1MyVWNRaHRkOERkaHdRYkFvR0FBTTRFcERBNHlIQjV5aWVrMXAvbwpDYnFSQ3RhL0R4NkV5bzBLbE5BeVB1RlBBc2h1cEc0TkJ4N21UMkFTZkwrMlZCSG9pNm1IU3JpK0JEWDVyeVlGCmZNWXZwN1VSWW9xN3c3cWl2Umx2dkVnNXlvWXJLMTNGMitHajZ4SjRqRU45bTBLZE0vZzNtSkdxMEhCVElRcnAKU203NVdYc2ZsT3h1VG4wOExiZ0djNHM9Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K`
    );
    await user.type(
      screen.getByRole('textbox', { name: /^Certificate/i }),
      'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURYVENDQWtXZ0F3SUJBZ0lKQUxtVlZ1RFd1NE5ZTUEwR0NTcUdTSWIzRFFFQkN3VUFNRVV4Q3pBSkJnTlYKQkFZVEFrRlZNUk13RVFZRFZRUUlEQXBUYjIxbExWTjBZWFJsTVNFd0h3WURWUVFLREJoSmJuUmxjbTVsZENCWAphV1JuYVhSeklGQjBlU0JNZEdRd0hoY05NVFl4TWpNeE1UUXpORFEzV2hjTk5EZ3dOakkxTVRRek5EUTNXakJGCk1Rc3dDUVlEVlFRR0V3SkJWVEVUTUJFR0ExVUVDQXdLVTI5dFpTMVRkR0YwWlRFaE1COEdBMVVFQ2d3WVNXNTAKWlhKdVpYUWdWMmxrWjJsMGN5QlFkSGtnVEhSa01JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQgpDZ0tDQVFFQXpVQ0ZvemdOYjFoMU0wanpOUlNDamhPQm5SK3VWYlZwYVdmWFlJUitBaFdEZEVlNXJ5WStDZ2F2Ck9nOGJmTHlieXpGZGVobFlkRFJna2VkRUIvR2pHOGFKdzA2bDBxRjRqRE9BdzBrRXlnV0N1Mm1jSDdYT3hSdCsKWUFIM1RWSGEvSHUxVzNXanprb2JxcXFMUThna0tXV00yN2ZPZ0FaNkdpZWFKQk42VkJTTU1jUGV5M0hXTEJtYworVFlKbXYxZGJhTzJqSGhLaDhwZkt3MFcxMlZNOFAxUElPOGd2NFBodS91dUpZaWVCV0tpeEJFeXkwbEhqeWl4CllGQ1IxMnhkaDRDQTQ3cTk1OFpSR25uRFVHRlZFMVFoZ1JhY0pDT1o5YmQ1dDltcjhLTGFWQllUQ0pvNUVSRTgKanltYWI1ZFBxZTVxS2ZKc0NaaXFXZ2xialVvOXR3SURBUUFCbzFBd1RqQWRCZ05WSFE0RUZnUVV4cHV3Y3MvQwpZUU95dWkrcjFHKzNLeEJOaHhrd0h3WURWUjBqQkJnd0ZvQVV4cHV3Y3MvQ1lRT3l1aStyMUcrM0t4Qk5oeGt3CkRBWURWUjBUQkFVd0F3RUIvekFOQmdrcWhraUc5dzBCQVFzRkFBT0NBUUVBQWlXVUtzLzJ4L3ZpTkNLaTNZNmIKbEV1Q3RBR2h6T09aOUVqcnZKOCtDT0gzUmFnM3RWQldyY0JaMy91aGhQcTVneTlscXc0T2t2RXdzOTkvNWpGcwpYMUZKNk1LQmdxZnV5N3loNXMxWWZNMEFOSFljek1tWXBaZUFjUWYyQ0dBYVZmd1RUZlNsek5Mc0YybFcvbHk3CnlhcEZ6bFlTSkxHb1ZFK09IRXU4ZzVTbE5BQ1VFZmtYdys1RWdoaCtLemxJTjdSNlE3cjJpeFdORkJDL2pXZjcKTktVZkp5WDhxSUc1bWQxWVVlVDZHQlc5Qm0yLzEvUmlPMjRKVGFZbGZMZEtLOVRZYjhzRzVCK09MYWIyREltRwo5OUNKMjVSa0FjU29iV05GNXpEME82bGdPbzNjRWRCL2tzQ3EzaG10bEMvRGxMWi9EOENKKzdWdVpuUzFyUjJuCmFRPT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQ=='
    );

    await user.click(screen.getByRole('button', { name: /^Next/i }));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({
        ...defaultSettings,
        signatureAlgorithm: 'rsa-sha512',
        /*
          This is the Base64 encoded private key (PKCS8) used in SAML tests.
          This private key is not used for any real purpose other than testing.
            src/pkg/extensions/saml/testdata/parsable.pkcs8.pem

          Convert the PKCS1 format to PKCS8 format using the following command:
          openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in parsable.pem -out parsable.pkcs8.pem
        */
        privateKey:
          'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRRE5RSVdqT0ExdldIVXoKU1BNMUZJS09FNEdkSDY1VnRXbHBaOWRnaEg0Q0ZZTjBSN212Smo0S0JxODZEeHQ4dkp2TE1WMTZHVmgwTkdDUgo1MFFIOGFNYnhvbkRUcVhTb1hpTU00RERTUVRLQllLN2Fad2Z0YzdGRzM1Z0FmZE5VZHI4ZTdWYmRhUE9TaHVxCnFvdER5Q1FwWll6YnQ4NkFCbm9hSjVva0UzcFVGSXd4dzk3TGNkWXNHWno1TmdtYS9WMXRvN2FNZUVxSHlsOHIKRFJiWFpVencvVThnN3lDL2crRzcrNjRsaUo0RllxTEVFVExMU1VlUEtMRmdVSkhYYkYySGdJRGp1cjNueGxFYQplY05RWVZVVFZDR0JGcHdrSTVuMXQzbTMyYXZ3b3RwVUZoTUltamtSRVR5UEtacHZsMCtwN21vcDhtd0ptS3BhCkNWdU5TajIzQWdNQkFBRUNnZ0VBQm40SS9CMjB4eFhjTnpBU2lWWkp2dWE5RGRSSHRteFRsa0x6bkJqMHgyb1kKeTEvTmJzM2Qzb0ZSbjV1RXVoQlpPVGNwaHNnd2RSU0hEWFpzUDNnVU9iZXcrZDJOL3ppZVVJajhoTERWbHZKUApyVS9zNFUvbDUzUTBMaU5CeUU5VGh2TCt6SkxQQ0tKdGQ1dUhaakI1ZkZtNjkrUTdndTh4ZzR4SEl1YiswcFA1ClBIYW5tSENEcmJnTk4vb3FsYXI0RloyTVhUZ2VrVzZBbXljL2tvRTloSW40QmFhMktlL0IvQVVHWTRwTVJMcXAKVEFydCtHVFZlV2VvRlk5UUFDVXBhSHBKaEdiL1Bpb3U2dGxVNTdlNDJjTG9raTFmMCtTQVJzQkJLeVhBN0JCMQoxZk1IMTBLUVlGQTY4ZFRZV2xLelFhdS9LNHhhcWc0RkttdHdGNjZHUVFLQmdRRDlPcE5VUzdvUnhNSFZKYUJSClROV1crVjFGWHljcW9qZWtGcERpalBiMlg1Q1dWMTZvZVdnYVhwMG5PSEZkeTlFV3MzR3RHcGZaYXNhUlZIc1gKU0h0UGg0TmI4SnFIZEdFMC9DRDZ0MCs0RG5zOEJuOWNTcXRkUUI3UjNKbjdJTVhpOVgvVThMREtvK0ExOC9KcQpWOFZnVW5nTW55OVlqTWtRSWJLOFRSV2tZUUtCZ1FEUGY0bnhPNmp1K3RPSEhPUlF0eTNiWUREMCtPVjNJMCtMCjB5ejB1UHJlcnlCVmk5blk0M0tha0g1MkQ3VVpFd3dzQmpqR1hEK1dIOHhFc21CV3NHTlhKdTAyNVB2eklKb3oKbEFFaVh2TXAvTm1ZcCt0WTRyRG1POFJoeVZvY0JxV0h6aDM4bTBJRk9kNEJ5RkQ1bkxFRHJBM3BEVm8wYU5nWQpuMEd3UnlzWkZ3S0JnUURrQ2ozbTZaTVVzVVdFdHkrYVIwRUpobUt5T0RCRE9uWTA5SVZoSDJTL0ZleFZGelVOCkx0Zks5MjA2aHAvQXdlejNMbjJ1VDRaenFxNUs3Zk16VW5pSmRCV2RWQjAwNGw4dm9lWHBJZTlPWnV3ZmNCSjkKZ0ZpMXp5cHgvdUZEdjQyMUJ6UXBCTitRZk9kS2J2YmRRVkZqbnFDeGJTRHI4MHlWbEdNckk1ZmJ3UUtCZ0cwOQpvUnJlcE83RUlPOEdOL0dDcnVMSy9wdEtHa3loeTNRNnhuVkVtZGI0N2hYN25jSkE1SW9aUG1yYmxDVlNVTnN3Cm4xMVhIYWJrc0w4T0JnZzlydDhvUUVUaFF2L2FEelRPVzlhRGxKTnJhZ2VqaUJUd3E5OWFZZVoxZ2pvMUNacTQKMmpLdWJwQ2Z5WkM0ckdEdHJJZlpZaTFxK1MyVWNRaHRkOERkaHdRYkFvR0FBTTRFcERBNHlIQjV5aWVrMXAvbwpDYnFSQ3RhL0R4NkV5bzBLbE5BeVB1RlBBc2h1cEc0TkJ4N21UMkFTZkwrMlZCSG9pNm1IU3JpK0JEWDVyeVlGCmZNWXZwN1VSWW9xN3c3cWl2Umx2dkVnNXlvWXJLMTNGMitHajZ4SjRqRU45bTBLZE0vZzNtSkdxMEhCVElRcnAKU203NVdYc2ZsT3h1VG4wOExiZ0djNHM9Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K',
        /*
          This is the Base64 encoded certificate used in SAML tests.
          This certificate expires on 25/06/2048.
            src/pkg/extensions/saml/testdata/parsable.cert
        */
        certificate:
          'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURYVENDQWtXZ0F3SUJBZ0lKQUxtVlZ1RFd1NE5ZTUEwR0NTcUdTSWIzRFFFQkN3VUFNRVV4Q3pBSkJnTlYKQkFZVEFrRlZNUk13RVFZRFZRUUlEQXBUYjIxbExWTjBZWFJsTVNFd0h3WURWUVFLREJoSmJuUmxjbTVsZENCWAphV1JuYVhSeklGQjBlU0JNZEdRd0hoY05NVFl4TWpNeE1UUXpORFEzV2hjTk5EZ3dOakkxTVRRek5EUTNXakJGCk1Rc3dDUVlEVlFRR0V3SkJWVEVUTUJFR0ExVUVDQXdLVTI5dFpTMVRkR0YwWlRFaE1COEdBMVVFQ2d3WVNXNTAKWlhKdVpYUWdWMmxrWjJsMGN5QlFkSGtnVEhSa01JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQgpDZ0tDQVFFQXpVQ0ZvemdOYjFoMU0wanpOUlNDamhPQm5SK3VWYlZwYVdmWFlJUitBaFdEZEVlNXJ5WStDZ2F2Ck9nOGJmTHlieXpGZGVobFlkRFJna2VkRUIvR2pHOGFKdzA2bDBxRjRqRE9BdzBrRXlnV0N1Mm1jSDdYT3hSdCsKWUFIM1RWSGEvSHUxVzNXanprb2JxcXFMUThna0tXV00yN2ZPZ0FaNkdpZWFKQk42VkJTTU1jUGV5M0hXTEJtYworVFlKbXYxZGJhTzJqSGhLaDhwZkt3MFcxMlZNOFAxUElPOGd2NFBodS91dUpZaWVCV0tpeEJFeXkwbEhqeWl4CllGQ1IxMnhkaDRDQTQ3cTk1OFpSR25uRFVHRlZFMVFoZ1JhY0pDT1o5YmQ1dDltcjhLTGFWQllUQ0pvNUVSRTgKanltYWI1ZFBxZTVxS2ZKc0NaaXFXZ2xialVvOXR3SURBUUFCbzFBd1RqQWRCZ05WSFE0RUZnUVV4cHV3Y3MvQwpZUU95dWkrcjFHKzNLeEJOaHhrd0h3WURWUjBqQkJnd0ZvQVV4cHV3Y3MvQ1lRT3l1aStyMUcrM0t4Qk5oeGt3CkRBWURWUjBUQkFVd0F3RUIvekFOQmdrcWhraUc5dzBCQVFzRkFBT0NBUUVBQWlXVUtzLzJ4L3ZpTkNLaTNZNmIKbEV1Q3RBR2h6T09aOUVqcnZKOCtDT0gzUmFnM3RWQldyY0JaMy91aGhQcTVneTlscXc0T2t2RXdzOTkvNWpGcwpYMUZKNk1LQmdxZnV5N3loNXMxWWZNMEFOSFljek1tWXBaZUFjUWYyQ0dBYVZmd1RUZlNsek5Mc0YybFcvbHk3CnlhcEZ6bFlTSkxHb1ZFK09IRXU4ZzVTbE5BQ1VFZmtYdys1RWdoaCtLemxJTjdSNlE3cjJpeFdORkJDL2pXZjcKTktVZkp5WDhxSUc1bWQxWVVlVDZHQlc5Qm0yLzEvUmlPMjRKVGFZbGZMZEtLOVRZYjhzRzVCK09MYWIyREltRwo5OUNKMjVSa0FjU29iV05GNXpEME82bGdPbzNjRWRCL2tzQ3EzaG10bEMvRGxMWi9EOENKKzdWdVpuUzFyUjJuCmFRPT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQ==',
      })
    );
  });

  it('should show validation error if base64 private key is invalid', async () => {
    const { user } = setup({ settingsUpdated: mockUpdate });

    await user.click(screen.getByRole('checkbox', { name: /Sign requests/i }));
    await user.type(screen.getByLabelText(/Private key/), 'WRONG');
    await user.click(screen.getByRole('button', { name: /^Next/i }));

    expect(screen.getByText(/^Not valid PEM key/i)).toBeInTheDocument();
  });

  it('should show validation error if base64 certificate is invalid', async () => {
    const { user } = setup({ settingsUpdated: mockUpdate });

    await user.click(screen.getByRole('checkbox', { name: /Sign requests/i }));
    await user.type(screen.getByLabelText(/Certificate/), 'WRONG');
    await user.click(screen.getByRole('button', { name: /^Next/i }));

    expect(screen.getByText(/^Not valid PEM certificate/i)).toBeInTheDocument();
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProvider } from 'test/helpers/TestProvider';

import { getRouteComponentProps } from 'app/core/navigation/__mocks__/routeProps';
import { addRootReducer } from 'app/store/configureStore';

import { mockToolkitActionCreator } from '../../../../test/core/redux/mocks';
import reportsReducers, { defaultTimeRange, initialState, updateReportProp } from '../state/reducers';

import { Share, Props } from './Share';

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('@grafana/runtime/src/config', () => ({
  config: {
    ...jest.requireActual('@grafana/runtime/src/config').config,
    buildInfo: {
      edition: 'Enterprise',
      version: '9.0.0',
      commit: 'abc123',
      env: 'dev',
      latestVersion: '',
      hasUpdate: false,
      hideVersion: false,
    },
    licenseInfo: {
      enabledFeatures: { 'reports.email': true },
    },
    featureToggles: {
      accesscontrol: true,
    },
    bootData: { navTree: [], user: {} },
    rendererAvailable: true,
  },
}));

jest.mock('app/core/core', () => {
  return {
    contextSrv: {
      hasPermission: () => true,
    },
  };
});

const blankReport = initialState.report;
const mockUpdate = jest.fn() as any;

const setup = (propOverrides?: Partial<Props>) => {
  addRootReducer(reportsReducers);
  const props: Props = {
    ...getRouteComponentProps(),
    report: blankReport,
    testEmailIsSending: false,
    updateReportProp: mockToolkitActionCreator(updateReportProp),
    sendTestEmail: jest.fn(),
    ...propOverrides,
  };

  return {
    user: userEvent.setup(),
    component: render(
      <TestProvider>
        <Share {...props} />
      </TestProvider>
    ),
  };
};

describe('Share report', () => {
  it('should render', () => {
    setup();
    expect(screen.getByText(/4. Share/i)).toBeInTheDocument();
  });

  it('should save form values', async () => {
    const { user } = setup({ updateReportProp: mockUpdate });
    await user.type(screen.getByRole('textbox', { name: /report name/i }), 'Test report');
    await user.type(screen.getByPlaceholderText(/Type in the recipients/), 'text@me.com');
    await user.type(screen.getByPlaceholderText(/Type in the recipients/), '{enter}');
    await user.type(screen.getByRole('textbox', { name: /reply-to email/i }), 'reply@test.com');
    await user.click(screen.getByRole('checkbox', { name: /include a dashboard link/i }));
    fireEvent.submit(screen.getByRole('button', { name: /next/i }));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({
        ...blankReport,
        name: 'Test report',
        recipients: 'text@me.com',
        replyTo: 'reply@test.com',
        enableDashboardUrl: false,
      })
    );
  });

  it('should validate recipients', async () => {
    const { user } = setup({ updateReportProp: mockUpdate });
    fireEvent.input(await screen.findByRole('textbox', { name: /report name/i }), { target: { value: 'Test report' } });
    await user.type(screen.getByPlaceholderText(/Type in the recipients/), 'textme.com');
    await user.type(screen.getByPlaceholderText(/Type in the recipients/), '{enter}');

    fireEvent.submit(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findAllByRole('alert')).toHaveLength(1);
    expect((screen.getByRole('textbox', { name: /report name/i }) as HTMLInputElement).value).toBe('Test report');
  });

  it('should have "Send Test Email" button disabled until the required fields are provided', async () => {
    const { user } = setup({
      report: {
        ...blankReport,
        dashboards: [{ dashboard: { name: 'Test dashboard', uid: '1' }, timeRange: defaultTimeRange.raw }],
      },
    });
    expect(screen.getByRole('button', { name: /send test email/i })).toBeDisabled();

    await user.type(screen.getByRole('textbox', { name: /report name/i }), 'Test report');
    await user.type(screen.getByPlaceholderText(/Type in the recipients/), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/Type in the recipients/), '{enter}');

    expect(await screen.findByRole('button', { name: /send test email/i })).not.toBeDisabled();
  });
});

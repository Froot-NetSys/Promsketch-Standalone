import { render, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProvider } from 'test/helpers/TestProvider';

import { ReportsSettingsPage } from './ReportsSettingsPage';

beforeEach(() => {
  jest.clearAllMocks();
  window.URL.createObjectURL = jest.fn(() => 'blob:https://');
});

afterEach(() => {
  (window.URL.createObjectURL as jest.Mock).mockReset();
});

const mockPost = jest.fn(() => {
  return Promise.resolve([]);
});

const mockUpdate: jest.Mock = jest.fn(() => Promise.resolve([]));
window.fetch = mockUpdate;

jest.mock('@grafana/runtime', () => {
  return {
    ...jest.requireActual('@grafana/runtime'),
    getBackendSrv() {
      return {
        get: (url: string) => {
          return {
            branding: {
              emailFooterLink: 'https://footer-link.com',
              emailFooterMode: 'sent-by',
              emailFooterText: 'Test',
              emailLogoUrl: 'https://email-logo.jpg',
              reportLogoUrl: 'https://report-logo.jpg',
            },
            id: 0,
            orgId: 1,
            userId: 1,
          };
        },
        post: mockPost,
      };
    },
    config: {
      ...jest.requireActual('@grafana/runtime').config,
      buildInfo: {
        edition: 'Enterprise',
        version: '9.0.0',
        commit: 'abc123',
        env: 'dev',
        latestVersion: '',
        hasUpdate: false,
        hideVersion: false,
      },
      licenseInfo: {},
      featureToggles: {},
      rendererAvailable: true,
    },
  };
});

jest.mock('app/core/core', () => {
  return {
    contextSrv: {
      hasPermission: () => true,
    },
    appEvents: {
      emit: jest.fn(),
      publish: jest.fn(),
    },
  };
});

const setup = () => {
  render(
    <TestProvider>
      <ReportsSettingsPage />
    </TestProvider>
  );
};

describe('ReportsSettingPage', () => {
  it('should render existing settings', async () => {
    setup();

    expect(await screen.findByText(/report branding/i)).toBeInTheDocument();
    const urlInputs = screen.getAllByRole('textbox', { name: /company logo url/i });
    expect(urlInputs[0]).toHaveValue('https://report-logo.jpg');
    expect(urlInputs[1]).toHaveValue('https://email-logo.jpg');
    expect(screen.getByRole('radio', { name: /sent by/i })).toBeChecked();
    expect(screen.getByRole('textbox', { name: /footer link text/i })).toHaveValue('Test');
    expect(screen.getByRole('textbox', { name: /footer link url/i })).toHaveValue('https://footer-link.com');
  });

  it('should hide footer link and text if footer mode is None', async () => {
    setup();
    expect(await screen.findByRole('radio', { name: /sent by/i })).toBeChecked();
    expect(screen.getByRole('textbox', { name: /footer link text/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /footer link url/i })).toBeInTheDocument();

    const none = screen.getByRole('radio', { name: /none/i });
    fireEvent.click(none);

    expect(await screen.findByRole('radio', { name: /none/i })).toBeChecked();
    expect(screen.queryByRole('textbox', { name: /footer link text/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /footer link url/i })).not.toBeInTheDocument();
  });

  it('should update the form fields on change', async () => {
    setup();
    const user = userEvent.setup();
    expect(await screen.findByText(/report branding/i)).toBeInTheDocument();
    const urlInputs = screen.getAllByRole('textbox', { name: /company logo url/i });
    expect(urlInputs[0]).toHaveValue('https://report-logo.jpg');
    expect(urlInputs[1]).toHaveValue('https://email-logo.jpg');
    await user.clear(urlInputs[0]);
    await user.type(urlInputs[0], 'https://new-logo.png');
    const footerText = screen.getByRole('textbox', { name: /footer link text/i });
    await user.clear(footerText);
    await user.type(footerText, 'New company');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    const testData: FormData = mockUpdate.mock.calls[0][1].body;
    const config = testData.get('config') as string;
    expect(JSON.parse(config).branding).toEqual({
      emailFooterLink: 'https://footer-link.com',
      emailFooterMode: 'sent-by',
      emailFooterText: 'New company',
      emailLogoUrl: 'https://email-logo.jpg',
      reportLogoUrl: 'https://new-logo.png',
    });
  });

  it('should allow uploading files', async () => {
    setup();
    const user = userEvent.setup();
    expect(await screen.findByText(/report branding/i)).toBeInTheDocument();
    const reportLogoPicker = screen.getByTestId('resource-picker-reportLogoUrl');
    await user.click(within(reportLogoPicker).getByRole('radio', { name: /upload file/i }));
    await user.upload(
      within(reportLogoPicker).getByTestId('dropzone').querySelector('input[type="file"]')!,
      new File([JSON.stringify({ ping: true })], 'reportLogoCustom.png', { type: 'image/png' })
    );

    const emailLogoPicker = screen.getByTestId('resource-picker-emailLogoUrl');
    await user.click(within(emailLogoPicker).getByRole('radio', { name: /upload file/i }));
    await user.upload(
      within(emailLogoPicker).getByTestId('dropzone').querySelector('input[type="file"]')!,
      new File([JSON.stringify({ ping: true })], 'emailLogoCustom.png', { type: 'image/png' })
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    const testData: FormData = mockUpdate.mock.calls[0][1].body;
    const files = testData.getAll('files');
    expect(files).toMatchObject([{ path: 'emailLogoCustom.png' }, { path: 'reportLogoCustom.png' }]);
  });
});

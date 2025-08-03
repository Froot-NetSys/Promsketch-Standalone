import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProvider } from 'test/helpers/TestProvider';

import { getRouteComponentProps } from 'app/core/navigation/__mocks__/routeProps';
import { addRootReducer } from 'app/store/configureStore';

import { mockToolkitActionCreator } from '../../../../test/core/redux/mocks';
import { ReportDashboard, ReportFormat } from '../../types';
import reportsReducers, { initialState, updateReportProp } from '../state/reducers';

import { FormatReport, Props } from './FormatReport';

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

jest.mock('../utils/renderer', () => {
  return {
    getRendererMajorVersion: () => 4,
  };
});

const blankReport = initialState.report;
const mockUpdate = mockToolkitActionCreator(updateReportProp);
const setup = (propOverrides?: Partial<Props>) => {
  addRootReducer(reportsReducers);
  const props: Props = {
    isDownloadingCSV: false,
    downloadCSV(reportTitle: string, reportDashboards: ReportDashboard[]): void {},
    ...getRouteComponentProps(),
    report: blankReport,
    updateReportProp: mockUpdate,
    ...propOverrides
  };

  render(
    <TestProvider>
      <FormatReport {...props} />
    </TestProvider>
  );
};

describe('FormatReport', () => {
  it('should render with default values selected', () => {
    setup();

    expect(screen.getByText(/2\. format report/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /attach the report as a pdf/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /embed a dashboard image in the email/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /attach a csv file of table panel data/i })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /landscape/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /grid/i })).toBeChecked();
  });

  it('should submit correct form data', async () => {
    setup();
    await userEvent.click(screen.getByRole('checkbox', { name: /embed a dashboard image in the email/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: /attach a csv file of table panel data/i }));
    await userEvent.click(screen.getByRole('radio', { name: /portrait/i }));
    await userEvent.click(screen.getByRole('radio', { name: /simple/i }));

    await userEvent.click(screen.getByRole('button', { name: /next:/i }));
    expect(mockUpdate).toHaveBeenCalledWith({
      ...blankReport,
      options: { ...blankReport.options, orientation: 'portrait', layout: 'simple' },
      formats: [ReportFormat.PDF, ReportFormat.Image, ReportFormat.CSV],
    });
  });

  it(' not display styling options if PDF format is not selected', async () => {
    setup();
    await userEvent.click(screen.getByRole('checkbox', { name: /attach the report as a pdf/i }));
    expect(screen.queryByRole('radio', { name: /landscape/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /portrait/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /grid/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /simple/i })).not.toBeInTheDocument();
  });

  it('should save correct format', async () => {
    setup();
    await userEvent.click(screen.getByRole('radio', { name: /portrait/i }));
    await userEvent.click(screen.getByRole('radio', { name: /simple/i }));
    await userEvent.click(screen.getByRole('button', { name: /next:/i }));
    expect(mockUpdate).toHaveBeenCalledWith({
      ...blankReport,
      options: { ...blankReport.options, orientation: 'portrait', layout: 'simple' },
      formats: [ReportFormat.PDF],
    });
  });
});

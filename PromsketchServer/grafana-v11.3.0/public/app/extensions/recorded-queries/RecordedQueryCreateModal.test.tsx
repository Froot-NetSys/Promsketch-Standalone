import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';
import { selectOptionInTest } from 'test/helpers/selectOptionInTest';

import { DataQuery, DataSourceInstanceSettings, DataSourceRef } from '@grafana/data';
import { setEchoSrv } from '@grafana/runtime';
import { Echo } from 'app/core/services/echo/Echo';

import * as stateApi from '../licensing/state/api';

import { CreateRecordedQueryUnconnected } from './RecordedQueryCreateModal';

const fetchMock = jest.fn().mockReturnValue(of({ data: { message: 'hello' } }));
const settingsMock = jest.fn().mockReturnValue({ id: 36, uid: 123, type: 'test' });
jest.spyOn(stateApi, 'getLicenseToken').mockResolvedValue({} as any);

jest.mock('app/core/core', () => ({
  contextSrv: {
    hasPermission: (action: string) => true,
    hasRole: (role: string) => true,
  },
}));

jest.mock('@grafana/runtime', () => {
  const original = jest.requireActual('@grafana/runtime');
  const mockedRuntime = { ...original };

  mockedRuntime.getDataSourceSrv = () => {
    return {
      get: settingsMock,
    };
  };

  mockedRuntime.getBackendSrv = () => ({
    fetch: fetchMock,
  });

  return mockedRuntime;
});

beforeAll(() => {
  setEchoSrv(new Echo());
});

describe('RecordedQueryCreateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReturnValue(of({ data: { message: 'hello' } }));
  });

  describe('with license and feature toggle', () => {
    it('validates the form for required values', async () => {
      const user = userEvent.setup();
      render(<CreateRecordedQueryUnconnected onChangeDataSource={() => {}} variables={[]} dispatch={{} as any} />);

      await user.click(screen.getByRole('button', { name: /Create recorded query/ }));
      await user.click(screen.getByText('Start recording query'));

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('posts a recording rule with existing queries to the backend endpoint', async () => {
      const user = userEvent.setup();
      const query: DataQuery = { refId: 'A' };
      const queries: Array<Partial<DataQuery>> = [{ refId: 'A' }];
      const dataSource = { name: 'ds-name' } as DataSourceInstanceSettings;

      render(
        <CreateRecordedQueryUnconnected
          query={query}
          queries={queries}
          dataSource={dataSource}
          onChangeDataSource={() => {}}
          variables={[]}
          dispatch={{} as any}
        />
      );
      await fillRecordedQueryForm();

      await user.click(screen.getByText('Start recording query'));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith({ ...rrQuery, url: 'api/recording-rules', showErrorAlert: false });
      });
    });

    it('posts a recording rule to the test backend endpoint', async () => {
      const user = userEvent.setup();
      const query: DataQuery = { refId: 'A' };
      const queries: Array<Partial<DataQuery>> = [{ refId: 'A' }];
      const dataSource = { name: 'ds-name' } as DataSourceInstanceSettings;

      render(
        <CreateRecordedQueryUnconnected
          query={query}
          queries={queries}
          dataSource={dataSource}
          onChangeDataSource={() => {}}
          variables={[]}
          dispatch={{} as any}
        />
      );

      await fillRecordedQueryForm();

      await user.click(screen.getByLabelText('Test the recorded query'));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith({
          ...rrQuery,
          url: 'api/recording-rules/test',
          showSuccessAlert: false,
          showErrorAlert: false,
        });
      });
    });

    it('displays a link to support when an unknown error occurs', async () => {
      const user = userEvent.setup();
      const mv = { data: { message: 'An unknown issue is preventing the system from processing your query.' } };
      fetchMock.mockReturnValue(throwError(() => mv));

      const query: DataQuery = { refId: 'A' };
      const queries: Array<Partial<DataQuery>> = [{ refId: 'A' }];
      const dataSource = { name: 'ds-name' } as DataSourceInstanceSettings;

      render(
        <CreateRecordedQueryUnconnected
          query={query}
          queries={queries}
          dataSource={dataSource}
          onChangeDataSource={() => {}}
          variables={[]}
          dispatch={{} as any}
        />
      );

      await fillRecordedQueryForm();

      await user.click(screen.getByLabelText('Test the recorded query'));

      await waitFor(() => {
        expect(screen.getByText('Contact Grafana Labs')).toBeInTheDocument();
      });
    });

    it('displays success message when recording is successful', async () => {
      const user = userEvent.setup();
      const query: DataQuery = { refId: 'A' };
      const queries: Array<Partial<DataQuery>> = [{ refId: 'A' }];
      const dataSource = { name: 'ds-name' } as DataSourceInstanceSettings;

      render(
        <CreateRecordedQueryUnconnected
          query={query}
          queries={queries}
          dataSource={dataSource}
          onChangeDataSource={() => {}}
          variables={[]}
          dispatch={{} as any}
        />
      );

      await fillRecordedQueryForm();

      await user.click(screen.getByText('Start recording query'));

      await waitFor(() => {
        expect(screen.getByText('Your new recorded query is recording successfully!')).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
        expect(screen.queryByText('Start recording query')).not.toBeInTheDocument();
      });
    });

    it('uses the data source name from the query if it exists', async () => {
      const user = userEvent.setup();
      const query: DataQuery = { refId: 'A' };
      const ref: DataSourceRef = { uid: 'query-datasource' };
      const queries: Array<Partial<DataQuery>> = [{ refId: 'A', datasource: ref }];
      const dataSource = { name: 'ds-name' } as DataSourceInstanceSettings;

      render(
        <CreateRecordedQueryUnconnected
          query={query}
          queries={queries}
          dataSource={dataSource}
          onChangeDataSource={() => {}}
          variables={[]}
          dispatch={{} as any}
        />
      );
      await fillRecordedQueryForm();

      await user.click(screen.getByText('Start recording query'));

      await waitFor(() => {
        expect(settingsMock).toHaveBeenCalledWith(ref);
      });
    });
  });
});

async function fillRecordedQueryForm() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /Create recorded query/ }));

  const intervalSelect = screen.getByLabelText('Interval-select');

  await user.type(screen.getByRole('textbox', { name: 'Name * Give this query a name' }), 'q-name');
  await user.type(screen.getByRole('textbox', { name: 'Description Provide a description for this query' }), 'desc');
  await selectOptionInTest(intervalSelect, '30 minutes');

  await user.click(screen.getByText('now-10m to now'));
  await user.click(screen.getByText('Last 12 hours'));
  await user.click(screen.getByRole('checkbox'));
}

const rrQuery = {
  data: {
    active: true,
    count: true,
    description: 'desc',
    interval: 1800,
    name: 'q-name',
    queries: [
      {
        datasourceId: 36,
        datasource: { uid: 123, type: 'test' },
        refId: 'A',
      },
    ],
    range: 43200,
    target_ref_id: 'A',
  },
  method: 'POST',
};

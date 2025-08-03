import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { DataSourceSettings } from '@grafana/data';
import { DataSourcePickerProps, setEchoSrv } from '@grafana/runtime';
import { Echo } from 'app/core/services/echo/Echo';

import { IdDataQuery, RecordedQuery } from '../types';

import { filterRecordedQueries, RecordedQueryAddModalUnconnected } from './RecordedQueryAddModal';

function MockPicker(props: DataSourcePickerProps) {
  return <></>;
}

const datasources = [
  { id: 0, name: 'B-Prometheus', uid: 'b', meta: { name: 'Prometheus', info: { logos: { small: '' } } } },
  { id: 1, name: 'Github', uid: 'c', meta: { name: 'Github', info: { logos: { small: '' } } } },
  { id: 2, name: 'A-Prometheus', uid: 'a', meta: { name: 'Prometheus', info: { logos: { small: '' } } } },
];

const settingsMock = jest.fn((instanceDatasource) => datasources.find((ds) => ds.uid === instanceDatasource?.uid));

const dsListMock = jest.fn((params) => {
  return datasources.filter(params.filter);
});

jest.mock('@grafana/runtime', () => {
  const original = jest.requireActual('@grafana/runtime');
  const mockedRuntime = {
    ...original,
    getDataSourceSrv: () => {
      return {
        getInstanceSettings: settingsMock,
        getList: dsListMock,
      };
    },
    DataSourcePicker: MockPicker,
  };

  return mockedRuntime;
});

beforeAll(() => {
  setEchoSrv(new Echo());
});

describe('with license and feature toggle', () => {
  it('renders the active recorded queries and the DataSourceFilter', () => {
    act(() => {
      render(
        <RecordedQueryAddModalUnconnected
          recordedQueries={queries}
          getRecordedQueriesAsync={() => {}}
          onChangeDataSource={() => {}}
          onAddQuery={() => {}}
        />
      );
    });

    fireEvent.click(screen.getByText('Recorded query'));
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('Recorded Query 1')).toBeInTheDocument();
    expect(screen.getByText('Recorded Query 3')).toBeInTheDocument();
    expect(screen.queryByText('Recorded Query 2')).not.toBeInTheDocument(); // not active

    expect(screen.getByText('Filter by data source')).toBeInTheDocument();
  });

  it('filters recorded queries based on selected Datasource', () => {
    act(() => {
      render(
        <RecordedQueryAddModalUnconnected
          recordedQueries={queries}
          getRecordedQueriesAsync={() => {}}
          onChangeDataSource={() => {}}
          onAddQuery={() => {}}
          filterValue={{ uid: 'a' } as DataSourceSettings}
        />
      );
    });

    fireEvent.click(screen.getByText('Recorded query'));
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('Recorded Query 4')).toBeInTheDocument();
    expect(screen.queryByText('Recorded Query 2')).not.toBeInTheDocument(); // same datasource, not active
    expect(screen.queryByText('Recorded Query 1')).not.toBeInTheDocument(); // different datasource

    expect(screen.getByText('Filter by data source')).toBeInTheDocument();
  });

  it('adds checked recorded queries', async () => {
    const addFn = jest.fn();
    act(() => {
      render(
        <RecordedQueryAddModalUnconnected
          recordedQueries={queries}
          getRecordedQueriesAsync={() => {}}
          onChangeDataSource={() => {}}
          onAddQuery={addFn}
          filterValue={{ uid: 'a' } as DataSourceSettings}
        />
      );
    });

    fireEvent.click(screen.getByText('Recorded query'));
    expect(screen.getByText('Add')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    expect(screen.getByText('Add')).toBeEnabled();
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(addFn).toHaveBeenCalledWith({
        datasource: '',
        exemplar: true,
        expr: 'Recorded Query 4{id="query-4", name="Recorded Query 4"}',
        interval: '',
        legendFormat: '',
      });
    });
  });
});
describe('filterRecordedQueries', () => {
  it('filters and sorts based on ds type and rq name', () => {
    queries[1].active = true;
    const res = filterRecordedQueries(queries);
    expect(res[0].name).toBe('Recorded Query 1');
    expect(res[1].name).toBe('Recorded Query 2');
    expect(res[2].name).toBe('Recorded Query 4');
    expect(res[3].name).toBe('Recorded Query 3');
  });

  it('filters and sorts based on ds name and rq name', () => {
    queries[0].queries[0].datasource.uid = 'b'; // switch from github to also prometheus so we have 2 A prometheus and 2 B prometheus datasources
    queries[1].active = true;
    const res = filterRecordedQueries(queries);
    expect(res[0].name).toBe('Recorded Query 2');
    expect(res[1].name).toBe('Recorded Query 4');
    expect(res[2].name).toBe('Recorded Query 1');
    expect(res[3].name).toBe('Recorded Query 3');
  });
});

const queries: RecordedQuery[] = [
  {
    id: 'query-1',
    target_ref_id: 'A',
    name: 'Recorded Query 1',
    prom_name: 'Recorded Query 1',
    description: 'desc',
    range: 21600,
    count: false,
    interval: 10,
    active: true,
    dest_data_source_uid: '',
    queries: [{ datasource: { uid: 'c' } } as IdDataQuery],
  },
  {
    id: 'query-2',
    target_ref_id: 'A',
    name: 'Recorded Query 2',
    prom_name: 'Recorded Query 2',
    description: 'desc 2',
    range: 21600,
    count: true,
    interval: 10,
    active: false,
    dest_data_source_uid: '',
    queries: [{ datasource: { uid: 'a' } } as IdDataQuery],
  },
  {
    id: 'query-3',
    target_ref_id: 'A',
    name: 'Recorded Query 3',
    prom_name: 'Recorded Query 3',
    description: 'desc 3',
    range: 21600,
    count: true,
    interval: 10,
    active: true,
    dest_data_source_uid: '',
    queries: [{ datasource: { uid: 'b' } } as IdDataQuery],
  },
  {
    id: 'query-4',
    target_ref_id: 'A',
    name: 'Recorded Query 4',
    prom_name: 'Recorded Query 4',
    description: 'desc 4',
    range: 21600,
    count: true,
    interval: 10,
    active: true,
    dest_data_source_uid: '',
    queries: [{ datasource: { uid: 'a' } } as IdDataQuery],
  },
];

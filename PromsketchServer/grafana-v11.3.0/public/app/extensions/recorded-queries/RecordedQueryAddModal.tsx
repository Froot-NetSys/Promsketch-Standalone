import { css } from '@emotion/css';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { AppEvents, DataQuery, DataSourceInstanceSettings, GrafanaTheme2 } from '@grafana/data';
import { getDataSourceSrv, reportInteraction } from '@grafana/runtime';
import { Alert, Button, Checkbox, Icon, Modal, useStyles2 } from '@grafana/ui';
import appEvents from 'app/core/app_events';
import { MIXED_DATASOURCE_NAME } from 'app/plugins/datasource/mixed/MixedDataSource';

import { EnterpriseStoreState, RecordedQuery } from '../types';

import { DataSourceFilter } from './DatasourceFilter';
import { QueryCard } from './QueryCard';
import { getRecordedQueriesAsync } from './state/actions';
import { getRecordedQueryItems } from './state/selectors';

const toTQuery = (recordedQuery: RecordedQuery) => ({
  expr: `${recordedQuery.prom_name}{id="${recordedQuery.id}", name="${recordedQuery.name}"}`,
  legendFormat: '',
  interval: '',
  exemplar: true,
  datasource: recordedQuery.dest_data_source_uid,
});

function mapStateToProps(state: EnterpriseStoreState) {
  return {
    recordedQueries: getRecordedQueryItems(state.recordedQueries),
  };
}

interface OwnProps<TQuery extends DataQuery> {
  query?: TQuery;
  queries?: Array<Partial<TQuery>>;
  onAddQuery?: (query: TQuery) => void;
  onChangeDataSource?: (ds: DataSourceInstanceSettings) => void;
  filterValue?: DataSourceSettings;
}

const mapDispatchToProps = {
  getRecordedQueriesAsync,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props<TQuery extends DataQuery> = OwnProps<TQuery> & ConnectedProps<typeof connector>;

export const RecordedQueryAddModalUnconnected = <TQuery extends DataQuery>({
  onAddQuery,
  getRecordedQueriesAsync,
  recordedQueries,
  onChangeDataSource,
  filterValue,
}: Props<TQuery>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSourceSettings | undefined>(filterValue);
  const [toAdd, setToAdd] = useState<RecordedQuery[]>([]);
  const styles = useStyles2(getStyles);
  useEffect(() => {
    getRecordedQueriesAsync();
  }, [isOpen, getRecordedQueriesAsync]);

  const toggleQuery = (q: RecordedQuery, added: boolean) => {
    if (added) {
      setToAdd(toAdd.concat(q));
    } else {
      setToAdd(toAdd.filter((current) => !isEqual(current, q)));
    }
  };

  const addQueries = () => {
    reportInteraction('cloud_user_clicked_add_selected_recorded_queries', {
      recorded_queries_selected: toAdd.map((rq) => rq.name),
    });

    const mixedDs = getDataSourceSrv().getInstanceSettings(MIXED_DATASOURCE_NAME);
    onChangeDataSource?.(mixedDs!);

    toAdd.map(toTQuery).forEach((q) => {
      onAddQuery?.(q as unknown as TQuery);
    });

    setIsOpen(false);
    setToAdd([]);
    appEvents.emit(AppEvents.alertSuccess, [
      'Selected recorded queries added to the editor. The data source has been changed to mixed.',
    ]);
  };

  const queriesToDisplay = filterRecordedQueries(recordedQueries, selectedDataSource).map((rq) => (
    <AddQueryCard key={rq.id} onQueryToggle={toggleQuery} recordedQuery={rq} />
  ));

  const closeModal = () => {
    setIsOpen(false);
    setToAdd([]);
  };

  const openModal = () => {
    reportInteraction('cloud_user_clicked_add_recorded_query_button');
    setIsOpen(true);
  };

  return (
    <>
      <Button icon="plus" onClick={openModal} variant="secondary" className={styles.openButton}>
        Recorded query
      </Button>
      <Modal isOpen={isOpen} title={'Add recorded query'} onDismiss={closeModal} className={styles.modal}>
        <DataSourceFilter value={selectedDataSource?.name} onChange={setSelectedDataSource} />
        <Alert title="" severity="info">
          {'To create a new Recorded Query, return to the query editor and use the '} <Icon name="record-audio" />{' '}
          {' icon in the series bar.'}
        </Alert>
        {queriesToDisplay.length > 0
          ? queriesToDisplay
          : selectedDataSource && (
              <div className={styles.noQueries}>No recorded queries available for {selectedDataSource?.name}</div>
            )}
        <div className={styles.modalButtons}>
          <Button variant={'secondary'} className={styles.modalButton} onClick={closeModal}>
            Cancel
          </Button>
          <Button variant={'primary'} className={styles.modalButton} onClick={addQueries} disabled={toAdd.length === 0}>
            Add
          </Button>
        </div>
      </Modal>
    </>
  );
};

interface AddProps {
  onQueryToggle: (query: RecordedQuery, enabled: boolean) => void;
  recordedQuery: RecordedQuery;
}

const AddQueryCard = ({ onQueryToggle, recordedQuery }: AddProps) => {
  const [value, setValue] = useState<boolean>(false);
  return (
    <QueryCard
      recordedQuery={recordedQuery}
      buttons={[
        <Checkbox
          name={recordedQuery.id}
          value={value}
          key={`${recordedQuery.id}-checked`}
          onChange={() => {
            onQueryToggle(recordedQuery, !value);
            setValue(!value);
          }}
        />,
      ]}
    />
  );
};

interface DataSourceSettings {
  name: string;
  id: number;
  uid: string;
}

export const filterRecordedQueries = (
  recordedQueries: RecordedQuery[],
  selectedDataSource?: DataSourceSettings | undefined
) => {
  const dsSrv = getDataSourceSrv();
  return recordedQueries
    .filter((rq: RecordedQuery) => rq.active)
    .filter((rq: RecordedQuery) => !selectedDataSource || rq.queries[0].datasource.uid === selectedDataSource.uid)
    .sort((a: RecordedQuery, b: RecordedQuery) => {
      const aDs = dsSrv?.getInstanceSettings(a.queries[0]?.datasource);
      const bDs = dsSrv?.getInstanceSettings(b.queries[0]?.datasource);

      // 1. The name of the data source plugin
      const dsSort = aDs?.meta.name.localeCompare(bDs?.meta.name ?? '');
      if (dsSort !== undefined && dsSort !== 0) {
        return dsSort;
      }

      // 2. The user configured data source name
      const dsNameSort = aDs?.name.localeCompare(bDs?.name ?? '');
      if (dsNameSort !== undefined && dsNameSort !== 0) {
        return dsNameSort;
      }

      // 3. The recording rule name
      return a.name.localeCompare(b.name);
    });
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    modalButtons: css`
      display: flex;
      justify-content: end;
    `,
    openButton: css`
      margin-left: -8px;
    `,
    modalButton: css`
      margin-left: ${theme.spacing(1)};
    `,
    modal: css`
      width: 750px;
    `,
    noQueries: css`
      margin-left: ${theme.spacing(1)};
      margin-bottom: ${theme.spacing(3)};
    `,
  };
};

export const RecordedQueryAddModal = connector(RecordedQueryAddModalUnconnected);

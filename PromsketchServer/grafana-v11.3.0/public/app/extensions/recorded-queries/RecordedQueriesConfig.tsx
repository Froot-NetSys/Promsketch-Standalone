import { css } from '@emotion/css';
import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import { Button, ConfirmModal, LinkButton, useStyles2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';

import { EnterpriseStoreState, RecordedQuery } from '../types';

import { EmptyRecordedQueryList } from './EmptyRecordedQueryList';
import { QueryCard } from './QueryCard';
import { deleteRecordedQuery, getRecordedQueriesAsync, updateRecordedQuery } from './state/actions';
import { getRecordedQueryItems } from './state/selectors';

export type Props = GrafanaRouteComponentProps & ConnectedProps<typeof connector>;

function mapStateToProps(state: EnterpriseStoreState) {
  return {
    navModel: getNavModel(state.navIndex, 'recordedQueries'),
    recordedQueries: getRecordedQueryItems(state.recordedQueries),
    isLoading: state.recordedQueries.isLoading,
  };
}

const mapDispatchToProps = {
  getRecordedQueriesAsync,
  updateRecordedQuery,
  deleteRecordedQuery,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export const RecordedQueriesConfigUnconnected = ({
  navModel,
  isLoading,
  recordedQueries,
  getRecordedQueriesAsync,
  updateRecordedQuery,
  deleteRecordedQuery: onDeleteRecordedQuery,
}: Props) => {
  useEffect(() => {
    getRecordedQueriesAsync();
  }, [getRecordedQueriesAsync]);
  const styles = useStyles2(getStyles);

  const [deleteRecordedQuery, setDeleteRecordedQuery] = useState<RecordedQuery>();

  const queriesToDisplay = recordedQueries.map((rq: RecordedQuery) => {
    const buttons = [
      <Button
        key={'toggle-recorded-query-active'}
        onClick={async () => {
          await updateRecordedQuery({ ...rq, active: !rq.active });
        }}
        variant={rq.active ? 'secondary' : 'primary'}
      >
        {rq.active ? 'Pause recording' : 'Resume recording'}
      </Button>,
      <Button
        key={'delete-recorded-query'}
        aria-label={'Delete recorded query'}
        onClick={() => setDeleteRecordedQuery(rq)}
        variant={'destructive'}
      >
        Delete
      </Button>,
    ];

    return <QueryCard key={rq.id} recordedQuery={rq} buttons={buttons} />;
  });

  const contents = () => {
    if (isLoading) {
      return <PageLoader />;
    }
    return queriesToDisplay.length === 0 ? <EmptyRecordedQueryList /> : queriesToDisplay;
  };

  return (
    <Page navModel={navModel}>
      <Page.Contents>
        <div className={styles.header}>
          <LinkButton icon={'cog'} href={'/recorded-queries/write-target'}>
            Edit remote write target
          </LinkButton>
        </div>
        {contents()}
        {deleteRecordedQuery && (
          <ConfirmModal
            isOpen
            icon="trash-alt"
            title="Delete"
            body={<div>Are you sure you want to delete &apos;{deleteRecordedQuery.name}&apos;?</div>}
            confirmText="Delete"
            onDismiss={() => setDeleteRecordedQuery(undefined)}
            onConfirm={async () => {
              await onDeleteRecordedQuery(deleteRecordedQuery);
              setDeleteRecordedQuery(undefined);
            }}
          />
        )}
      </Page.Contents>
    </Page>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    header: css`
      display: flex;
      justify-content: flex-end;
      margin-bottom: ${theme.spacing(1)};
    `,
    title: css`
      margin-bottom: 0;
      width: 100%;
    `,
  };
};

export const RecordedQueriesConfig = connector(RecordedQueriesConfigUnconnected);
export default RecordedQueriesConfig;

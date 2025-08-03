import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { config, featureEnabled } from '@grafana/runtime';
import { Icon, Input, LinkButton } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { UpgradeBox } from 'app/core/components/Upgrade/UpgradeBox';
import { contextSrv } from 'app/core/core';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { highlightTrial } from 'app/features/admin/utils';

import { EnterpriseStoreState, Report, AccessControlAction } from '../types';

import { NoRendererInfoBox, OldRendererInfoBox } from './RenderingWarnings';
import { ReportList } from './ReportsList';
import { ReportUpgradeContent } from './ReportsUpgradePage';
import { UnavailableFeatureInfoBox } from './UnavailableFeatureInfoBox';
import { getReports, deleteReport, updateReport } from './state/actions';
import { getRendererMajorVersion } from './utils/renderer';

function mapStateToProps(state: EnterpriseStoreState) {
  return {
    reports: state.reports.reports,
    hasFetched: state.reports.hasFetchedList,
    searchQuery: state.reports.searchQuery,
    reportCount: state.reports.reportCount,
  };
}

const mapDispatchToProps = {
  getReports,
  deleteReport,
  updateReport,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = GrafanaRouteComponentProps & ConnectedProps<typeof connector>;

export const ReportsListPage = ({
  getReports,
  deleteReport,
  updateReport,
  reports,
  reportCount,
  hasFetched,
}: Props) => {
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getReports();
  }, [getReports]);

  const onDeleteReport = (report: Report) => {
    deleteReport(report.id);
  };

  const renderList = () => {
    const { rendererAvailable } = config;
    const rendererMajorVersion = getRendererMajorVersion();
    const canCreateReport = contextSrv.hasPermission(AccessControlAction.ReportingCreate);
    const enableNewReport = rendererAvailable && canCreateReport;

    if (!featureEnabled('reports.creation')) {
      return (
        <>
          <UnavailableFeatureInfoBox
            message="Creating new reports is not available with an expired license.
              Existing reports continue to be processed but you need to update your license to create a new one."
          />
          {reportCount > 0 && (
            <ReportList reports={reports} deleteReport={onDeleteReport} updateReport={updateReport} filter={filter} />
          )}
        </>
      );
    }

    return (
      <>
        {!rendererAvailable && <NoRendererInfoBox variant="error" />}
        {rendererAvailable && rendererMajorVersion !== null && rendererMajorVersion < 3 && <OldRendererInfoBox />}
        {highlightTrial() && (
          <UpgradeBox
            featureId={'reporting'}
            eventVariant={'trial'}
            featureName={'reporting'}
            text={'Create unlimited reports during your trial of Grafana Pro.'}
          />
        )}
        {reportCount > 0 ? (
          <>
            <div className="page-action-bar">
              <div className="gf-form gf-form--grow">
                <Input
                  placeholder={'Search reports by report name, dashboard name or recipients'}
                  prefix={<Icon name={'search'} />}
                  width={56}
                  onChange={(e) => setFilter((e.target as HTMLInputElement).value)}
                />
                <div className="page-action-bar__spacer" />
                <LinkButton variant="primary" href="reports/new" disabled={!enableNewReport} icon={'plus'}>
                  Create a new report
                </LinkButton>
              </div>
            </div>
            <ReportList reports={reports} deleteReport={onDeleteReport} updateReport={updateReport} filter={filter} />
          </>
        ) : (
          rendererAvailable &&
          (highlightTrial() ? (
            <ReportUpgradeContent action={{ text: 'Create report', link: 'reports/new' }} />
          ) : (
            <EmptyListCTA
              title="You haven't created any reports yet."
              buttonIcon="envelope"
              buttonLink="reports/new"
              buttonTitle="Create a new report"
              buttonDisabled={!enableNewReport}
              proTip=""
              proTipLink=""
              proTipLinkTitle=""
              proTipTarget="_blank"
            />
          ))
        )}
      </>
    );
  };

  return (
    <Page
      navId="reports-list"
      subTitle="Manage automatically generated PDF reports from any dashboards and have Grafana email them to interested parties."
    >
      <Page.Contents isLoading={!hasFetched}>{renderList()}</Page.Contents>
    </Page>
  );
};

export default connector(ReportsListPage);

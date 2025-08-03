import { useCallback, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useParams } from 'react-router-dom-v5-compat';

import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { Loader } from 'app/features/plugins/admin/components/Loader';

import { EnterpriseStoreState, StepKey } from '../../types';
import { reportSteps } from '../index';
import { loadReport } from '../state/actions';
import { clearReportState } from '../state/reducers';

import { ReportPageContainer } from './ReportPageContainer';

interface OwnProps extends GrafanaRouteComponentProps<{ id: string; step: StepKey }> {}

const mapStateToProps = (state: EnterpriseStoreState, props: OwnProps) => {
  const { report, isLoading } = state.reports;

  return {
    existingReport: !!report.id,
    isLoading,
    report,
  };
};

const mapActionsToProps = {
  loadReport,
  clearReportState,
};

const connector = connect(mapStateToProps, mapActionsToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;

export const ReportPage = ({ existingReport, isLoading, loadReport, report, clearReportState }: Props) => {
  const { id: reportId, step: activeStep = StepKey.SelectDashboard } = useParams();
  const isReportLoading = Boolean(reportId && isLoading);

  useEffect(() => {
    if (reportId) {
      loadReport(parseInt(reportId, 10));
    }

    return () => {
      clearReportState();
    };
  }, [reportId, loadReport, clearReportState]);

  const renderStep = useCallback(() => {
    const Component = reportSteps.find(({ id }) => id === activeStep)?.component;
    if (!Component) {
      return null;
    }
    return <Component reportId={reportId} />;
  }, [activeStep, reportId]);

  return (
    <ReportPageContainer isLoading={isReportLoading} editMode={existingReport} report={report}>
      {isReportLoading ? <Loader /> : renderStep()}
    </ReportPageContainer>
  );
};

export default connector(ReportPage);

import { HTMLAttributes, useEffect } from 'react';
import * as React from 'react';

import { config } from '@grafana/runtime';
import { Page } from 'app/core/components/Page/Page';
import PageLoader from 'app/core/components/PageLoader/PageLoader';

import { Report } from '../../types';
import { NoRendererInfoBox } from '../RenderingWarnings';
import { getPageNavInformation } from '../utils/navigation';

interface Props extends HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
  editMode?: boolean;
  children?: React.ReactNode;
  report: Report;
}

export const ReportPageContainer = ({ children, editMode, isLoading, className, report, ...rest }: Props) => {
  useEffect(() => {
    document.title = `Reporting: ${editMode ? 'Edit report' : 'New report'}`;
  }, [editMode]);

  const pageNav = getPageNavInformation({ report, editMode });

  return (
    <Page navId="reports-list" pageNav={pageNav}>
      <Page.Contents>
        <div {...rest}>
          {isLoading ? <PageLoader /> : !config.rendererAvailable ? <NoRendererInfoBox variant="error" /> : children}
        </div>
      </Page.Contents>
    </Page>
  );
};

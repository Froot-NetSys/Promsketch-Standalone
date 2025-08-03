import { upperFirst } from 'lodash';

import { ReportFormat } from '../../types';

export const getFormatsDisplay = (formats: ReportFormat[]) => {
  return upperFirst(
    formats
      .map((format) => {
        switch (format) {
          case ReportFormat.CSV:
          case ReportFormat.PDF:
            return format.toUpperCase();
          case ReportFormat.Image:
            return 'embedded image';
          case ReportFormat.PDFTablesAppendix:
            return 'PDF tables appendix';
          case ReportFormat.PDFTables:
            return 'PDF tables';
        }
      })
      .join(', ')
  );
};

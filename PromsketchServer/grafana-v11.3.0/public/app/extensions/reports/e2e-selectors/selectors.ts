import { Components, E2ESelectors } from '@grafana/e2e-selectors';

export const ReportingComponents = {
  reportForm: {
    nextStep: (step: string) => `data-testid report form next ${step}`,
    previousStep: (step: string) => `data-testid report form previous ${step}`,
    selectDashboard: (index: string) => `data-testid report select dashboard ${index}`,
    formatCheckbox: (format: string) => `data-testid report form checkbox format ${format}`,
    nameInput: 'data-testid report name input',
    sendTestEmailButton: 'data-testid report send test email button',
    useRecipientsCheckbox: 'data-testid report send test email use recipients checkbox',
    sendTestEmailConfirmButton: 'data-testid report send test email confirm button',
    submitButton: 'data-testid report form submit button',
  },
  scheduleReport: {
    shareMenuItem: 'data-testid new share button schedule report',
  },
  NewShareButton: {
    Menu: {
      scheduleReport: 'data-testid new share button schedule report',
    },
  },
  NewExportButton: {
    Menu: {
      exportAsPdf: 'data-testid new export button export as pdf',
    },
  },
  ExportAsPdf: {
    unavailableFeatureInfoBox: 'data-testid unavailable feature info box',
    noRendererInfoBox: 'data-testid no renderer info box',
    container: 'data-testid export as pdf drawer container',
    orientationButton: 'data-testid export as pdf orientation button',
    layoutButton: 'data-testid export as pdf layout button',
    zoomSlider: 'data-testid export as zoom slider',
    previewImage: 'data-testid export as pdf preview image',
    generatePdfButton: 'data-testid export as pdf generate pdf button',
    cancelButton: 'data-testid export as pdf cancel button',
    modalCancelButton: 'data-testid old modal cancel button',
    saveAsPdfButton: 'data-testid save as pdf button',
  },
};

export const ReportingPages = {
  Report: {
    url: '/reports',
    createButtonCTA: Components.CallToActionCard.buttonV2('Create a new report'),
  },
};

export const selectors: {
  pages: E2ESelectors<typeof ReportingPages>;
  components: E2ESelectors<typeof ReportingComponents>;
} = {
  pages: ReportingPages,
  components: ReportingComponents,
};

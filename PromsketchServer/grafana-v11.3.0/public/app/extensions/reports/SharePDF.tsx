import { css } from '@emotion/css';
import { useMemo, useState } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { config, featureEnabled, reportInteraction } from '@grafana/runtime';
import { Button, Field, LinkButton, Modal, RadioButtonGroup, Slider, Stack, useStyles2 } from '@grafana/ui';
import { t, Trans } from 'app/core/internationalization';
import { ShareModalTabProps } from 'app/features/dashboard/components/ShareModal';
import { ALL_VARIABLE_VALUE } from 'app/features/variables/constants';
import { getVariablesByKey } from 'app/features/variables/state/selectors';

import { ReportLayout, reportLayouts, ReportOrientation, reportOrientations } from '../types';

import { AllTemplateAlert } from './AllTemplateAlert';
import { NoRendererInfoBox } from './RenderingWarnings';
import { UnavailableFeatureInfoBox } from './UnavailableFeatureInfoBox';
import { defaultScaleFactor, reportScales } from './constants';
import { selectors } from './e2e-selectors/selectors';
import LandscapeGrid from './img/Landscape-Grid.svg';
import LandscapeSimple from './img/Landscape-Simple.svg';
import PortraitGrid from './img/Portrait-Grid.svg';
import PortraitSimple from './img/Portrait-Simple.svg';
import { getVariablesUsedInRepeatingPanels } from './state/actions';
import { buildPdfLink } from './utils/pdf';
import { getSelectedVariable, toReportVariables } from './utils/variables';

const selector = selectors.components.ExportAsPdf;

const PREVIEW_IMAGES = {
  landscapegrid: LandscapeGrid,
  landscapesimple: LandscapeSimple,
  portraitgrid: PortraitGrid,
  portraitsimple: PortraitSimple,
};

export const SharePDFBase = ({
  displayQueryVariablesAlert,
  onDismiss,
  variables,
  dashboardUid,
}: {
  displayQueryVariablesAlert?: boolean;
  onDismiss?(): void;
  variables: Record<string, string[]>;
  dashboardUid: string;
}) => {
  const [orientation, setOrientation] = useState<ReportOrientation>('landscape');
  const [layout, setLayout] = useState<ReportLayout>('grid');
  const [scaleFactor, setScaleFactor] = useState(defaultScaleFactor);

  const styles = useStyles2(getStyles);
  const imgSrc = PREVIEW_IMAGES[`${orientation}${layout}`];

  const pdfUrl = buildPdfLink(orientation, layout, scaleFactor, dashboardUid, variables);

  function onClickSave() {
    reportInteraction('dashboards_sharing_pdf_save_clicked', {
      orientation,
      layout,
      scaleFactor,
    });
  }

  if (!config.rendererAvailable) {
    return <NoRendererInfoBox data-testid={selector.noRendererInfoBox}/>;
  }

  if (!featureEnabled('reports.pdf')) {
    return (
      <UnavailableFeatureInfoBox  
        message="Rendering a dashboard as a PDF document is not available with your current license.
            To enable this feature, update your license."
      />
    );
  }

  return (
    <div data-testid={selector.container}>
      {displayQueryVariablesAlert && <AllTemplateAlert />}
      <p className="share-modal-info-text">
        <Trans i18nKey="export.pdf.info-text">Export the dashboard as a PDF document</Trans>
      </p>
      <Field label={t('export.pdf.orientation-label', 'Orientation')} data-testid={selector.orientationButton}>
        <RadioButtonGroup options={reportOrientations} value={orientation} onChange={setOrientation} />
      </Field>
      <Field label={t('export.pdf.layout-label', 'Layout')} data-testid={selector.layoutButton}>
        <RadioButtonGroup options={reportLayouts} value={layout} onChange={setLayout} />
      </Field>
      <Field
        label={t('export.pdf.zoom-label', 'Zoom')}
        description={t('export.pdf.zoom-description', 'Zoom in to enlarge text, or zoom out to see more data (like table columns) per panel.')}
        className={styles.zoomSlider}
        data-testid={selector.zoomSlider}
      >
        <Slider
          value={scaleFactor}
          min={1}
          max={3}
          step={1}
          marks={reportScales()}
          onChange={setScaleFactor}
          included={false}
        />
      </Field>
      {config.featureToggles.newDashboardSharingComponent ? (
        <div>
          <div className={styles.imageContainer}>
            <img data-testid={selector.previewImage} src={imgSrc} alt={t('export.pdf.image-alt', 'PDF preview')} />
          </div>
          <div className={styles.container}>
            <Stack gap={1} flex={1} direction={{ xs: 'column', sm: 'row' }}>
              <LinkButton data-testid={selector.generatePdfButton} variant="primary" href={pdfUrl} target="_blank" rel="noreferrer noopener" icon="external-link-alt" onClick={onClickSave}>
                <Trans i18nKey="export.pdf.download-button">
                  Generate PDF
                </Trans>
              </LinkButton>
              <Button data-testid={selector.cancelButton} variant="secondary" onClick={onDismiss}>
                <Trans i18nKey="export.pdf.cancel-button">Cancel</Trans>
              </Button>
            </Stack>
          </div>
        </div>
      ) : (
      <Modal.ButtonRow>
        <Button data-testid={selector.modalCancelButton} variant="secondary" onClick={onDismiss}>
          Cancel
        </Button>
        <LinkButton data-testid={selector.saveAsPdfButton} variant="primary" href={pdfUrl} target="_blank" rel="noreferrer noopener" onClick={onClickSave}>
          Save as PDF
        </LinkButton>
      </Modal.ButtonRow>
      )}
    </div>   
  );
};

export const SharePDF = ({ dashboard, onDismiss }: ShareModalTabProps) => {
  const displayQueryVariablesAlert = useMemo(() => {
    const variablesUsedInRepeatingPanelsSet = getVariablesUsedInRepeatingPanels(dashboard.panels);
    const variables = getVariablesByKey(dashboard.uid);
    const selectedVariable = getSelectedVariable(ALL_VARIABLE_VALUE, 'query', variables);
    return selectedVariable && variablesUsedInRepeatingPanelsSet.has(selectedVariable.name);
  }, [dashboard]);

  const variables = useMemo(() => {
    const variables = getVariablesByKey(dashboard.uid);
    return toReportVariables(variables);
  }, [dashboard.uid]);

  return (
    <SharePDFBase
      displayQueryVariablesAlert={displayQueryVariablesAlert}
      onDismiss={onDismiss}
      variables={variables}
      dashboardUid={dashboard.uid}
    />
  );
};

function getStyles(theme: GrafanaTheme2) {
  return {
    container: css({
      padding: `${theme.spacing(2)} 0`,
    }),
    imageContainer: css({
      display: 'flex',
      height: 320,
      maxWidth: '100%',
      padding: theme.spacing(2),
      margin: 'auto',
      justifyContent: 'center',
    }),
    zoomSlider: css({
      maxWidth: 350,
      input: {
        display: 'none',
      },
    }),
  };
}

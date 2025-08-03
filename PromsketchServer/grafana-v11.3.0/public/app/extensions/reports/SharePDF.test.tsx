import { render, screen, fireEvent} from '@testing-library/react';

import { config, featureEnabled} from '@grafana/runtime';

import { SharePDFBase} from './SharePDF';
import { selectors } from './e2e-selectors/selectors';
import { buildPdfLink } from './utils/pdf';


const selector = selectors.components.ExportAsPdf;

// Mocking external dependencies
jest.mock('@grafana/runtime', () => ({
  config: {
    rendererAvailable: true,
    featureToggles: {
      newDashboardSharingComponent: true,
    },
  },
  featureEnabled: jest.fn(),
  reportInteraction: jest.fn(),
}));

jest.mock('./utils/pdf', () => ({
  buildPdfLink: jest.fn(),
}));

jest.mock('./state/actions', () => ({
  getVariablesUsedInRepeatingPanels: jest.fn(),
}));

// Mock child components
jest.mock('./AllTemplateAlert', () => <div data-testid="AllTemplateAlert" />);
jest.mock('./RenderingWarnings', () => ({
  NoRendererInfoBox: () => <div data-testid={selector.noRendererInfoBox}/>,
}));
jest.mock('./UnavailableFeatureInfoBox', () => ({
  UnavailableFeatureInfoBox: ({ message }: { message: string }) => (
    <div data-testid={selector.unavailableFeatureInfoBox}>{message}</div>
  ),
}));

// Define default props for SharePDFBase
const defaultProps = {
  displayQueryVariablesAlert: false,
  onDismiss: jest.fn(),
  variables: {},
  dashboardUid: 'test-uid',
};

// Helper function to render the component
const renderComponent = (props = defaultProps) => {
  return render(<SharePDFBase {...props} />);
};

describe('SharePDFBase', () => {
  beforeEach(() => {
    // Default mocks
    config.rendererAvailable = true;
    config.featureToggles.newDashboardSharingComponent = true;
    (featureEnabled as jest.Mock).mockReturnValue(true);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should render NoRendererInfoBox when renderer is unavailable', () => {
    config.rendererAvailable = false;

    renderComponent();
    expect(screen.getByTestId(selector.noRendererInfoBox)).toBeInTheDocument();
  });

  it('should render UnavailableFeatureInfoBox when reporting feature not enabled is unavailable', () => {
    (featureEnabled as jest.Mock).mockReturnValue(false);
    renderComponent();
    expect(screen.getByTestId(selector.unavailableFeatureInfoBox)).toBeInTheDocument();
  });

  it('should render only old modal components when newDashboardSharingComponent is disabled', () => {
    config.featureToggles.newDashboardSharingComponent = false;
    renderComponent();
    expect(screen.getByTestId(selector.orientationButton)).toBeInTheDocument();
    expect(screen.getByTestId(selector.layoutButton)).toBeInTheDocument();
    expect(screen.getByTestId(selector.zoomSlider)).toBeInTheDocument();
    expect(screen.getByTestId(selector.modalCancelButton)).toBeInTheDocument();
    expect(screen.getByTestId(selector.saveAsPdfButton)).toBeInTheDocument();

    expect(screen.queryByTestId(selector.previewImage)).not.toBeInTheDocument();
    expect(screen.queryByTestId(selector.generatePdfButton)).not.toBeInTheDocument();
    expect(screen.queryByTestId(selector.cancelButton)).not.toBeInTheDocument();
    
  });

  it('should renders new components when newDashboardSharingComponent is enabled', () => {
    renderComponent();
    expect(screen.getByTestId(selector.orientationButton)).toBeInTheDocument();
    expect(screen.getByTestId(selector.layoutButton)).toBeInTheDocument();
    expect(screen.getByTestId(selector.zoomSlider)).toBeInTheDocument();
    expect(screen.getByTestId(selector.previewImage)).toBeInTheDocument();
    expect(screen.getByTestId(selector.cancelButton)).toBeInTheDocument();
    expect(screen.getByTestId(selector.generatePdfButton)).toBeInTheDocument();

    expect(screen.queryByTestId(selector.modalCancelButton)).not.toBeInTheDocument();
    expect(screen.queryByTestId(selector.saveAsPdfButton)).not.toBeInTheDocument();
    
  });

  it('should update orientation and layout', async () => {
    (config as any).featureToggles.newDashboardSharingComponent = true;
    await renderComponent();

    // Initially,landscape and grid
    
    expect(screen.getByRole('radio', { name: /landscape/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /grid/i })).toBeChecked();

    // Change to portrait and grid
    await fireEvent.click(screen.getByRole('radio', { name: /portrait/i }));
    expect(screen.getByRole('radio', { name: /portrait/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /grid/i })).toBeChecked();

    // Change to portrait and simple
    await fireEvent.click(screen.getByRole('radio', { name: /simple/i }));
    expect(screen.getByRole('radio', { name: /portrait/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /simple/i })).toBeChecked();

    // Change to landscape and simple
    await fireEvent.click(screen.getByRole('radio', { name: /landscape/i }));
    expect(screen.getByRole('radio', { name: /landscape/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /simple/i })).toBeChecked();
  });

  it('should render zoom slider', async () => {
    renderComponent();

    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    
    expect(slider).toHaveAttribute('aria-valuemin', '1');
    expect(slider).toHaveAttribute('aria-valuenow', '2');
    expect(slider).toHaveAttribute('aria-valuemax', '3');
  });

  it('calls Generate PDF and has correct href when "Generate PDF" is clicked', async () => {
    renderComponent();
    const generatePdfButton = screen.getByTestId(selector.generatePdfButton);

    await fireEvent.click(screen.getByRole('radio', { name: /simple/i }));
    await fireEvent.click(generatePdfButton);

    expect(buildPdfLink).toHaveBeenCalledWith('landscape','simple', 2, 'test-uid',{});
  });
  
  it('calls onDismiss when "Cancel" is clicked', () => {
    const onDismissMock = jest.fn();
    renderComponent({ ...defaultProps, onDismiss: onDismissMock });
    const cancelButton = screen.getByTestId(selector.cancelButton);

    fireEvent.click(cancelButton);
    expect(onDismissMock).toHaveBeenCalled();
  });
})

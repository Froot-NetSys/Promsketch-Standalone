import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { selectors as e2eSelectors } from '@grafana/e2e-selectors/src';
import { locationService, setEchoSrv } from '@grafana/runtime';
import config from 'app/core/config';
import { backendSrv } from 'app/core/services/backend_srv';
import { Echo } from 'app/core/services/echo/Echo';

import { TestProvider } from '../../../test/helpers/TestProvider';
import { contextSrv } from '../../core/services/context_srv';

import { ConfirmAccessPage } from './ConfirmAccessPage';
import { EMAIL_SHARING_MAGIC_LINK_ERRORS } from './utils';

require('./api/emailSharingApi');
const server = setupServer();

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  getBackendSrv: () => backendSrv,
}));

beforeEach(() => {
  config.licenseInfo = { ...config.licenseInfo, enabledFeatures: { publicDashboardsEmailSharing: true } };
  config.featureToggles.publicDashboardsEmailSharing = true;
  config.featureToggles.publicDashboards = true;

  jest.spyOn(contextSrv, 'hasPermission').mockReturnValue(true);
});

const realLocation = window.location;

beforeAll(() => {
  setEchoSrv(new Echo());
  server.listen({ onUnhandledRequest: 'bypass' });

  // @ts-ignore
  delete window.location;
  window.location = { ...realLocation, assign: jest.fn() };
});
afterEach(() => {
  jest.restoreAllMocks();
  server.resetHandlers();
});
afterAll(() => {
  server.close();
  window.location = realLocation;
});

const selectors = e2eSelectors.pages.PublicDashboardConfirmAccess;
const renderPage = () => {
  locationService.push('/public-dashboards/123/confirm-access?magicLinkToken=456');

  return render(
    <TestProvider>
      <ConfirmAccessPage />
    </TestProvider>
  );
};

describe('ConfirmAccessPage', () => {
  it('does not redirect when it is not an email sharing known error', async () => {
    server.use(
      http.post('/api/public/dashboards/share/:magicLinkToken', () =>
        HttpResponse.json({
          messageId: 'something wrong',
        }, {
          status: 400
        })
      )
    );
    renderPage();

    await userEvent.click(screen.getByTestId(selectors.submitButton));
    await waitFor(() => expect(screen.getByTestId(selectors.submitButton)).toBeEnabled());

    expect(screen.getByTestId(selectors.submitButton)).toBeInTheDocument();
  });
  Object.values(EMAIL_SHARING_MAGIC_LINK_ERRORS).forEach(async (knownError) => {
    it(`redirects when it is ${knownError} error`, async () => {
      server.use(
        http.post('/api/public/dashboards/share/:magicLinkToken', () =>
          HttpResponse.json({
            messageId: knownError
          }, {
            status: 400
          })
        )
      );

      renderPage();

      await userEvent.click(screen.getByTestId(selectors.submitButton));
      await waitFor(() => expect(screen.getByTestId(selectors.submitButton)).toBeEnabled());

      expect(window.location.assign).toHaveBeenCalled();
    });
  });
});

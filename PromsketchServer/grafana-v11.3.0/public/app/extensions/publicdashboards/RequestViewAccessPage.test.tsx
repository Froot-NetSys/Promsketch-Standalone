import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory, LocationState } from 'history';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { render } from 'test/test-utils';

import { selectors as e2eSelectors } from '@grafana/e2e-selectors/src';
import { setEchoSrv } from '@grafana/runtime';
import * as hooks from 'app/core/hooks/useQueryParams';
import { backendSrv } from 'app/core/services/backend_srv';
import { Echo } from 'app/core/services/echo/Echo';

import RequestViewAccessPage from './RequestViewAccessPage';
import {
  DEFAULT_BODY_TEXT,
  DEFAULT_ERROR_TITLE,
  EMAIL_SHARING_ACCESS_ERRORS,
  EMAIL_SHARING_MAGIC_LINK_ERRORS,
  ERROR_DESCRIPTION,
  getRequestAccessText,
} from './utils';

const server = setupServer();

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  getBackendSrv: () => backendSrv,
}));

beforeAll(() => {
  setEchoSrv(new Echo());
  server.listen({ onUnhandledRequest: 'bypass' });
});
afterEach(() => {
  jest.restoreAllMocks();
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

const selectors = e2eSelectors.pages.RequestViewAccess;

const renderPage = (historyState?: LocationState) => {
  const history = createMemoryHistory();
  const route = '/public-dashboards/:accessToken/request-access';
  history.push(route, historyState);

  return render(<RequestViewAccessPage />);
};

describe('RequestViewAccessPage', () => {
  it('disables submit button and changes its text after submitting valid email address', async () => {
    server.use(
      http.post('/api/public/dashboards/share/request-access', () =>
        HttpResponse.json({
          message: 'success',
        })
      )
    );

    renderPage();

    await userEvent.clear(screen.getByTestId(selectors.recipientInput));
    await userEvent.type(screen.getByTestId(selectors.recipientInput), 'email@example.com');
    await userEvent.click(screen.getByTestId(selectors.submitButton));

    const accessRequestedButton = await screen.findByRole('button', {
      name: 'Access requested',
    });

    expect(accessRequestedButton).toBeInTheDocument();
    expect(accessRequestedButton).toBeDisabled();
  });

  it('shows validation error when email is not valid', async () => {
    renderPage();

    await userEvent.clear(screen.getByTestId(selectors.recipientInput));
    await userEvent.type(screen.getByTestId(selectors.recipientInput), 'invalid.com');
    await userEvent.click(screen.getByTestId(selectors.submitButton));

    expect(screen.getByText('Invalid email')).toBeVisible();
  });

  it('shows validation error when email is not provided', async () => {
    renderPage();

    await userEvent.click(screen.getByTestId(selectors.submitButton));

    expect(screen.getByText('Email is required')).toBeVisible();
  });
});

describe('RequestViewAccessPage - Error messages', () => {
  it("shows error title and description when there's an error as query param", async () => {
    [...Object.values(EMAIL_SHARING_ACCESS_ERRORS), ...Object.values(EMAIL_SHARING_MAGIC_LINK_ERRORS)].forEach(
      (error) => {
        jest.spyOn(hooks, 'useQueryParams').mockImplementation(() => [{ error }, jest.fn()]);
        renderPage();

        const bodyText = getRequestAccessText(String(error));

        expect(screen.getAllByText(bodyText.title)[0]).toBeInTheDocument();
        expect(screen.getAllByText(bodyText.description)[0]).toBeInTheDocument();
      }
    );
  });
  it("shows default title and description when there's no error as query param", async () => {
    renderPage();

    const bodyText = DEFAULT_BODY_TEXT;

    expect(screen.getAllByText(bodyText.title)[0]).toBeInTheDocument();
    expect(screen.getAllByText(bodyText.description)[0]).toBeInTheDocument();
  });
  it("shows default error title and error description when there's a unknown error as query param", async () => {
    jest.spyOn(hooks, 'useQueryParams').mockImplementation(() => [{ error: 'unknownError' }, jest.fn()]);
    renderPage({ search: 'error=unknownError' });

    expect(screen.getAllByText(DEFAULT_ERROR_TITLE)[0]).toBeInTheDocument();
    expect(screen.getAllByText(ERROR_DESCRIPTION)[0]).toBeInTheDocument();
  });
});

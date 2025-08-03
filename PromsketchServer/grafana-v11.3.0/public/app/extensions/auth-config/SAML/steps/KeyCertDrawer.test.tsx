import userEvent from '@testing-library/user-event';
import { render, screen } from 'test/test-utils';

import { KeyCertDrawerUnconnected, Props } from "./KeyCertDrawer";

const defaultProps: Props = {
  onClose: jest.fn(),
  onGenerateCert: jest.fn(),
};

async function getTestContext(overrides: Partial<Props> = {}) {
  jest.clearAllMocks();

  const props = { ...defaultProps, ...overrides };
  render(<KeyCertDrawerUnconnected {...props} />);

  return {
    user: userEvent.setup()
  };
}

it('should render correctly', async () => {
  await getTestContext({});

  expect(screen.getByText(/Your organization/i)).toBeInTheDocument();
  expect(screen.getByText(/Country code/i)).toBeInTheDocument();
  expect(screen.getByText(/State/i)).toBeInTheDocument();
  expect(screen.getByText(/City/i)).toBeInTheDocument();
  expect(screen.getByText(/Validity days/i)).toBeInTheDocument();
});

it('show error if country code is invalid', async () => {
  const { user } = await getTestContext({});

  await user.type(screen.getByLabelText(/Country code/), 'Invalid');
  await user.click(screen.getByRole('button', {name: /^Generate/i}));

  expect(screen.getByText(/^Country code must have a length of 2 or 3 characters/i)).toBeInTheDocument();
});

it('show error if validity days is invalid', async () => {
  const { user } = await getTestContext({});

  await user.clear(screen.getByLabelText(/Validity days/));
  await user.type(screen.getByLabelText(/Validity days/), '0');
  await user.click(screen.getByRole('button', {name: /^Generate/i}));

  expect(screen.getByText(/^Validity days must be a positive integer between 1 and 10000/i)).toBeInTheDocument();
});

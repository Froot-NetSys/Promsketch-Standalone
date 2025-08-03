import { render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';

import { addQueryModal, QueryModal } from './QueryModal';
import { QueryModalBodyProps, QueryModalModel } from './types';

describe('QueryModal', () => {
  it('displays the query modal', async () => {
    const createRecordedQuery: React.FC<QueryModalBodyProps> = ({}) => {
      return <div>Hello world</div>;
    };
    const recordedQueryCreateModal: QueryModalModel = {
      title: 'Create recorded query',
      body: createRecordedQuery,
    };
    addQueryModal('modalKey', recordedQueryCreateModal);
    const props = {
      isOpen: true,
      modalKey: 'modalKey',
      onDismiss: () => {},
    };
    render(<QueryModal {...props} />);

    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeVisible();
    });
  });
});

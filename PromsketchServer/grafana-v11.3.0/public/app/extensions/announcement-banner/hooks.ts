import { useCallback } from 'react';

import {
  useCreateAnnouncementBannerMutation,
  useListAnnouncementBannerQuery,
  useUpdateAnnouncementBannerMutation,
} from './api';
import { AnnouncementBannerSpec } from './api/types';

export function useCreateOrUpdateBanner(name?: string) {
  const [create, createRequest] = useCreateAnnouncementBannerMutation();
  const [update, updateRequest] = useUpdateAnnouncementBannerMutation();

  const updateOrCreate = useCallback(
    (data: AnnouncementBannerSpec) => {
      if (name) {
        return update({ name, body: { metadata: { name }, spec: data } });
      }
      return create({ metadata: { generateName: 'banner' }, spec: data });
    },
    [create, name, update]
  );
  return [updateOrCreate, name ? updateRequest : createRequest] as const;
}

interface Banner {
  spec: AnnouncementBannerSpec;
  metadata: { name: string };
}

export function useBanner(): [Banner | undefined, boolean] {
  const query = useListAnnouncementBannerQuery();
  return [query.data?.items?.at(-1), query.isLoading];
}

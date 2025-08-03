import { Resource, ResourceForCreate, ResourceList } from 'app/features/apiserver/types';

import { baseAPI as api } from './baseAPI';
import { RequestArg, AnnouncementBannerSpec, UpdateRequestArg } from './types';

const BASE_PATH = '/announcement-banners';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listAnnouncementBanner: build.query<ResourceList<AnnouncementBannerSpec>, void>({
      query: () => ({
        url: BASE_PATH,
      }),
      providesTags: ['AnnouncementBannerList'],
    }),
    createAnnouncementBanner: build.mutation<void, ResourceForCreate<AnnouncementBannerSpec>>({
      query: (resource) => ({
        url: BASE_PATH,
        method: 'POST',
        body: resource,
      }),
      invalidatesTags: ['AnnouncementBannerList'],
    }),
    getAnnouncementBanner: build.query<Resource<AnnouncementBannerSpec>, RequestArg>({
      query: (queryArg) => ({ url: `${BASE_PATH}/${queryArg.name}` }),
    }),
    deleteAnnouncementBanner: build.mutation<unknown, RequestArg>({
      query: (queryArg) => ({
        url: `${BASE_PATH}/${queryArg.name}`,
        method: 'DELETE',
      }),
    }),
    updateAnnouncementBanner: build.mutation<
      Resource<AnnouncementBannerSpec>,
      UpdateRequestArg<AnnouncementBannerSpec>
    >({
      query: (queryArg) => ({
        url: `${BASE_PATH}/${queryArg.name}`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/merge-patch+json' },
        body: JSON.stringify(queryArg.body),
      }),
      invalidatesTags: ['AnnouncementBannerList'],
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as generatedAPI };

export const {
  useListAnnouncementBannerQuery,
  useCreateAnnouncementBannerMutation,
  useGetAnnouncementBannerQuery,
  useDeleteAnnouncementBannerMutation,
  useUpdateAnnouncementBannerMutation,
} = injectedRtkApi;

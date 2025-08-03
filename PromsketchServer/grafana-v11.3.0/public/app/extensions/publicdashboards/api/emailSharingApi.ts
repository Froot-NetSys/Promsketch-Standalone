import { config, FetchError, isFetchError } from '@grafana/runtime';
import { notifyApp } from 'app/core/actions';
import { createSuccessNotification } from 'app/core/copy/appNotification';
import { t } from 'app/core/internationalization';
import { publicDashboardApi } from 'app/features/dashboard/api/publicDashboardApi';
import {
  SessionDashboard,
  SessionUser,
} from 'app/features/dashboard/components/ShareModal/SharePublicDashboard/SharePublicDashboardUtils';

import { EMAIL_SHARING_MAGIC_LINK_ERRORS } from '../utils';

function isFetchBaseQueryError(error: unknown): error is { error: FetchError } {
  return typeof error === 'object' && error != null && 'error' in error;
}

function isKnownFetchError(error: unknown): error is { error: FetchError } {
  return isFetchBaseQueryError(error) && isFetchError(error.error);
}

const emailSharingApi = publicDashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    requestAccess: builder.mutation<void, { email: string; accessToken: string }>({
      query: (params) => ({
        url: '/public/dashboards/share/request-access',
        method: 'POST',
        data: params,
      }),
    }),
    confirmAccess: builder.mutation<{ error?: string }, { magicLinkToken: string; accessToken: string }>({
      query: ({ magicLinkToken, accessToken }) => ({
        url: `/public/dashboards/share/${magicLinkToken}`,
        method: 'POST',
      }),
      async onQueryStarted({ accessToken }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            notifyApp(
              createSuccessNotification(t('public-dashboard.email-sharing.success-confirm-access', 'Access confirmed!'))
            )
          );
          window.location.assign(config.appSubUrl + `public-dashboards/${accessToken}`);
        } catch (e) {
          if (isKnownFetchError(e)) {
            const {
              data: { messageId },
            } = e.error;
            if (messageId && Object.values(EMAIL_SHARING_MAGIC_LINK_ERRORS).includes(messageId)) {
              window.location.assign(
                config.appSubUrl + `public-dashboards/${accessToken}/request-access?error=${messageId}`
              );
            }
          }
        }
      },
    }),
    addRecipient: builder.mutation<void, { recipient: string; dashboardUid: string; uid: string }>({
      query: ({ recipient, uid }) => ({
        url: `/public-dashboards/${uid}/share/recipients`,
        method: 'POST',
        data: { recipient },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          notifyApp(
            createSuccessNotification(
              t(
                'public-dashboard.email-sharing.success-send-recipient-invitation',
                'The email invitation has been sent.'
              )
            )
          )
        );
      },
      invalidatesTags: (result, error, { dashboardUid }) => [{ type: 'PublicDashboard', id: dashboardUid }],
    }),
    deleteRecipient: builder.mutation<
      void,
      { recipientUid: string; recipientEmail: string; dashboardUid: string; uid: string }
    >({
      query: ({ uid, recipientUid }) => ({
        url: `/public-dashboards/${uid}/share/recipients/${recipientUid}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ recipientEmail }, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          notifyApp(
            createSuccessNotification(
              t('public-dashboard.email-sharing.success-revoke-access-title', 'Access Revoked'),
              t(
                'public-dashboard.email-sharing.success-revoke-access-description',
                'You have successfully revoked access for {{recipientEmail}}.',
                { recipientEmail }
              )
            )
          )
        );
      },
      invalidatesTags: (result, error, { dashboardUid }) => [
        { type: 'PublicDashboard', id: dashboardUid },
        'UsersWithActiveSessions',
        'ActiveUserDashboards',
      ],
    }),
    reshareAccessToRecipient: builder.mutation<void, { recipientUid: string; uid: string }>({
      query: ({ uid, recipientUid }) => ({
        url: `/public-dashboards/${uid}/share/recipients/${recipientUid}`,
        method: 'PATCH',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          notifyApp(
            createSuccessNotification(
              t(
                'public-dashboard.email-sharing.success-resend-recipient-invitation',
                'The email invitation has been resent.'
              )
            )
          )
        );
      },
    }),
    getActiveUsers: builder.query<SessionUser[], void>({
      query: () => ({
        url: '/public-dashboards/share/users?status=active',
      }),
      providesTags: ['UsersWithActiveSessions'],
    }),
    getActiveUserDashboards: builder.query<SessionDashboard[], string>({
      query: (email) => ({
        url: `/public-dashboards/share/users/${email}/dashboards?status=active`,
      }),
      providesTags: (result, _, email) => [{ type: 'ActiveUserDashboards', id: email }],
    }),
    revokeAllAccess: builder.mutation<void, { email: string }>({
      query: ({ email }) => ({
        url: `/public-dashboards/share/users/${email}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ email }, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          notifyApp(
            createSuccessNotification(
              t('public-dashboard.email-sharing.success-revoke-all-accesses-title', 'Access Revoked'),
              t(
                'public-dashboard.email-sharing.success-revoke-all-accesses-description',
                "{{email}}'s access to all public dashboards has been successfully removed.",
                { email }
              )
            )
          )
        );
      },
      invalidatesTags: ['UsersWithActiveSessions'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useRequestAccessMutation,
  useGetActiveUserDashboardsQuery,
  useGetActiveUsersQuery,
  useConfirmAccessMutation,
} = emailSharingApi;

export default emailSharingApi;

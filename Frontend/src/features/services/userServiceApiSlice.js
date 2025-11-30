/**
 * user API Slice
 * Matches: Backend-Microservices/services/user
 * Port: 3001
 * Handles: Users, Authentication, Sessions
 */
import { apiSlice } from '../../app/api/apiSlice';

export const userServiceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Authentication
    login: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    verifyLoginOTP: builder.mutation({
      query: (data) => ({
        url: '/users/verify-login-otp',
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // User Profile
    getProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/users/change-password',
        method: 'PUT',
        body: data,
      }),
    }),
    
    // 2FA
    enable2FA: builder.mutation({
      query: () => ({
        url: '/users/enable-2fa',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    disable2FA: builder.mutation({
      query: (data) => ({
        url: '/users/disable-2fa',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    
    // User Management (Admin)
    getAllUsers: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/users',
        params: { page, limit },
      }),
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateUserById: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),
    activateUserById: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/activate`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }, 'User'],
    }),
    deactivateUserById: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/deactivate`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }, 'User'],
    }),
    deleteUserById: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    getUserStats: builder.query({
      query: () => '/users/stats',
      providesTags: ['Stats'],
    }),
    getDoctors: builder.query({
      query: ({ page = 1, limit = 100 }) => ({
        url: '/users/doctors',
        params: { page, limit },
      }),
      providesTags: ['User'],
    }),
    
    // Session Management (Authentication Sessions)
    refreshToken: builder.mutation({
      query: () => ({
        url: '/session/refresh',
        method: 'POST',
        credentials: 'include',
      }),
    }),
    updateActivity: builder.mutation({
      query: () => ({
        url: '/session/activity',
        method: 'POST',
        credentials: 'include',
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/session/logout',
        method: 'POST',
        credentials: 'include',
      }),
    }),
    getSessionInfo: builder.query({
      query: () => ({
        url: '/session/info',
        credentials: 'include',
      }),
    }),
    
    // Patient Visit Sessions
    createSession: builder.mutation({
      query: (sessionData) => ({
        url: '/sessions',
        method: 'POST',
        body: sessionData,
      }),
      invalidatesTags: ['PatientVisit'],
    }),
    getPatientSessions: builder.query({
      query: (patientId) => `/sessions/patient/${patientId}`,
      providesTags: (result, error, patientId) => [
        { type: 'PatientVisit', id: patientId },
        'PatientVisit',
      ],
    }),
    getSessionById: builder.query({
      query: (id) => `/sessions/${id}`,
      providesTags: (result, error, id) => [{ type: 'PatientVisit', id }],
    }),
    updateSession: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/sessions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'PatientVisit', id }, 'PatientVisit'],
    }),
    deleteSession: builder.mutation({
      query: (id) => ({
        url: `/sessions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PatientVisit'],
    }),
    completeSession: builder.mutation({
      query: ({ patientId, visitDate }) => ({
        url: `/sessions/patient/${patientId}/complete`,
        method: 'POST',
        body: { visit_date: visitDate },
      }),
      invalidatesTags: (result, error, { patientId }) => [
        { type: 'PatientVisit', id: patientId },
        'PatientVisit',
      ],
    }),
  }),
});

export const {
  // Authentication
  useLoginMutation,
  useVerifyLoginOTPMutation,
  useRegisterMutation,
  // Profile
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  // 2FA
  useEnable2FAMutation,
  useDisable2FAMutation,
  // User Management
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useActivateUserByIdMutation,
  useDeactivateUserByIdMutation,
  useDeleteUserByIdMutation,
  useGetUserStatsQuery,
  useGetDoctorsQuery,
  // Session Management
  useRefreshTokenMutation,
  useUpdateActivityMutation,
  useLogoutMutation,
  useGetSessionInfoQuery,
  // Patient Visit Sessions
  useCreateSessionMutation,
  useGetPatientSessionsQuery,
  useGetSessionByIdQuery,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useCompleteSessionMutation,
} = userServiceApiSlice;


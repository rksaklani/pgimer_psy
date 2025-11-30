/**
 * out-patient-intake-record-service API Slice
 * Matches: Backend-Microservices/services/out-patient-intake-record-service
 * Port: 3004
 * Handles: Outpatient Intake Records
 */
import { apiSlice } from '../../app/api/apiSlice';

export const intakeRecordServiceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all intake records
    getAllIntakeRecords: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/outpatient-intake-records',
        params: { page, limit, ...filters },
      }),
      providesTags: ['IntakeRecord'],
    }),
    
    // Get intake record by ID
    getIntakeRecordById: builder.query({
      query: (id) => `/outpatient-intake-records/${id}`,
      providesTags: (result, error, id) => [{ type: 'IntakeRecord', id }],
    }),
    
    // Get intake records by patient ID
    getIntakeRecordsByPatientId: builder.query({
      query: (patientId) => `/outpatient-intake-records/patient/${patientId}`,
      providesTags: (result, error, patientId) => [{ type: 'IntakeRecord', id: `patient-${patientId}` }],
    }),
    
    // Create intake record
    createIntakeRecord: builder.mutation({
      query: (data) => ({
        url: '/outpatient-intake-records',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['IntakeRecord', 'Stats'],
    }),
    
    // Update intake record
    updateIntakeRecord: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/outpatient-intake-records/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'IntakeRecord', id }, 'IntakeRecord'],
    }),
    
    // Get active intake records
    getActiveIntakeRecords: builder.query({
      query: () => '/outpatient-intake-records/active',
      providesTags: ['IntakeRecord'],
    }),
    
    // Get intake records statistics
    getIntakeRecordStats: builder.query({
      query: () => '/outpatient-intake-records/stats',
      providesTags: ['Stats'],
    }),
    
    // Get files by status
    getIntakeRecordsByStatus: builder.query({
      query: () => '/outpatient-intake-records/status-stats',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useGetAllIntakeRecordsQuery,
  useGetIntakeRecordByIdQuery,
  useGetIntakeRecordsByPatientIdQuery,
  useCreateIntakeRecordMutation,
  useUpdateIntakeRecordMutation,
  useGetActiveIntakeRecordsQuery,
  useGetIntakeRecordStatsQuery,
  useGetIntakeRecordsByStatusQuery,
} = intakeRecordServiceApiSlice;


/**
 * adult-walk-in-clinical-performa API Slice
 * Matches: Backend-Microservices/services/adult-walk-in-clinical-performa
 * Port: 3003
 * Handles: Clinical Proformas, Clinical Options
 */
import { apiSlice } from '../../app/api/apiSlice';

export const clinicalPerformaServiceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Clinical Options
    getClinicalOptions: builder.query({
      query: (group) => `/clinical-proformas/options/${group}`,
      providesTags: (result, error, group) => [{ type: 'ClinicalOptions', id: group }],
      transformResponse: (resp) => resp?.data?.options || [],
    }),
    addClinicalOption: builder.mutation({
      query: ({ group, label }) => ({
        url: `/clinical-proformas/options/${group}`,
        method: 'POST',
        body: { label },
      }),
      invalidatesTags: (result, error, { group }) => [{ type: 'ClinicalOptions', id: group }],
    }),
    deleteClinicalOption: builder.mutation({
      query: ({ group, label }) => ({
        url: `/clinical-proformas/options/${group}`,
        method: 'DELETE',
        body: { label },
      }),
      invalidatesTags: (result, error, { group }) => [{ type: 'ClinicalOptions', id: group }],
    }),

    // Clinical Proformas
    getAllClinicalProformas: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/clinical-proformas',
        params: { page, limit, ...filters },
      }),
      providesTags: ['Clinical'],
    }),
    getClinicalProformaById: builder.query({
      query: (id) => `/clinical-proformas/${id}`,
      providesTags: (result, error, id) => [{ type: 'Clinical', id }],
    }),
    getClinicalProformaByPatientId: builder.query({
      query: (patientId) => `/clinical-proformas/patient/${patientId}`,
      providesTags: (result, error, patientId) => [
        { type: 'Clinical', id: `patient-${patientId}` },
        'Clinical',
      ],
    }),
    createClinicalProforma: builder.mutation({
      query: (proformaData) => ({
        url: '/clinical-proformas',
        method: 'POST',
        body: proformaData,
      }),
      invalidatesTags: ['Clinical', 'Stats'],
    }),
    updateClinicalProforma: builder.mutation({
      query: ({ id, ...proformaData }) => ({
        url: `/clinical-proformas/${id}`,
        method: 'PUT',
        body: proformaData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Clinical', id }, 'Clinical'],
    }),
    deleteClinicalProforma: builder.mutation({
      query: (id) => ({
        url: `/clinical-proformas/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clinical'],
    }),
    getClinicalStats: builder.query({
      query: () => '/clinical-proformas/stats',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  // Clinical Options
  useGetClinicalOptionsQuery,
  useAddClinicalOptionMutation,
  useDeleteClinicalOptionMutation,
  // Clinical Proformas
  useGetAllClinicalProformasQuery,
  useGetClinicalProformaByIdQuery,
  useGetClinicalProformaByPatientIdQuery,
  useCreateClinicalProformaMutation,
  useUpdateClinicalProformaMutation,
  useDeleteClinicalProformaMutation,
  useGetClinicalStatsQuery,
} = clinicalPerformaServiceApiSlice;


/**
 * prescription API Slice
 * Matches: Backend-Microservices/services/prescription
 * Port: 3005
 * Handles: Prescriptions
 */
import { apiSlice } from '../../app/api/apiSlice';

export const prescriptionServiceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPrescriptions: builder.query({
      query: ({ page = 1, limit = 10, patient_id, clinical_proforma_id, doctor_decision } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (patient_id) params.append('patient_id', patient_id);
        if (clinical_proforma_id) params.append('clinical_proforma_id', clinical_proforma_id);
        if (doctor_decision) params.append('doctor_decision', doctor_decision);
        return `/prescriptions?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.prescriptions.map(({ id }) => ({ type: 'Prescription', id })),
              { type: 'Prescription', id: 'LIST' },
            ]
          : [{ type: 'Prescription', id: 'LIST' }],
    }),
    getPrescriptionById: builder.query({
      query: ({ id, clinical_proforma_id }) => {
        if (clinical_proforma_id && !id) {
          return `/prescriptions/by-proforma/${clinical_proforma_id}`;
        }
        const params = new URLSearchParams();
        if (clinical_proforma_id) {
          params.append('clinical_proforma_id', clinical_proforma_id);
        }
        const queryString = params.toString();
        return `/prescriptions/${id || 1}${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result, error, { id, clinical_proforma_id }) => [
        { type: 'Prescription', id },
        { type: 'Prescription', id: `proforma-${clinical_proforma_id}` },
        'Prescription',
      ],
    }),
    createPrescription: builder.mutation({
      query: (prescriptionData) => ({
        url: '/prescriptions',
        method: 'POST',
        body: prescriptionData,
      }),
      invalidatesTags: (result, error, { clinical_proforma_id }) => [
        { type: 'Prescription', id: `proforma-${clinical_proforma_id}` },
        'Prescription',
      ],
    }),
    updatePrescription: builder.mutation({
      query: ({ id, clinical_proforma_id, ...data }) => {
        const prescriptionId = id || (clinical_proforma_id ? 1 : null);
        if (!prescriptionId) {
          throw new Error('Either id or clinical_proforma_id is required');
        }
        return {
          url: `/prescriptions/${prescriptionId}`,
          method: 'PUT',
          body: { ...data, clinical_proforma_id },
        };
      },
      invalidatesTags: (result, error, { id, clinical_proforma_id }) => [
        { type: 'Prescription', id },
        { type: 'Prescription', id: `proforma-${clinical_proforma_id}` },
        'Prescription'
      ],
    }),
    deletePrescription: builder.mutation({
      query: (id) => ({
        url: `/prescriptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Prescription'],
    }),
  }),
});

export const {
  useGetAllPrescriptionsQuery,
  useGetPrescriptionByIdQuery,
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
  useDeletePrescriptionMutation,
} = prescriptionServiceApiSlice;


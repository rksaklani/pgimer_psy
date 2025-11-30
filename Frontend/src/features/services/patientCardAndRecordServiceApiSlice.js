/**
 * out-patients-card-and-out-patient-record API Slice
 * Matches: Backend-Microservices/services/out-patients-card-and-out-patient-record
 * Port: 3002
 * Handles: Patient Cards, Patient Records, Patient Files
 */
import { apiSlice } from '../../app/api/apiSlice';

export const patientCardAndRecordServiceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ========== Patient Cards (OutPatientsCard) ==========
    getAllPatientCards: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/patient-cards',
        params: { page, limit, ...filters },
      }),
      providesTags: ['PatientCard'],
    }),
    getPatientCardByCRNo: builder.query({
      query: (cr_no) => `/patient-cards/cr/${cr_no}`,
      providesTags: (result, error, cr_no) => [{ type: 'PatientCard', id: cr_no }],
    }),
    createPatientCard: builder.mutation({
      query: (cardData) => ({
        url: '/patient-cards',
        method: 'POST',
        body: cardData,
      }),
      invalidatesTags: ['PatientCard', 'Stats'],
    }),
    updatePatientCard: builder.mutation({
      query: ({ cr_no, ...cardData }) => ({
        url: `/patient-cards/${cr_no}`,
        method: 'PUT',
        body: cardData,
      }),
      invalidatesTags: (result, error, { cr_no }) => [
        { type: 'PatientCard', id: cr_no },
        'PatientCard',
      ],
    }),

    // ========== Patient Records (OutPatientRecord) ==========
    getAllPatientRecords: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/out-patient-records',
        params: { page, limit, ...filters },
      }),
      providesTags: ['PatientRecord'],
    }),
    getPatientRecordById: builder.query({
      query: (id) => `/out-patient-records/${id}`,
      providesTags: (result, error, id) => [{ type: 'PatientRecord', id }],
    }),
    getPatientRecordByCRNo: builder.query({
      query: (cr_no) => `/out-patient-records/cr/${cr_no}`,
      providesTags: (result, error, cr_no) => [{ type: 'PatientRecord', id: cr_no }],
    }),
    createPatientRecord: builder.mutation({
      query: (recordData) => ({
        url: '/out-patient-records',
        method: 'POST',
        body: recordData,
      }),
      invalidatesTags: ['PatientRecord', 'Stats'],
    }),
    updatePatientRecord: builder.mutation({
      query: ({ id, ...recordData }) => ({
        url: `/out-patient-records/${id}`,
        method: 'PUT',
        body: recordData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PatientRecord', id },
        'PatientRecord',
      ],
    }),
    getPatientRecordProfile: builder.query({
      query: (id) => `/out-patient-records/${id}/profile`,
      providesTags: (result, error, id) => [
        { type: 'PatientRecord', id },
        'PatientRecord',
      ],
    }),
    getPatientVisitCount: builder.query({
      query: (patientId) => `/out-patient-records/${patientId}/visits/count`,
      providesTags: (result, error, patientId) => [
        { type: 'PatientRecord', id: patientId },
        { type: 'PatientVisit', id: patientId }
      ],
    }),
    getPatientVisitHistory: builder.query({
      query: (patientId) => `/out-patient-records/${patientId}/visits`,
      providesTags: (result, error, patientId) => [
        { type: 'PatientRecord', id: patientId },
        { type: 'PatientVisit', id: patientId }
      ],
    }),
    getPatientClinicalRecords: builder.query({
      query: (patientId) => `/out-patient-records/${patientId}/clinical-records`,
      providesTags: (result, error, patientId) => [
        { type: 'PatientRecord', id: patientId },
        'Clinical',
      ],
    }),
    getPatientIntakeRecords: builder.query({
      query: (patientId) => `/out-patient-records/${patientId}/intake-records`,
      providesTags: (result, error, patientId) => [
        { type: 'PatientRecord', id: patientId },
        'ADL',
      ],
    }),
    assignPatient: builder.mutation({
      query: (payload) => ({
        url: '/out-patient-records/assign',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['PatientRecord'],
    }),
    markVisitCompleted: builder.mutation({
      query: ({ patient_id, visit_date }) => ({
        url: `/out-patient-records/${patient_id}/visits/complete`,
        method: 'POST',
        body: visit_date ? { visit_date } : {},
      }),
      invalidatesTags: (result, error, { patient_id }) => [
        { type: 'PatientRecord', id: patient_id },
        { type: 'PatientRecord', id: 'LIST' },
        { type: 'PatientVisit', id: patient_id },
      ],
    }),

    // ========== Patient Files ==========
    getPatientFiles: builder.query({
      query: (patient_id) => `/patient-files/${patient_id}`,
      providesTags: (result, error, patient_id) => [
        { type: 'PatientFile', id: patient_id },
        { type: 'PatientFile', id: 'LIST' }
      ],
    }),
    createPatientFiles: builder.mutation({
      queryFn: async ({ patient_id, user_id, files }, _queryApi, _extraOptions, fetchWithBQ) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('attachments[]', file);
        });
        formData.append('patient_id', patient_id);
        if (user_id) {
          formData.append('user_id', user_id);
        }

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = JSON.parse(localStorage.getItem('user'))?.token || localStorage.getItem('token');

        try {
          const response = await fetch(`${baseUrl}/patient-files/create`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          const data = await response.json();
          if (!response.ok) {
            return { error: { status: response.status, data } };
          }
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (result, error, { patient_id }) => [
        { type: 'PatientFile', id: patient_id },
        { type: 'PatientFile', id: 'LIST' },
        { type: 'PatientRecord', id: patient_id }
      ],
    }),
    updatePatientFiles: builder.mutation({
      queryFn: async ({ patient_id, files, files_to_remove }, _queryApi, _extraOptions, fetchWithBQ) => {
        const formData = new FormData();
        if (files && files.length > 0) {
          files.forEach((file) => {
            formData.append('attachments[]', file);
          });
        }
        if (files_to_remove && files_to_remove.length > 0) {
          files_to_remove.forEach((filePath) => {
            formData.append('files_to_remove[]', filePath);
          });
        }

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = JSON.parse(localStorage.getItem('user'))?.token || localStorage.getItem('token');

        try {
          const response = await fetch(`${baseUrl}/patient-files/update/${patient_id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          const data = await response.json();
          if (!response.ok) {
            return { error: { status: response.status, data } };
          }
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (result, error, { patient_id }) => [
        { type: 'PatientFile', id: patient_id },
        { type: 'PatientFile', id: 'LIST' },
        { type: 'PatientRecord', id: patient_id }
      ],
    }),
    deletePatientFile: builder.mutation({
      query: ({ patient_id, file_path }) => ({
        url: `/patient-files/delete/${patient_id}/${encodeURIComponent(file_path)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { patient_id }) => [
        { type: 'PatientFile', id: patient_id },
        { type: 'PatientFile', id: 'LIST' },
        { type: 'PatientRecord', id: patient_id }
      ],
    }),
    getFileStats: builder.query({
      query: () => '/patient-files/stats',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  // Patient Cards
  useGetAllPatientCardsQuery,
  useGetPatientCardByCRNoQuery,
  useCreatePatientCardMutation,
  useUpdatePatientCardMutation,
  // Patient Records
  useGetAllPatientRecordsQuery,
  useGetPatientRecordByIdQuery,
  useGetPatientRecordByCRNoQuery,
  useCreatePatientRecordMutation,
  useUpdatePatientRecordMutation,
  useGetPatientRecordProfileQuery,
  useGetPatientVisitCountQuery,
  useGetPatientVisitHistoryQuery,
  useGetPatientClinicalRecordsQuery,
  useGetPatientIntakeRecordsQuery,
  useAssignPatientMutation,
  useMarkVisitCompletedMutation,
  // Patient Files
  useGetPatientFilesQuery,
  useCreatePatientFilesMutation,
  useUpdatePatientFilesMutation,
  useDeletePatientFileMutation,
  useGetFileStatsQuery,
} = patientCardAndRecordServiceApiSlice;


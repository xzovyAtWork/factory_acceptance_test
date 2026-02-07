import { useApiClient } from './client';

export function useFormsApi() {
  const client = useApiClient();

  return {
    async listForms() {
      const res = await client.get('/forms');
      return res.data;
    },
    async getForm(id) {
      const res = await client.get(`/forms/${id}`);
      return res.data;
    },
    async createForm(payload) {
      const res = await client.post('/forms', payload);
      return res.data;
    },
    async signOn(formId) {
      const res = await client.post(`/forms/${formId}/signon`);
      return res.data;
    },
    async updateTestPoint(formId, pointId, payload) {
      const res = await client.patch(`/forms/${formId}/test-points/${pointId}`, payload);
      return res.data;
    },
    async signOff(formId, payload) {
      const res = await client.post(`/forms/${formId}/signoff`, payload);
      return res.data;
    },
    pdfUrl(formId) {
      return `/api/pdf/forms/${formId}`;
    }
  };
}
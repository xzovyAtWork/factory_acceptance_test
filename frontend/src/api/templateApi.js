import { useApiClient } from './client';

export function useTemplateApi() {
  const client = useApiClient();

  return {
    async listTemplates() {
      const res = await client.get('/templates');
      return res.data;
    },
    async getTemplate(id) {
      const res = await client.get(`/templates/${id}`);
      return res.data;
    },
    async createTemplate(payload) {
      const res = await client.post('/templates', payload);
      return res.data;
    },
    async updateTemplate(id, payload) {
      const res = await client.put(`/templates/${id}`, payload);
      return res.data;
    }
  };
}
import { useApiClient } from './client';

export function useWikiApi() {
  const client = useApiClient();

  return {
    async listPages() {
      const res = await client.get('/wiki');
      return res.data;
    },
    async getBySlug(slug) {
      const res = await client.get(`/wiki/${slug}`);
      return res.data;
    },
    async createPage(payload) {
      const res = await client.post('/wiki', payload);
      return res.data;
    },
    async updatePage(id, payload) {
      const res = await client.put(`/wiki/${id}`, payload);
      return res.data;
    },
    async deletePage(id) {
      const res = await client.delete(`/wiki/${id}`);
      return res.data;
    }
  };
}
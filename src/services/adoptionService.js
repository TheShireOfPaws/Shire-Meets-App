import api from './api';

export async function create(request) {
  const { data } = await api.post('/api/adoption-requests', request);
  return data;
}

import api from './api';

// Pila de tarjetas: siempre solo perros disponibles. Los filtros vacíos no se envían.
export async function getAvailable({ page = 0, pageSize = 20, size, gender } = {}) {
  const params = { status: 'AVAILABLE', page, pageSize };
  if (size) params.size = size;
  if (gender) params.gender = gender;

  const { data } = await api.get('/api/dogs/filter', { params });
  return data;
}

export async function getById(id) {
  const { data } = await api.get(`/api/dogs/${id}`);
  return data;
}

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

export default {
  getNodes: () => api.get('/nodes'),
  getNode: (id) => api.get(`/nodes/${id}`),
  createNode: (node) => api.post('/nodes', node),
  updateNode: (id, node) => api.patch(`/nodes/${id}`, node),
  deleteNode: (id) => api.delete(`/nodes/${id}`),
  getEdges: () => api.get('/edges'),
  createEdge: (edge) => api.post('/edges', edge),
  // Add other API calls as needed
};
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default {
  getNodes: () => api.get('/nodes'),
  getNode: (id) => api.get(`/nodes/${id}`),
  createNode: (node) => api.post('/nodes', node),
  updateNode: (id, node) => api.patch(`/nodes/${id}`, node),
  updateNodePosition: (id, position) => api.patch(`/nodes/${id}/position`, position),
  deleteNode: (id) => api.delete(`/nodes/${id}`),
  deleteEdges: (nodeId) => api.delete(`/edges?nodeId=${nodeId}`),
  getEdges: () => api.get('/edges'),
  createEdge: (edge) => api.post('/edges', edge),
  deleteEdge: (id) => api.delete(`/edges/${id}`),
  getFiles: () => api.get('/files'),
  getFile: (id) => api.get(`/files/${id}`),
  createFile: (name) => api.post('/files', { name }),
  updateFile: (fileId, fileData) => api.patch(`/files/${fileId}`, fileData),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
  addNodeToFile: (fileId, nodeId) => api.post(`/files/${fileId}/nodes`, { nodeId }),
  removeNodeFromFile: (fileId, nodeId) => api.delete(`/files/${fileId}/nodes/${nodeId}`),
  // Add other API calls as needed
};

api.interceptors.request.use(config => {
  console.log('Outgoing Request to:', {
    method: config.method.toUpperCase(),
    url: config.url,
    data: config.data
  });
  return config;
});

api.interceptors.response.use(response => {
  console.log('Incoming Response from:', {
    status: response.status,
    url: response.config.url,
    data: response.data
  });
  return response;
}, error => {
  console.error('API Error:', {
    url: error.config?.url,
    status: error.response?.status,
    message: error.message
  });
  return Promise.reject(error);
});

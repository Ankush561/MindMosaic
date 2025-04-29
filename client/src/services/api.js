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
  deleteNode: (id) => api.delete(`/nodes/${id}`),
  getEdges: () => api.get('/edges'),
  createEdge: (edge) => api.post('/edges', edge),
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

// api.interceptors.request.use(request => {
//   console.log('Starting Request', request);
//   return request;
// });

// api.interceptors.response.use(response => {
//   console.log('Response:', response);
//   return response;
// }, error => {
//   console.error('API Error:', error);
//   return Promise.reject(error);
// });
const handleSave = async (nodeData) => {
  console.group('Saving Node');
  try {
    console.log('Payload:', nodeData);
    const response = nodeData._id 
      ? await api.updateNode(nodeData._id, nodeData)
      : await api.createNode(nodeData);
    
    console.log('Save successful:', response.data);
    await fetchData();
    return true;
  } catch (err) {
    console.error('Save failed:', {
      error: err,
      config: err.config,
      response: err.response
    });
    return false;
  } finally {
    console.groupEnd();
    setSelectedNode(null);
    setIsCreating(false);
  }
};

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT token into all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (name, email, password, role) => {
    const response = await API.post('/auth/register', { name, email, password, role });
    return response.data;
  },
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await API.get('/auth/profile');
    return response.data;
  }
};

export const propertyAPI = {
  getAll: async (filters = {}) => {
    const response = await API.get('/properties', { params: filters });
    return response.data;
  },
  getById: async (id) => {
    const response = await API.get(`/properties/${id}`);
    return response.data;
  },
  create: async (propertyData) => {
    const response = await API.post('/properties', propertyData);
    return response.data;
  },
  update: async (id, propertyData) => {
    const response = await API.put(`/properties/${id}`, propertyData);
    return response.data;
  },
  delete: async (id) => {
    const response = await API.delete(`/properties/${id}`);
    return response.data;
  }
};

export const bookingAPI = {
  create: async (bookingData) => {
    const response = await API.post('/bookings', bookingData);
    return response.data;
  },
  getAll: async () => {
    const response = await API.get('/bookings');
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await API.put(`/bookings/${id}/status`, { status });
    return response.data;
  }
};

export const questionAPI = {
  getByProperty: async (propertyId) => {
    const response = await API.get(`/questions/property/${propertyId}`);
    return response.data;
  },
  create: async (questionData) => {
    const response = await API.post('/questions', questionData);
    return response.data;
  },
  answer: async (id, answer) => {
    const response = await API.put(`/questions/${id}/answer`, { answer });
    return response.data;
  },
  delete: async (id) => {
    const response = await API.delete(`/questions/${id}`);
    return response.data;
  }
};

export const adminAPI = {
  getStats: async () => {
    const response = await API.get('/admin/stats');
    return response.data;
  },
  getUsers: async () => {
    const response = await API.get('/admin/users');
    return response.data;
  },
  updateUserRole: async (id, role) => {
    const response = await API.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await API.delete(`/admin/users/${id}`);
    return response.data;
  }
};

export const imageAPI = {
  // Upload expects the propertyId (to associate the image) and the file itself
  upload: async (propertyId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    // Include propertyId so the backend knows which property to link
    formData.append('propertyId', propertyId);

    const response = await API.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default API;

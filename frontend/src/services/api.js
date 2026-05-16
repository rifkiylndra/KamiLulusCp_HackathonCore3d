const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // SPPG
  SPPG_LIST: `${API_BASE_URL}/api/sppg`,
  SPPG_CREATE: `${API_BASE_URL}/api/sppg`,
  
  // Meal Submissions
  SUBMISSIONS_CREATE: `${API_BASE_URL}/api/submissions`,
  SUBMISSIONS_LIST: `${API_BASE_URL}/api/submissions`,
  SUBMISSIONS_DETAIL: (id) => `${API_BASE_URL}/api/submissions/${id}`,
  SUBMISSIONS_STATUS: (id) => `${API_BASE_URL}/api/submissions/${id}/status`,
  
  // Dashboard
  DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard/stats`,
  DASHBOARD_RECENT: `${API_BASE_URL}/api/dashboard/recent-sppg`,
};

// Fetch SPPG list
export const fetchSppgList = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.SPPG_LIST);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching SPPG:', error);
    return [];
  }
};

// Submit meal
export const submitMeal = async (formData) => {
  try {
    const response = await fetch(API_ENDPOINTS.SUBMISSIONS_CREATE, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to submit meal');
    }
  } catch (error) {
    console.error('Error submitting meal:', error);
    throw error;
  }
};

// Get submission status
export const getSubmissionStatus = async (id) => {
  try {
    const response = await fetch(API_ENDPOINTS.SUBMISSIONS_STATUS(id));
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching submission status:', error);
    throw error;
  }
};

// Get dashboard stats
export const fetchDashboardStats = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.DASHBOARD_STATS);
    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {};
  }
};

// Poll submission status
export const pollSubmissionStatus = async (id, maxAttempts = 30) => {
  let attempts = 0;
  
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const status = await getSubmissionStatus(id);
        
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          resolve(status);
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Polling timeout'));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 2000); // Poll every 2 seconds
  });
};

export default API_BASE_URL;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  AUTH_ME: `${API_BASE_URL}/api/auth/me`,
  
  // SPPG
  SPPG_LIST: `${API_BASE_URL}/api/sppg`,
  SPPG_CREATE: `${API_BASE_URL}/api/sppg`,
  
  // Meal Submissions
  SUBMISSIONS_CREATE: `${API_BASE_URL}/api/submissions`,
  SUBMISSIONS_LIST: `${API_BASE_URL}/api/submissions`,
  SUBMISSIONS_DETAIL: (id) => `${API_BASE_URL}/api/submissions/${id}`,
  SUBMISSIONS_STATUS: (id) => `${API_BASE_URL}/api/submissions/${id}/status`,
  
  // Vision Analysis
  VISION_ANALYZE: `${API_BASE_URL}/api/vision/analyze-photo`,
  
  // Dashboard
  DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard/stats`,
  DASHBOARD_RECENT: `${API_BASE_URL}/api/dashboard/recent-sppg`,
  
  // RiwayatPage endpoints
  DASHBOARD_MONTHLY_STATS: `${API_BASE_URL}/api/dashboard/monthly-stats`,
  DASHBOARD_WEEKLY_TREND: `${API_BASE_URL}/api/dashboard/weekly-trend`,
  DASHBOARD_STATUS_DISTRIBUTION: `${API_BASE_URL}/api/dashboard/status-distribution`,
  DASHBOARD_SPPG_LEADERBOARD: `${API_BASE_URL}/api/dashboard/sppg-leaderboard`,
  
  // Search submissions
  SUBMISSIONS_SEARCH: `${API_BASE_URL}/api/submissions/search`,
};

// ============================================================================
// AUTHENTICATION API
// ============================================================================

// Register new SPPG account
export const registerSppg = async (data) => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH_REGISTER, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error registering SPPG:', error);
    throw error;
  }
};

// Login SPPG account
export const loginSppg = async (email, password) => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}`);
    }
    
    // Store SPPG data in localStorage
    if (result.success && result.data.sppg) {
      localStorage.setItem('sppg', JSON.stringify(result.data.sppg));
    }
    
    return result;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Logout SPPG account
export const logoutSppg = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH_LOGOUT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const result = await response.json();
    
    // Clear localStorage
    localStorage.removeItem('sppg');
    
    return result;
  } catch (error) {
    console.error('Error logging out:', error);
    // Clear localStorage even if request fails
    localStorage.removeItem('sppg');
    throw error;
  }
};

// Get current authenticated SPPG
export const getCurrentSppg = () => {
  const sppgData = localStorage.getItem('sppg');
  return sppgData ? JSON.parse(sppgData) : null;
};

// ============================================================================
// SPPG API
// ============================================================================

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
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
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

// Get recent submissions (for home page)
export const fetchRecentSubmissions = async (limit = 5, sppgId = null) => {
  try {
    let url = `${API_ENDPOINTS.SUBMISSIONS_LIST}?limit=${limit}&sort=created_at&order=desc`;
    
    // Add sppg_id filter if provided
    if (sppgId) {
      url += `&sppg_id=${sppgId}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching recent submissions:', error);
    return [];
  }
};

// Get latest completed submission (for home page banner)
export const fetchLatestResult = async (sppgId = null) => {
  try {
    let url = `${API_ENDPOINTS.SUBMISSIONS_LIST}?status=completed&limit=1&sort=created_at&order=desc`;
    
    // Add sppg_id filter if provided
    if (sppgId) {
      url += `&sppg_id=${sppgId}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const submission = data.data[0];
      // Get full result details
      const statusResponse = await fetch(API_ENDPOINTS.SUBMISSIONS_STATUS(submission.id));
      const statusData = await statusResponse.json();
      return statusData.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching latest result:', error);
    return null;
  }
};

// RiwayatPage API functions
export const fetchMonthlyStats = async (sppgId = null) => {
  try {
    let url = API_ENDPOINTS.DASHBOARD_MONTHLY_STATS;
    if (sppgId) {
      url += `?sppg_id=${sppgId}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return {};
  }
};

export const fetchWeeklyTrend = async (sppgId = null) => {
  try {
    let url = API_ENDPOINTS.DASHBOARD_WEEKLY_TREND;
    if (sppgId) {
      url += `?sppg_id=${sppgId}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching weekly trend:', error);
    return [];
  }
};

export const fetchStatusDistribution = async (sppgId = null) => {
  try {
    let url = API_ENDPOINTS.DASHBOARD_STATUS_DISTRIBUTION;
    if (sppgId) {
      url += `?sppg_id=${sppgId}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    return data.data || { distribution: [], total: 0 };
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    return { distribution: [], total: 0 };
  }
};

export const fetchRecentSubmissionsForRiwayat = async (limit = 10) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.SUBMISSIONS_LIST}?limit=${limit}&sort=created_at&order=desc`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching recent submissions for riwayat:', error);
    return [];
  }
};

export const fetchSppgLeaderboard = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.DASHBOARD_SPPG_LEADERBOARD);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching SPPG leaderboard:', error);
    return [];
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

// Analyze photo for ingredients
export const analyzePhotoForIngredients = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(API_ENDPOINTS.VISION_ANALYZE, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to analyze photo');
    }
  } catch (error) {
    console.error('Error analyzing photo:', error);
    throw error;
  }
};

export default API_BASE_URL;

// Simple API test
export async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');
    
    // Test simple GET request first
    const response = await fetch('http://localhost:8000/api/sppg', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    throw error;
  }
}

// Test this in browser console:
// import('./test-api-simple.js').then(m => m.testBackendConnection())
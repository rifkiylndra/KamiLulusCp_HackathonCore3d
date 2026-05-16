// Debug API calls
const API_BASE_URL = 'http://localhost:8000';

export async function testVisionEndpoint() {
  try {
    console.log('Testing vision endpoint...');
    
    // Create a simple test image (1x1 pixel)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 1, 1);
    
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('image', blob, 'test.jpg');
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/vision/analyze-photo`, {
          method: 'POST',
          body: formData,
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    }, 'image/jpeg');
  } catch (error) {
    console.error('Test error:', error);
  }
}

export async function testSppgEndpoint() {
  try {
    console.log('Testing SPPG endpoint...');
    const response = await fetch(`${API_BASE_URL}/api/sppg`);
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

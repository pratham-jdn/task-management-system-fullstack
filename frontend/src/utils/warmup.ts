// Service warmup utility to prevent Render free tier sleep issues
const BACKEND_URL = 'https://taskmanagement-backend-83z7.onrender.com';

export const warmupServices = async (): Promise<void> => {
  try {
    console.log('🔥 Warming up backend service...');
    
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ Backend service is warm and ready');
    } else {
      console.warn('⚠️ Backend service responded but may need more time');
    }
  } catch (error) {
    console.error('❌ Failed to warm up backend service:', error);
  }
};

// Auto-warmup on app load
if (typeof window !== 'undefined') {
  // Warmup immediately
  warmupServices();
  
  // Warmup every 10 minutes to prevent sleep
  setInterval(warmupServices, 10 * 60 * 1000);
}
// Performance monitoring utilities

export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
  } else {
    fn();
  }
};

export const measureAsyncPerformance = async (name: string, fn: () => Promise<void>) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
  } else {
    await fn();
  }
};

export const logBundleInfo = () => {
  if (typeof window !== 'undefined') {
    console.log('📦 Bundle loaded successfully');
    console.log(`🖥️ Device pixel ratio: ${window.devicePixelRatio}`);
    console.log(`📱 User agent: ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}`);
  }
};

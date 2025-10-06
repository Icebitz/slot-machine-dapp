import { useEffect, useRef, useCallback } from 'react';
import { Application } from 'pixi.js';

interface UsePixiAppOptions {
  width: number;
  height: number;
  backgroundAlpha?: number;
  background?: number;
  antialias?: boolean;
  autoDensity?: boolean;
}

export const usePixiApp = (options: UsePixiAppOptions) => {
  const appRef = useRef<Application | null>(null);
  const mountedRef = useRef(false);

  const initApp = useCallback(async () => {
    if (mountedRef.current || appRef.current) return appRef.current;

    mountedRef.current = true;
    const app = new Application();
    
    await app.init({
      ...options,
      powerPreference: "high-performance",
      resolution: window.devicePixelRatio || 1,
    });

    appRef.current = app;
    return app;
  }, [options]);

  const destroyApp = useCallback(() => {
    if (appRef.current) {
      try {
        appRef.current.ticker.stop();
        appRef.current.stage.removeChildren();
        appRef.current.destroy(true, { children: true, texture: true });
      } catch (error) {
        console.warn('Error destroying PIXI app:', error);
      }
      appRef.current = null;
    }
    mountedRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      destroyApp();
    };
  }, [destroyApp]);

  return {
    app: appRef.current,
    initApp,
    destroyApp,
    isInitialized: !!appRef.current,
  };
};

import { Assets } from 'pixi.js';

// Cache for loaded textures
const textureCache = new Map<string, unknown>();

export const preloadAssets = async () => {
  const assetPaths = [
    '/assets/doge.png',
    '/assets/meme.png', 
    '/assets/pepe.png',
    '/assets/mask.png',
    '/assets/smoke.png',
    '/assets/coin.png',
    '/assets/text.png',
    '/assets/winner.png'
  ];

  try {
    // Create a manifest object as required by PIXI.Assets
    const manifest = {
      bundles: [
        {
          name: 'default',
          assets: assetPaths.reduce((acc, path) => {
            acc[path] = { alias: path, src: path };
            return acc;
          }, {} as Record<string, { alias: string; src: string }>)
        }
      ]
    };

    await Assets.init({ manifest });

    // Preload all assets
    const promises = assetPaths.map(async (path) => {
      if (!textureCache.has(path)) {
        const texture = await Assets.load(path);
        textureCache.set(path, texture);
      }
      return textureCache.get(path);
    });

    await Promise.all(promises);
    console.log('✅ All assets preloaded successfully');
  } catch (error) {
    console.warn('⚠️ Asset preloading failed:', error);
  }
};

export const getTexture = (path: string) => {
  return textureCache.get(path);
};

export const clearTextureCache = () => {
  textureCache.clear();
};

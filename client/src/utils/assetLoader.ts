import { Assets } from 'pixi.js';
import doge from '@/assets/doge.png';
import meme from '@/assets/meme.png';
import pepe from '@/assets/pepe.png';
import mask from '@/assets/mask.png';
import smoke from '@/assets/smoke.png';
import coin from '@/assets/coin.png';
import text from '@/assets/text.png';
import winner from '@/assets/winner.png';

// Cache for loaded textures
const textureCache = new Map<string, unknown>();

export const preloadAssets = async () => {
  const assets = [
    { key: 'doge', src: doge.src },
    { key: 'meme', src: meme.src },
    { key: 'pepe', src: pepe.src },
    { key: 'mask', src: mask.src },
    { key: 'smoke', src: smoke.src },
    { key: 'coin', src: coin.src },
    { key: 'text', src: text.src },
    { key: 'winner', src: winner.src },
  ];

  try {
    // Create a manifest object as required by PIXI.Assets
    const manifest = {
      bundles: [
        {
          name: 'default',
          assets: assets.reduce((acc, a) => {
            acc[a.key] = { alias: a.key, src: a.src };
            return acc;
          }, {} as Record<string, { alias: string; src: string }>)
        }
      ]
    };

    await Assets.init({ manifest });

    // Preload all assets
    const promises = assets.map(async (a) => {
      if (!textureCache.has(a.key)) {
        const texture = await Assets.load(a.src);
        textureCache.set(a.key, texture);
      }
      return textureCache.get(a.key);
    });

    await Promise.all(promises);
    console.log('✅ All assets preloaded successfully');
  } catch (error) {
    console.warn('⚠️ Asset preloading failed:', error);
  }
};

export const getTexture = (key: string) => {
  return textureCache.get(key);
};

export const clearTextureCache = () => {
  textureCache.clear();
};

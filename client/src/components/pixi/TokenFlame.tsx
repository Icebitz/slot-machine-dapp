"use client";

import { useEffect, useRef } from "react";
import { Application, Assets, Container, Text, TextStyle, Sprite, BlurFilter, Ticker } from "pixi.js";
import flame from "@/assets/smoke.png";
import { FIRST_COLOR, LAST_COLOR, SECOND_COLOR, THIRD_COLOR } from "@/utils/const";

interface FlameParticle {
  sprite: Sprite;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export default function TokenFlame() {
  const pixiRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const mountedRef = useRef(false); // ✅ prevents double init

  useEffect(() => {
    // ⛔ Prevent duplicate init in React Strict Mode
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (!pixiRef.current) return;

    const parent = pixiRef.current;
    const width = parent.clientWidth || 800;
    const height = parent.clientHeight || 200;

    const app = new Application();
    appRef.current = app;

    let destroyed = false;

    async function init() {
      await app.init({
        width,
        height,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        powerPreference: "high-performance",
        resolution: window.devicePixelRatio || 1,
      });

      if (destroyed) return;
      parent.appendChild(app.canvas);

      const flameTexture = await Assets.load(flame.src);
      const fireContainer = new Container();
      app.stage.addChild(fireContainer);
      const particles: FlameParticle[] = [];

      function spawnParticle() {
        const sprite = new Sprite(flameTexture);
        sprite.anchor.set(0.5);
        sprite.blendMode = "screen";
        sprite.x = Math.random() * width;
        sprite.y = height + 20 - Math.random() * (height / 2);
        sprite.scale.set(0.8 + Math.random() * 0.6);
        sprite.alpha = 0.9;
        fireContainer.addChild(sprite);

        particles.push({
          sprite,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -1 - Math.random() * 0.5,
          life: 0,
          maxLife: height + Math.random() * (height / 2),
        });
      }

      app.ticker.add(() => {
        for (let i = 0; i < 2; i++) spawnParticle();

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.sprite.x += p.vx;
          p.sprite.y += p.vy;
          p.life++;

          const t = p.life / p.maxLife;
          p.sprite.scale.set(1 - t * 0.5);
          if (t < 0.1) p.sprite.tint = FIRST_COLOR;
          else if (t < 0.4) p.sprite.tint = SECOND_COLOR;
          else if (t < 0.7) p.sprite.tint = THIRD_COLOR;
          else p.sprite.tint = LAST_COLOR;

          if (p.life >= p.maxLife) {
            fireContainer.removeChild(p.sprite);
            particles.splice(i, 1);
          }
        }
      });

      // === Text glow setup ===
      const textStyle = new TextStyle({
        fontFamily: "Arial Black",
        fontSize: 80,
        align: "center",
        fill: "#fff066",
        stroke: { color: "#fff066", width: 1 },
        dropShadow: { color: "black", blur: 2, distance: 1 },
      });

      const text = new Text({ text: "$LAST", style: textStyle });
      text.anchor.set(0.5);
      text.x = width / 2;
      text.y = height / 2;
      text.scale.set(1, 1.1);

      const glow = new Text({
        text: "$LAST",
        style: {
          fontFamily: "Arial Black",
          fontSize: 80,
          align: "center",
          fill: "#ffffff",
        },
      });
      glow.anchor.set(0.5);
      glow.x = width / 2;
      glow.y = height / 2;
      glow.scale.set(1, 1.1);

      // Disable filters on Text to avoid Pixi v8 Batcher errors in dev.
      // We'll emulate a glow via alpha + scale pulsing instead.
      glow.filters = null;

      app.stage.addChild(text);
      app.stage.addChild(glow);

      let tAccum = 0;
      const minAlpha = 0.15;
      const maxAlpha = 0.85;
      const pulseSpeed = 0.0002;

      // Separate ticker for text animation to avoid conflicts
      const textTicker = (ticker: Ticker) => {
        if (destroyed) return;
        
        try {
          tAccum += ticker.deltaMS * pulseSpeed;
          const phase = (Math.sin(tAccum * Math.PI * 2) + 1) / 2;
          const smooth = phase * phase * (3 - 2 * phase);
          
          // Update glow alpha (this always works)
          if (glow && typeof glow.alpha !== 'undefined') {
            glow.alpha = minAlpha + smooth * (maxAlpha - minAlpha);
          }
          // Use scale for a subtle pulsing effect
          if (glow && typeof glow.scale !== 'undefined') {
            const scaleFactor = 1 + (smooth * 0.01);
            glow.scale.set(scaleFactor, scaleFactor * 1.1);
          }
        } catch (error) {
          console.warn('Error updating text animation:', error);
        }
      };

      app.ticker.add(textTicker);
    }

    init();

    // ✅ Cleanup safely
    return () => {
      destroyed = true;
      mountedRef.current = false;
      if (appRef.current) {
        try {
          // Stop all tickers first
          appRef.current.ticker.stop();
          
          // Remove all children and their filters
          appRef.current.stage.removeChildren();
          
          // Destroy the application with proper cleanup
          appRef.current.destroy(true, { 
            children: true, 
            texture: true
          });
        } catch (error) {
          console.warn('Error during cleanup:', error);
        } finally {
          appRef.current = null;
        }
      }
    };
  }, []);

  return <div ref={pixiRef} className="w-full h-20 overflow-hidden" />;
}

import "@/styles/globals.css";
import "@/styles/style.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { preloadAssets } from "@/utils/assetLoader";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Preload assets on app initialization
    preloadAssets();
  }, []);

  return <Component {...pageProps} />;
}

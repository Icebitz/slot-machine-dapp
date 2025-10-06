import dynamic from "next/dynamic";

// Lazy load PIXI components for better performance
const LogoFlame = dynamic(() => import("../pixi/LogoFlame"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-32 bg-black/20 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  ),
});

import { memo } from "react";

function LogoSection() {
  return (
    <div className="w-4/5 border-0 border-x-4 border-x-yellow-200 rounded bg-gray-900/20">
      <div className="border-y-2 border-y-amber-100/20">
        <div className="w-full h-32 bg-black/20 relative overflow-hidden">
          <LogoFlame checked={false} />
        </div>
        <p className="text-center text-lg text-orange-300 font-bold scale-y-150 uppercase">
          Last Spin. Last Buy. Big Win.
        </p>
      </div>
    </div>
  );
}

export default memo(LogoSection);
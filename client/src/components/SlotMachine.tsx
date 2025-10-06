import dynamic from "next/dynamic";
import ResultToast from "./ResultToast";
import LogoSection from "./sections/LogoSection";
import BuySection from "./sections/BuySection";
import InfoSection from "./sections/InfoSection";

// Lazy load PIXI components for better performance
const SlotSpin = dynamic(() => import("./pixi/SlotSpin"), {
  ssr: false,
  loading: () => (
    <div className="h-24 flex justify-center items-center bg-black border-2 border-red-400/60">
      <div className="text-white">Loading...</div>
    </div>
  ),
});

export default function SlotMachine() {
	const alert = null;

	return (
		<div className="w-md flex flex-col items-center justify-center bg-black overflow-hidden relative border border-white/20 rounded-lg p-6">
			<ResultToast text={alert} />

			{/* Top Logo + FX */}
			<LogoSection />

			{/* Wallets / Pools */}
			<InfoSection />

			<div
				className="w-full border-0 border-x-4 border-x-yellow-200 rounded p-2 bg-gray-900/20"
				style={{ transform: "perspective(500px) rotateX(20deg) scaleY(1.1) translateY(-0px)" }}
			>
				<div className="shadow-xl/10 shadow-white p-2 border-1 border-gray-300/20 rounded-lg">
					{/* Reels */}
					<SlotSpin />

					{/* Bottom Info */}
					<BuySection />
				</div>
			</div>
		</div>
	);
};
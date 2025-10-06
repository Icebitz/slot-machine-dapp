
import { MAX_BUY_AMOUNT, MIN_BUY_AMOUNT } from "@/utils/const";
import { memo, useState } from "react";

function BuySection() {
  const [buyAmount, setBuyAmount] = useState(25);
  const [inputValue, setInputValue] = useState("$25.00");
  const [focused, setFocused] = useState<boolean>(false);
  const [isBuying, setIsBuying] = useState<boolean>(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    if (raw === "") {
      setInputValue("");
      setBuyAmount(0);
      return;
    }
    const val = parseFloat(raw);
    if (!isNaN(val)) {
      const limited = Math.max(MIN_BUY_AMOUNT, Math.min(MAX_BUY_AMOUNT, val));
      setBuyAmount(limited);
      setInputValue(raw);
    }
  }

  function handleFocus() {
    setFocused(true);
    setInputValue(buyAmount.toString());
  }

  function handleBlur() {
    setFocused(false);
    setInputValue(
      `$${buyAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    );
  }

  function handleBuy() {
    setIsBuying(true);
    setTimeout(() => {
      setIsBuying(false);
    }, 1000);
  }

  return (
    <div className="text-sm w-full flex-col pt-2">
      {/* Bottom Info */}
      <div className="flex justify-between items-start gap-2">
        <div className="w-2/5 flex flex-col py-1 justify-center items-center bg-amber-950/50 border border-amber-900">
          <span className="text-yellow-500 uppercase font-bold">Buys remaining</span>
          <span className="text-yellow-200 text-sm">--:--</span>
        </div>
        <div className="w-3/5 flex flex-col justify-center items-center">
          <p className="text-yellow-500 font-bold uppercase">Fees Pool:</p>
          <p className="text-yellow-500 font-bold text-3xl">$0.00</p>
        </div>
      </div>
      <div className="flex justify-between items-center gap-1">
        <div className="w-1/4 text-yellow-500 text-sm uppercase text-center leading-none">Buy Amount</div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-1/3 px-2 text-xl font-bold outline-none ${focused ? "bg-amber-950/30 border border-amber-900 text-yellow-200" : "bg-amber-950/50 border border-amber-900 text-yellow-500"}`}
        />
        <div className="flex-1 flex justify-end">
          <button
            onClick={handleBuy}
            disabled={isBuying}
            className={`relative overflow-hidden text-lg font-bold px-5 py-0.5 rounded border uppercase text-black transition-all duration-200 
              ${isBuying
                ? "bg-gradient-to-b from-gray-400 to-gray-500 border-gray-600 text-gray-800 cursor-not-allowed"
                : "bg-gradient-to-b from-orange-300 to-orange-400 shadow shadow-orange-300 border border-gray-800/70 hover:from-yellow-300 hover:to-yellow-400"
              }`}
          >
            {isBuying ? "BUYING..." : "BUY"}
            {isBuying && (
              <span className="absolute inset-0 animate-pulse bg-yellow-200/20 rounded-lg pointer-events-none" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(BuySection);
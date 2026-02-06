import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axiosClient from "../utils/axiosClient";
import { motion, AnimatePresence } from "framer-motion";

interface AddPhoneNoProps {
  onSuccess: () => void;
}

export default function AddPhoneNo({ onSuccess }: AddPhoneNoProps) {
  const { user, isLoaded } = useUser();

  const [phoneNo, setPhoneNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  // Handle input change to restrict to 10 digits and numbers only
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (val.length <= 10) {
      setPhoneNo(val);
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (phoneNo.length !== 10) {
      setError("Please enter exactly 10 digits");
      return;
    }
    
    setIsConfirming(true);
  };

  const handleFinalConfirm = async () => {
    if (!isLoaded || !user) {
      setError("User session not found");
      return;
    }

    const emailId = user.primaryEmailAddress?.emailAddress;
    // We send the full number with country code to the backend
    const fullNumber = `+91${phoneNo}`;

    try {
      setLoading(true);
      await axiosClient.post("/auth/addPhoneNo", {
        emailId,
        phoneNo: fullNumber, 
      });

      onSuccess(); 
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update phone number");
      setIsConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-6 overflow-hidden font-sans">
      
      {/* Background Architectural Text */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <h1 className="text-[25vw] font-black text-zinc-900/40 uppercase tracking-tighter italic leading-none select-none">
          Verify
        </h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-black border border-zinc-900 p-12 relative z-10 shadow-2xl"
      >
        <div className="text-center space-y-4 mb-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none">
            {isConfirming ? "Lock Number" : "Secure Account"}
          </h2>
          <p className="text-[9px] text-zinc-500 uppercase tracking-[0.4em] leading-relaxed">
            {isConfirming 
              ? "Linked to +91. This cannot be changed later." 
              : "Enter your 10-digit mobile number to proceed."}
          </p>
        </div>

        <form onSubmit={handleInitialSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-600 ml-1 font-bold">
              Mobile Contact (India)
            </label>
            
            {/* Input Wrapper for +91 Prefix */}
            <div className={`flex items-center bg-zinc-950 border transition-all ${isConfirming ? 'border-zinc-800' : 'border-zinc-800 focus-within:border-white'}`}>
              <span className="pl-4 pr-2 text-zinc-500 font-bold tracking-widest text-sm border-r border-zinc-900 mr-2 uppercase">
                +91
              </span>
              <input
                type="tel"
                placeholder="00000 00000"
                disabled={isConfirming}
                value={phoneNo}
                onChange={handleInputChange}
                maxLength={10}
                className={`w-full bg-transparent py-5 transition-all tabular-nums text-white uppercase text-sm tracking-[0.3em] outline-none`}
                autoFocus
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isConfirming ? (
              <motion.button
                key="initial"
                type="submit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition"
              >
                Proceed to Verification
              </motion.button>
            ) : (
              <motion.div 
                key="confirm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <button
                  type="button"
                  onClick={handleFinalConfirm}
                  disabled={loading}
                  className="w-full py-5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500 transition shadow-[0_0_40px_rgba(220,38,38,0.15)]"
                >
                  {loading ? "Locking..." : `Confirm +91 ${phoneNo}`}
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirming(false)}
                  className="w-full text-[9px] text-zinc-500 uppercase tracking-widest hover:text-white transition py-2"
                >
                  Back to edit
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p className="text-red-500 text-[9px] uppercase tracking-widest text-center animate-pulse mt-4 font-bold">
              {error}
            </p>
          )}
        </form>

        <div className="mt-12 pt-8 border-t border-zinc-900/50">
          <p className="text-[8px] text-zinc-700 text-center uppercase tracking-[0.2em] leading-loose">
            Linking number to <br /> 
            <span className="text-zinc-500 break-all">{user?.primaryEmailAddress?.emailAddress}</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
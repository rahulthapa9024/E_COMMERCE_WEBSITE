// components/FloatingCartButton.tsx
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../utils/axiosClient";

const CartIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

export default function FloatingCartButton() {
  const { user, isLoaded } = useUser();
  const [cartQuantity, setCartQuantity] = useState(0);
  const emailId = user?.primaryEmailAddress?.emailAddress;

  const fetchCartQuantity = useCallback(async () => {
    if (!emailId) return;
    try {
      const res = await axiosClient.get(`/cart/getCartQuantity/${emailId}`);
      setCartQuantity(res.data.quantity || 0);
    } catch (err) {
      setCartQuantity(0);
    }
  }, [emailId]);

  useEffect(() => {
    if (isLoaded && emailId) fetchCartQuantity();
    const handleUpdate = () => fetchCartQuantity();
    window.addEventListener("cartUpdated", handleUpdate);
    const interval = setInterval(fetchCartQuantity, 5000);
    return () => {
      window.removeEventListener("cartUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, [isLoaded, emailId, fetchCartQuantity]);

  return (
    <AnimatePresence>
      {cartQuantity > 0 && (
        <motion.div
          // Responsive positioning: Lower on mobile, slightly higher on desktop
          initial={{ y: 100, x: "-50%", opacity: 0, scale: 0.8 }}
          animate={{ y: 0, x: "-50%", opacity: 1, scale: 1 }}
          exit={{ y: 100, x: "-50%", opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", damping: 20, stiffness: 250 }}
          className="fixed bottom-6 md:bottom-10 left-1/2 z-[100] group touch-none"
        >
          {/* Responsive Glow */}
          <div className="absolute inset-0 bg-cyan-500/20 blur-xl md:blur-2xl rounded-full group-hover:bg-cyan-500/40 transition-all duration-500" />

          <Link
            to="/cart"
            className="relative flex items-center 
              gap-3 md:gap-5 
              bg-zinc-950/90 border border-white/10 backdrop-blur-xl 
              px-5 py-3 md:px-8 md:py-4 
              rounded-full shadow-2xl overflow-hidden
              max-w-[90vw] sm:max-w-none"
          >
            {/* Shimmer Effect */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1 }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
            />

            <div className="relative flex items-center gap-3">
              <div className="relative">
                <CartIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                <motion.span 
                  key={cartQuantity}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 
                    flex h-4 w-4 md:h-5 md:w-5 items-center justify-center 
                    rounded-full bg-cyan-500 text-[8px] md:text-[10px] 
                    font-black text-black ring-2 ring-black"
                >
                  {cartQuantity}
                </motion.span>
              </div>

              <div className="flex flex-col items-start leading-none">
                {/* Hidden label on very small screens if necessary, or just smaller text */}
                <span className="text-[8px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-zinc-500 font-bold mb-0.5">
                  Your Bag
                </span>
                <span className="text-xs md:text-sm font-bold text-white tracking-tight">
                  VIEW CART
                </span>
              </div>
            </div>

            {/* Responsive arrow divider */}
            <div className="ml-1 md:ml-2 pl-3 md:pl-4 border-l border-white/10">
               <svg className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
               </svg>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
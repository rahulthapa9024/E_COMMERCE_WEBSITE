import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ChevronLeft, ArrowRight,
  AlertCircle, Loader2, CheckCircle,
  Lock, Zap, CreditCard, BadgeCheck,
  ShieldAlert, X
} from "lucide-react";

import axiosClient from "../utils/axiosClient";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentGateway() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = useLocation();
  const emailId = user?.primaryEmailAddress?.emailAddress || "";
  const userName = user?.fullName || "";

  const [sdkReady, setSdkReady] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  /* ---------------- FLOW & SCROLL ---------------- */
  useEffect(() => {
    if (!location.state?.fromCheckout || !location.state?.amount) {
      navigate("/checkout", { replace: true });
      return;
    }
    setAmount(location.state.amount);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.state, navigate, pathname]);

  /* ---------------- LOAD RAZORPAY SDK ---------------- */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => setError("Failed to load payment gateway");
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  /* ---------------- BACKEND TRUTH CHECK ---------------- */
  useEffect(() => {
    if (!emailId) return;
    const verifyPaymentAccess = async () => {
      try {
        const res = await axiosClient.get("/cart/getCart", { params: { emailId } });
        const { cart, BeingDelivered } = res.data;
        if (!cart || cart.length === 0) {
          if (BeingDelivered && BeingDelivered.length > 0) {
            navigate("/userBeingDelivered", { replace: true });
          } else {
            navigate("/cart", { replace: true });
          }
        }
      } catch {
        navigate("/cart", { replace: true });
      }
    };
    verifyPaymentAccess();
  }, [emailId, navigate]);

  /* ---------------- HANDLE PAGE REFRESH WARNING ---------------- */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (processingPayment && !paymentSuccess && !isRedirecting) {
        e.preventDefault();
        e.returnValue = "Your payment is being processed. Are you sure you want to leave?";
        return "Your payment is being processed. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [processingPayment, paymentSuccess, isRedirecting]);

  /* ---------------- BLOCK BACK BUTTON DURING PAYMENT ---------------- */
  useEffect(() => {
    if (processingPayment) {
      window.history.pushState(null, "", window.location.href);
      window.onpopstate = () => {
        window.history.pushState(null, "", window.location.href);
      };
    }
    return () => { window.onpopstate = null; };
  }, [processingPayment]);

  /* ---------------- SUCCESS REDIRECT ---------------- */
  useEffect(() => {
    if (paymentSuccess) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        navigate("/userBeingDelivered", { replace: true });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, navigate]);

  /* ---------------- HANDLE PAYMENT ---------------- */
  const handlePayment = async () => {
    if (!sdkReady || processingPayment || !emailId) return;
    setProcessingPayment(true);
    setError(null);
    setShowRefreshWarning(false);

    try {
      const orderRes = await axiosClient.post("/payment/createOrder", { emailId });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "FITNESTYLE",
        order_id: orderRes.data.id,
        handler: async (response: any) => {
          try {
            setProcessingPayment(true);
            const verifyRes = await axiosClient.post("/payment/verifyPayment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              emailId: emailId
            });

            if (verifyRes.data.success) {
              setPaymentSuccess(true);
            } else {
              setError(verifyRes.data.message || "Verification failed");
            }
          } catch (err: any) {
            setError(err.response?.data?.message || "Verification failed");
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: userName,
          email: emailId,
          contact: user?.primaryPhoneNumber?.phoneNumber || ""
        },
        theme: { color: "#10B981" },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            setError("Payment was cancelled.");
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError("Unable to initialize secure order.");
      setProcessingPayment(false);
    }
  };

  const handleStayOnPage = () => setShowRefreshWarning(false);
  const handleLeaveAnyway = () => {
    setProcessingPayment(false);
    setShowRefreshWarning(false);
    navigate("/cart");
  };

  /* ---------------- SUCCESS SCREEN ---------------- */
  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400 rounded-full"
              initial={{ x: Math.random() * 100 + 'vw', y: Math.random() * 100 + 'vh' }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="text-center z-10 max-w-md"
        >
          <div className="relative w-40 h-40 mx-auto mb-10">
            <motion.div 
              animate={{ scale: [1, 1.3, 1], rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"
            />
            <div className="relative bg-emerald-600 rounded-full w-full h-full flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <CheckCircle size={80} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Payment Successful!
          </h1>
          <p className="text-lg text-zinc-400 mb-8">
            Your order is being processed. You'll be redirected shortly.
          </p>
          
          <div className="w-64 mx-auto h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: "100%" }} 
              transition={{ duration: 3 }} 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300" 
            />
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------------- REFRESH WARNING MODAL ---------------- */
  if (showRefreshWarning) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <AlertCircle size={20} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Payment in Progress</h3>
                  <p className="text-sm text-zinc-400">Important Notice</p>
                </div>
              </div>
              <button onClick={handleStayOnPage} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X size={20} className="text-zinc-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-lg text-white mb-3 font-medium">Don't refresh or close this window</p>
                <p className="text-sm text-zinc-400">Your payment is currently being processed. Leaving this page may interrupt the transaction.</p>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Loader2 size={16} className="animate-spin text-emerald-500" />
                  <span className="text-sm text-zinc-400">Processing payment...</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleLeaveAnyway} className="flex-1 py-3 px-4 rounded-xl border border-gray-700 hover:bg-white/5 text-white font-medium transition-all">
                  Cancel
                </button>
                <button onClick={handleStayOnPage} className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all">
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="min-h-screen pt-15 bg-gradient-to-b from-gray-900 via-black to-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-xl z-10"
      >
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8 px-2">
          <button 
            onClick={() => processingPayment ? setShowRefreshWarning(true) : navigate(-1)} 
            className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all group"
          >
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
              <ChevronLeft size={20} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">Back</span>
              <span className="text-xs opacity-60">to checkout</span>
            </div>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Secure</span>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-60">Powered by</div>
              <div className="text-sm font-bold tracking-tight">Razorpay®</div>
            </div>
          </div>
        </div>

        {/* Main Payment Card */}
        <div className="bg-zinc-900/40 border border-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 rounded-2xl bg-white/5">
              <CreditCard className="text-emerald-400" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Secure Payment</h1>
              <p className="text-sm text-zinc-400 mt-1">Complete your purchase with confidence</p>
            </div>
          </div>

          {/* Warning during processing */}
          {processingPayment && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-amber-500" />
                <p className="text-xs text-zinc-400">
                  <span className="font-bold text-amber-500 block">Payment in Progress</span>
                  Do not refresh or close this window.
                </p>
              </div>
            </div>
          )}

          {/* Amount Display */}
          <div className="bg-black/50 border border-white/5 rounded-3xl p-8 mb-10 text-center transition-all duration-300">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-zinc-400">Total Amount Due</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl font-medium text-emerald-500">₹</span>
              <span className="text-7xl font-black tracking-tighter">
                {amount.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-zinc-400">Includes all taxes and charges</div>
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              { icon: ShieldAlert, label: "Bank-Level", sub: "SSL encrypted", color: "text-emerald-500" },
              { icon: Zap, label: "Instant", sub: "Real-time", color: "text-blue-500" },
              { icon: Lock, label: "Privacy", sub: "No data stored", color: "text-purple-500" },
              { icon: BadgeCheck, label: "Guaranteed", sub: "Secure Gateway", color: "text-amber-500" }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <item.icon size={20} className={item.color} />
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-[10px] text-zinc-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* User Info */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-zinc-400 mb-1">Paying as</p>
              <p className="font-semibold">{userName}</p>
              <p className="text-sm text-zinc-400">{emailId}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 flex items-center justify-center text-black font-bold">
              {userName.charAt(0)}
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
              >
                <AlertCircle size={20} className="text-red-500" />
                <p className="text-sm font-medium text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <button
            onClick={handlePayment}
            disabled={processingPayment || !sdkReady}
            className={`w-full relative overflow-hidden py-5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
              processingPayment ? "bg-zinc-800 text-zinc-500" : "bg-emerald-600 hover:bg-emerald-500 text-white"
            } disabled:cursor-not-allowed`}
          >
            {processingPayment ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Pay ₹{amount.toLocaleString()} Now</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-zinc-500 text-xs">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-px bg-white/10"></div>
            <p className="uppercase tracking-widest">Protected by Razorpay</p>
            <div className="w-12 h-px bg-white/10"></div>
          </div>
          <p>Need help? Contact support@fitnestyle.com</p>
          <p className="mt-1 opacity-60">© 2024 FITNESTYLE. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
}
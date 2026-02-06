import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ChevronLeft, ArrowRight,
  AlertCircle, Loader2, CheckCircle,
  Lock, Zap, CreditCard, BadgeCheck,
  Sun, Moon, ShieldAlert, X
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

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

    const handleUnload = () => {
      if (processingPayment && !paymentSuccess && !isRedirecting) {
        console.log("User left during payment processing");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
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

  // Handle refresh warning actions
  const handleStayOnPage = () => {
    setShowRefreshWarning(false);
  };

  const handleLeaveAnyway = () => {
    setProcessingPayment(false);
    setShowRefreshWarning(false);
    navigate("/cart");
  };

  // Theme-based styles
  const themeStyles = {
    dark: {
      background: "bg-gradient-to-b from-gray-900 via-black to-black",
      card: "bg-zinc-900/40 border-white/10",
      text: {
        primary: "text-white",
        secondary: "text-zinc-400",
        accent: "text-emerald-400"
      },
      button: {
        background: "bg-emerald-600 hover:bg-emerald-500",
        disabled: "bg-zinc-800",
        text: "text-white"
      },
      amountBox: "bg-black/50 border-white/5",
      featureCard: "bg-white/5 border-white/5",
      successBg: "from-gray-900 to-black",
      modal: "bg-zinc-900/95 backdrop-blur-xl"
    },
    light: {
      background: "bg-gradient-to-b from-gray-50 via-white to-gray-100",
      card: "bg-white/80 border-gray-200 backdrop-blur-lg",
      text: {
        primary: "text-gray-900",
        secondary: "text-gray-600",
        accent: "text-emerald-600"
      },
      button: {
        background: "bg-emerald-500 hover:bg-emerald-600",
        disabled: "bg-gray-300",
        text: "text-white"
      },
      amountBox: "bg-gray-50/80 border-gray-100",
      featureCard: "bg-gray-50/60 border-gray-200",
      successBg: "from-gray-50 to-white",
      modal: "bg-white/95 backdrop-blur-xl"
    }
  };

  const currentTheme = themeStyles[theme];

  /* ---------------- SUCCESS SCREEN ---------------- */
  if (paymentSuccess) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${currentTheme.successBg} ${currentTheme.text.primary} p-6 overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 ${theme === "dark" ? "bg-emerald-400" : "bg-emerald-500"} rounded-full`}
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
              className={`absolute inset-0 ${theme === "dark" ? "bg-emerald-500/20" : "bg-emerald-500/10"} blur-2xl rounded-full`}
            />
            <div className={`relative ${theme === "dark" ? "bg-emerald-600" : "bg-emerald-500"} rounded-full w-full h-full flex items-center justify-center shadow-2xl ${theme === "dark" ? "shadow-emerald-500/20" : "shadow-emerald-500/10"}`}>
              <CheckCircle size={80} className="text-white" />
            </div>
            
            {/* Confetti particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 ${i % 2 === 0 ? "bg-emerald-400" : "bg-blue-400"} rounded-full`}
                initial={{ x: 0, y: 0 }}
                animate={{
                  x: Math.cos(i * 45 * Math.PI/180) * 80,
                  y: Math.sin(i * 45 * Math.PI/180) * 80,
                  scale: [0, 1, 0]
                }}
                transition={{ duration: 2, delay: i * 0.1 }}
              />
            ))}
          </div>
          
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Payment Successful!
          </h1>
          <p className={`text-lg ${currentTheme.text.secondary} mb-8`}>
            Your order is being processed. You'll be redirected shortly.
          </p>
          
          <div className="w-64 mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{
            background: theme === "dark" 
              ? "radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9))"
              : "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.9))"
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`${currentTheme.modal} border ${theme === "dark" ? "border-white/10" : "border-gray-200"} rounded-2xl shadow-2xl max-w-md w-full`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800/30">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-amber-500/20" : "bg-amber-100"}`}>
                  <AlertCircle size={20} className="text-amber-500" />
                </div>
                <div>
                  <h3 className={`font-bold ${currentTheme.text.primary}`}>Payment in Progress</h3>
                  <p className={`text-sm ${currentTheme.text.secondary}`}>Important Notice</p>
                </div>
              </div>
              <button
                onClick={handleStayOnPage}
                className={`p-2 rounded-lg ${theme === "dark" ? "hover:bg-white/10" : "hover:bg-gray-100"} transition-colors`}
              >
                <X size={20} className={currentTheme.text.secondary} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="text-center mb-6">
                <p className={`text-lg ${currentTheme.text.primary} mb-3 font-medium`}>
                  Don't refresh or close this window
                </p>
                <p className={`text-sm ${currentTheme.text.secondary}`}>
                  Your payment is currently being processed. Leaving this page may interrupt the transaction.
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Loader2 size={16} className="animate-spin text-emerald-500" />
                  <span className={`text-sm ${currentTheme.text.secondary}`}>Processing payment...</span>
                </div>
                <div className={`w-full h-1.5 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"} rounded-full overflow-hidden`}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-300"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLeaveAnyway}
                  className={`flex-1 py-3 px-4 rounded-xl border ${theme === "dark" ? "border-gray-700 hover:bg-white/5" : "border-gray-300 hover:bg-gray-100"} ${currentTheme.text.primary} font-medium transition-all duration-300`}
                >
                  Cancel Payment
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStayOnPage}
                  className={`flex-1 py-3 px-4 rounded-xl ${theme === "dark" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-emerald-500 hover:bg-emerald-600"} text-white font-medium transition-all duration-300`}
                >
                  Continue Payment
                </motion.button>
              </div>

              {/* Security Note */}
              <div className="mt-6 pt-6 border-t border-gray-800/30">
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <p className={`text-xs ${currentTheme.text.secondary}`}>
                    Your transaction is secure and encrypted
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.text.primary} flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300`}>
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className={`absolute -top-24 -left-24 w-96 h-96 ${theme === "dark" ? "bg-emerald-500/10" : "bg-emerald-400/5"} rounded-full blur-[120px]`}
        />
        <motion.div 
          animate={{ x: [0, -100, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className={`absolute -bottom-24 -right-24 w-96 h-96 ${theme === "dark" ? "bg-blue-500/10" : "bg-blue-400/5"} rounded-full blur-[120px]`}
        />
      </div>

      {/* Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-2xl ${theme === "dark" ? "bg-white/10 hover:bg-white/20" : "bg-gray-900/10 hover:bg-gray-900/20"} border ${theme === "dark" ? "border-white/10" : "border-gray-200"} backdrop-blur-sm transition-all duration-300`}
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </motion.button>

      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-xl z-10"
      >
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8 px-2">
          <motion.button 
            whileHover={{ x: -4 }}
            onClick={() => {
              if (processingPayment) {
                setShowRefreshWarning(true);
              } else {
                navigate(-1);
              }
            }} 
            className={`flex items-center gap-3 ${currentTheme.text.secondary} hover:${currentTheme.text.primary} transition-all group`}
          >
            <div className={`p-2 rounded-xl ${theme === "dark" ? "bg-white/5 group-hover:bg-white/10" : "bg-gray-900/5 group-hover:bg-gray-900/10"} transition-colors`}>
              <ChevronLeft size={20} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">Back</span>
              <span className="text-xs opacity-60">to checkout</span>
            </div>
          </motion.button>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${theme === "dark" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-100 border-emerald-200"} border backdrop-blur-sm`}>
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Secure</span>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-60">Powered by</div>
              <div className="text-sm font-bold tracking-tight">Razorpay®</div>
            </div>
          </div>
        </div>

        {/* Main Payment Card */}
        <div className={`${currentTheme.card} border backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl transition-all duration-300`}>
          
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-3 rounded-2xl ${theme === "dark" ? "bg-white/5" : "bg-gray-100"} transition-colors`}>
                  <CreditCard className={currentTheme.text.accent} size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Secure Payment</h1>
                  <p className={`text-sm ${currentTheme.text.secondary} mt-1`}>Complete your purchase with confidence</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Warning */}
          {processingPayment && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mb-6 p-4 rounded-2xl ${theme === "dark" ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"} border`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-amber-500" />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${theme === "dark" ? "text-amber-400" : "text-amber-600"}`}>
                    Payment in Progress
                  </p>
                  <p className={`text-xs ${currentTheme.text.secondary} mt-1`}>
                    Do not refresh or close this window. You'll be redirected automatically.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Amount Display */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`${currentTheme.amountBox} border rounded-3xl p-8 mb-10 text-center backdrop-blur-sm transition-all duration-300`}
          >
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${currentTheme.text.secondary}`}>Total Amount Due</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl font-medium text-emerald-500">₹</span>
              <span className="text-7xl font-black tracking-tighter">
                {amount.toLocaleString()}
              </span>
            </div>
            <div className={`text-sm ${currentTheme.text.secondary}`}>
              Includes all taxes and charges
            </div>
          </motion.div>

          {/* Security Features */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              { 
                icon: ShieldAlert, 
                label: "Bank-Level Security", 
                sub: "256-bit SSL encryption",
                color: "text-emerald-500"
              },
              { 
                icon: Zap, 
                label: "Instant Processing", 
                sub: "Real-time verification",
                color: "text-blue-500"
              },
              { 
                icon: Lock, 
                label: "Privacy Protected", 
                sub: "No data stored",
                color: "text-purple-500"
              },
              { 
                icon: BadgeCheck, 
                label: "Guaranteed", 
                sub: "Money-back policy",
                color: "text-amber-500"
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -4 }}
                className={`flex items-start gap-4 p-5 rounded-2xl ${currentTheme.featureCard} border transition-all duration-300`}
              >
                <div className={`p-3 rounded-xl ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${currentTheme.text.primary} mb-1`}>{item.label}</p>
                  <p className={`text-xs ${currentTheme.text.secondary}`}>{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* User Info Summary */}
          <div className={`p-5 rounded-2xl ${currentTheme.featureCard} mb-8`}>
            <p className={`text-xs font-bold uppercase tracking-widest ${currentTheme.text.secondary} mb-3`}>Paying as</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{userName}</p>
                <p className={`text-sm ${currentTheme.text.secondary} mt-1`}>{emailId}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 flex items-center justify-center text-white font-bold">
                {userName.charAt(0)}
              </div>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className={`p-4 ${theme === "dark" ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200"} border rounded-2xl flex items-center gap-3`}>
                  <AlertCircle size={20} className="text-red-500" />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                      {error}
                    </p>
                    {error.includes("cancelled") && (
                      <p className={`text-xs ${theme === "dark" ? "text-red-500/60" : "text-red-500/70"} mt-1`}>
                        You can retry the payment
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePayment}
            disabled={processingPayment || !sdkReady}
            className={`w-full relative group overflow-hidden ${processingPayment ? currentTheme.button.disabled : currentTheme.button.background} ${currentTheme.button.text} py-5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 shadow-xl disabled:cursor-not-allowed`}
          >
            <motion.div 
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
              }}
              animate={{
                x: ['0%', '100%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {processingPayment ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Processing Secure Payment...</span>
              </>
            ) : (
              <>
                <span>Pay ₹{amount.toLocaleString()} Now</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
          
          {/* Footer Note */}
          <div className="text-center mt-8">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="w-12 h-px bg-gray-400/30"></div>
              <p className={`text-xs ${currentTheme.text.secondary} font-medium uppercase tracking-tighter`}>
                Protected by Razorpay
              </p>
              <div className="w-12 h-px bg-gray-400/30"></div>
            </div>
            <p className={`text-xs ${currentTheme.text.secondary} opacity-60`}>
              Your payment details are encrypted and secure
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <p className={`text-sm ${currentTheme.text.secondary} mb-4`}>Accepted Payment Methods</p>
          <div className="flex items-center justify-center gap-6">
            {['Visa', 'Mastercard', 'Rupay', 'UPI'].map((method, i) => (
              <div key={i} className={`p-3 rounded-xl ${theme === "dark" ? "bg-white/5" : "bg-gray-100"} backdrop-blur-sm`}>
                <div className="text-xs font-semibold opacity-70">{method}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Support Info */}
        <div className={`text-center mt-8 ${currentTheme.text.secondary} text-xs`}>
          <p>Need help? Contact support@fitnestyle.com</p>
          <p className="mt-1 opacity-60">© 2024 FITNESTYLE. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
}
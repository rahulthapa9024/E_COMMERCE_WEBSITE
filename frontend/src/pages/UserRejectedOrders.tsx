import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import { motion } from "framer-motion";
import { XCircle, ChevronLeft, ShoppingCart, Trash2, Info, Calendar } from "lucide-react";

/* ---------------- TYPES ---------------- */
type RejectedProduct = {
  title: string;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  price: number;
};

type RejectedOrder = {
  ID: string;
  price: number;
  createdAt: string;
  products: RejectedProduct[];
  reason?: string; 
};

export default function UserRejectedOrders() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation(); // Used for route-change detection
  const emailId = user?.primaryEmailAddress?.emailAddress || null;
  const [orders, setOrders] = useState<RejectedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper for consistent date formatting
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase();
  };

  useEffect(() => {
    // Smooth scroll to top on route change
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!isLoaded) return;
    
    if (!emailId) {
      const timeout = setTimeout(() => {
        if (!user) navigate("/signup");
      }, 1000);
      return () => clearTimeout(timeout);
    }

    const fetchRejectedOrders = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/cart/getUserRejected", {
          params: { emailId },
        });
        
        // Locked strictly to res.data.rejectedOrder
        const data = res.data.rejectedOrder || [];
        setOrders(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error("Failed to fetch rejected orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedOrders();
  }, [isLoaded, emailId, navigate, user, pathname]); // pathname included for smooth trigger

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em]">Reviewing Logs</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6 sm:px-10">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-8 group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em]">Dashboard</span>
          </button>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            Cancelled <br />
            <span className="text-zinc-800">Orders</span>
          </h1>
          <div className="flex items-center gap-4 mt-8">
            <div className="h-[1px] w-12 bg-zinc-800" />
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em]">
              Archived: {orders.length} Unsuccessful Transactions
            </p>
          </div>
        </motion.div>

        {/* EMPTY STATE */}
        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 border border-zinc-900 rounded-[2rem] bg-zinc-950/30 text-center"
          >
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
              <XCircle className="text-zinc-700" size={28} />
            </div>
            <p className="text-zinc-500 uppercase tracking-widest text-xs mb-8 font-light">
              No rejected order history found
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-white text-black px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
            >
              Go To Store
            </button>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {orders.map((order, idx) => (
              <motion.div
                key={order.ID || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-500"
              >
                {/* STATUS BAR */}
                <div className="bg-zinc-900/50 px-6 py-3 border-b border-zinc-900 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Trash2 size={12} className="text-zinc-500" />
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400">
                      Transaction Voided
                    </span>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-medium">
                    Log Entry: {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="p-6 md:p-8">
                  {/* META DATA */}
                  <div className="flex flex-col md:flex-row justify-between mb-10 gap-8">
                    <div className="flex flex-wrap gap-10">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Internal Reference</p>
                        <p className="font-mono text-xs text-zinc-300">#VOID-{order.ID?.toUpperCase().slice(-8) || "UNKNOWN"}</p>
                      </div>
                      
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Ref. Date</p>
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Calendar size={12} className="text-zinc-600" />
                          <p className="text-[10px] font-bold tracking-widest">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 px-4 py-2 rounded-xl border border-dashed border-zinc-800">
                      <Info size={14} className="text-zinc-600" />
                      <p className="text-[9px] uppercase tracking-widest text-zinc-500 italic">
                        {order.reason || "Order was not processed"}
                      </p>
                    </div>
                  </div>

                  {/* PRODUCTS */}
                  <div className="space-y-6">
                    {order.products?.map((p, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-6 opacity-60 filter grayscale">
                        <div className="w-16 h-20 flex-shrink-0 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                          {p.image ? (
                            <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-800">N/A</div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-xs font-bold uppercase tracking-tight text-white mb-1 line-through opacity-50">{p.title}</h3>
                          <div className="flex gap-4 text-[9px] text-zinc-600 uppercase tracking-widest">
                            <span>Qty: {p.quantity}</span>
                            {p.size && <span>Size: {p.size}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER */}
                  <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between">
                    <div>
                      <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-white font-bold hover:underline"
                      >
                        <ShoppingCart size={12} /> Re-order Items
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-1">Voided Total</p>
                      <p className="text-xl font-black text-zinc-400 opacity-50 italic">₹{order.price?.toLocaleString() || "0"}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
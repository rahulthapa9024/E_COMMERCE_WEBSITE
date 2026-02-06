import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import { motion } from "framer-motion";
import { RefreshCcw, ChevronLeft, AlertCircle, ArrowLeftRight } from "lucide-react";

/* ---------------- TYPES ---------------- */
type ReturnedProduct = {
  title: string;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
};

type ReturnedOrder = {
  ID: string;
  price: number;
  createdAt: string;
  products: ReturnedProduct[];
};

export default function UserBeingReturned() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const emailId = user?.primaryEmailAddress?.emailAddress || null;

  const [orders, setOrders] = useState<ReturnedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!emailId) {
      navigate("/signup");
      return;
    }

    const fetchReturnedOrders = async () => {
      try {
        const res = await axiosClient.get("/cart/userBeingReturned", { params: { emailId } });
        setOrders(res.data.BeingReturned || []);
      } catch (err) {
        console.error("Failed to fetch returned orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturnedOrders();
  }, [isLoaded, emailId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em]">Processing Returns</p>
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
            Active <br />
            <span className="text-zinc-600">Returns</span>
          </h1>
          <div className="flex items-center gap-4 mt-8">
            <div className="h-[1px] w-12 bg-zinc-800" />
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em]">
              Status: {orders.length} Logged Reversals
            </p>
          </div>
        </motion.div>

        {/* EMPTY STATE */}
        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 border border-zinc-900 rounded-[2rem] bg-zinc-950/30"
          >
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
              <RefreshCcw className="text-zinc-700" size={28} />
            </div>
            <p className="text-zinc-500 uppercase tracking-widest text-xs mb-8 font-light">
              No return logistics in progress
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-white text-black px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
            >
              Back to Store
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, idx) => (
              <motion.div
                key={order.ID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500"
              >
                {/* STATUS BAR */}
                <div className="bg-white/5 px-6 py-3 border-b border-zinc-900 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white">
                      Processing Refund / Return
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-6 md:p-8">
                  {/* META */}
                  <div className="flex flex-col md:flex-row justify-between mb-10 gap-6">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Authorization ID</p>
                      <p className="font-mono text-xs text-zinc-200">RMA-{order.ID.toUpperCase().slice(-10)}</p>
                    </div>
                    <div className="flex items-center gap-4 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
                      <ArrowLeftRight size={14} className="text-white" />
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400">Inventory Re-entry</p>
                    </div>
                  </div>

                  {/* PRODUCTS */}
                  <div className="space-y-6">
                    {order.products.map((p, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-6">
                        <div className="w-20 h-24 flex-shrink-0 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                          {p.image ? (
                            <img 
                              src={p.image} 
                              alt={p.title} 
                              className="w-full h-full object-cover opacity-40 transition-all duration-700" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-800 uppercase font-bold">No Image</div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-sm font-bold uppercase tracking-tight text-white mb-1">{p.title}</h3>
                          <div className="flex gap-4 text-[10px] text-zinc-500 uppercase tracking-widest">
                            <span>Qty: {p.quantity}</span>
                            {p.size && <span>Size: {p.size}</span>}
                            {p.color && <span>Color: {p.color}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER */}
                  <div className="mt-10 pt-8 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-900 rounded-lg">
                        <AlertCircle size={16} className="text-zinc-500" />
                      </div>
                      <p className="text-[10px] text-zinc-500 max-w-[200px] leading-relaxed uppercase tracking-tighter">
                        Refund will be credited within 5-7 business days after inspection.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Return Value</p>
                      <p className="text-2xl font-black text-white">₹{order.price.toLocaleString()}</p>
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
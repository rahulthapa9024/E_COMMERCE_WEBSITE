import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import ShimmerPage from "../pages/ShimmerPage";
import { motion } from "framer-motion";
import { ChevronLeft, History, CheckCircle, Package } from "lucide-react";

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

export default function UserReturnedHistoryPage() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const emailId = user?.primaryEmailAddress?.emailAddress || "";

  const [orders, setOrders] = useState<ReturnedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { navigate("/signup"); return; }

    const fetchReturnedHistory = async () => {
      try {
        const res = await axiosClient.get("/cart/getUserReturnedHistory", { params: { emailId } });
        setOrders(res.data.UserReturned || []);
      } catch (err) {
        console.error("Failed to fetch returned history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturnedHistory();
  }, [isLoaded, user, emailId, navigate]);

  if (!isLoaded || loading) return <ShimmerPage />;

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
            <span className="text-[10px] uppercase tracking-[0.2em]">Profile</span>
          </button>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            Return <br />
            <span className="text-zinc-800">Archive</span>
          </h1>
          <div className="flex items-center gap-4 mt-8">
            <div className="h-[1px] w-12 bg-zinc-800" />
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em]">
              Resolved: {orders.length} Completed Reversals
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
              <History className="text-zinc-700" size={28} />
            </div>
            <p className="text-zinc-500 uppercase tracking-widest text-[10px] mb-8 font-light">
              No historical return data found
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-white text-black px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
            >
              Back to Store
            </button>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {orders.map((order, idx) => (
              <motion.div
                key={order.ID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-zinc-950/40 border border-zinc-900 rounded-[2rem] overflow-hidden hover:border-zinc-700 transition-all duration-500"
              >
                {/* STATUS HEADER */}
                <div className="px-8 py-4 bg-zinc-900/30 border-b border-zinc-900 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-zinc-500" />
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400">
                      Refund Finalized
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono tracking-tighter">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="p-8">
                  {/* META */}
                  <div className="flex flex-col md:flex-row justify-between mb-10 gap-6 items-start">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Receipt Number</p>
                      <p className="font-mono text-xs text-zinc-300">#{order.ID.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Refunded Amount</p>
                      <p className="text-2xl font-black text-white">₹{order.price.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* PRODUCTS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.products.map((p, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-5 p-4 bg-black/40 border border-zinc-900 rounded-2xl group/item">
                        <div className="w-16 h-20 flex-shrink-0 bg-zinc-900 rounded-xl overflow-hidden grayscale group-hover/item:grayscale-0 transition-all duration-700">
                          {p.image ? (
                            <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-800 uppercase font-black">N/A</div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-[11px] font-bold uppercase tracking-tight text-white mb-1">{p.title}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-zinc-500 uppercase tracking-widest">
                            <span>Qty: {p.quantity}</span>
                            {p.size && <span>Size: {p.size}</span>}
                            {p.color && <span>Color: {p.color}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* LOGISTICS NOTE */}
                  <div className="mt-8 pt-6 border-t border-zinc-900/50 flex items-center gap-3">
                    <Package size={14} className="text-zinc-700" />
                    <p className="text-[9px] text-zinc-600 uppercase tracking-[0.1em]">
                      Inventory reclaimed and transaction closed.
                    </p>
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
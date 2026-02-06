import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import { motion } from "framer-motion";
import { Truck, Package, MapPin, ChevronLeft, ArrowRight, Calendar } from "lucide-react";

/* ---------------- TYPES ---------------- */
type DeliveredProduct = {
  title: string;
  price: number;
  image?: string[];
  quantity: number;
  size?: string;
  color?: string;
};

type DeliveryOrder = {
  ID: string;
  products: DeliveredProduct[];
  price: number;
  createdAt: string; // This corresponds to your Mongoose 'createdAt' field
};

export default function UserBeingDeliveredPage() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const emailId = user?.primaryEmailAddress?.emailAddress;

  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to format the MongoDB ISO date string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!isLoaded || !emailId) return;

    const fetchBeingDelivered = async () => {
      try {
        const res = await axiosClient.get(
          `/auth/beingDelivered/${encodeURIComponent(emailId)}`
        );
        setOrders(res.data.beingDelivered || []);
      } catch (err: any) {
        console.log(error)
        setError("Failed to load delivery data");
      } finally {
        setLoading(false);
      }
    };

    fetchBeingDelivered();
  }, [isLoaded, emailId]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em]">Locating Shipments</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* TOP NAV & HEADER */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em]">Back</span>
          </button>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-4">
            Live <br />
            <span className="text-zinc-700">Deliveries</span>
          </h1>
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em]">
               {orders.length} Package{orders.length !== 1 ? "s" : ""} in Transit
             </p>
          </div>
        </motion.div>

        {/* EMPTY STATE */}
        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 border border-zinc-900 rounded-3xl bg-zinc-950/20"
          >
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
               <Package className="text-zinc-700" size={28} />
            </div>
            <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs mb-8">
              No active shipments at this time
            </p>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
            >
             Start Shopping
            </button>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {orders.map((order, idx) => (
              <motion.div
                key={order.ID}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative group bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden hover:border-zinc-700 transition-colors"
              >
              

                <div className="p-6 md:p-8">
                  {/* ORDER HEADER */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div className="flex flex-wrap gap-8">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Order ID</p>
                        <p className="font-mono text-sm tracking-tighter text-zinc-200">#{order.ID.toUpperCase()}</p>
                      </div>
                      
                      {/* DATE SECTION */}
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Placed On</p>
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-zinc-600" />
                          <p className="text-sm font-bold tracking-tight text-zinc-200">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                        
                        <div className="h-10 w-px bg-zinc-800 hidden md:block" />
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Total Value</p>
                          <p className="text-xl font-black">₹{order.price.toLocaleString()}</p>
                        </div>
                    </div>
                  </div>

                  {/* PRODUCTS LIST */}
                  <div className="space-y-6">
                    {order.products.map((p, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-6 group/item">
                        <div className="w-20 h-24 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800">
                          {p.image?.[0] ? (
                            <img src={p.image[0]} className="w-full h-full object-cover  group-hover/item:grayscale-0 transition-all duration-500" alt={p.title} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-700">NO IMG</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold uppercase tracking-tight mb-2">{p.title}</h3>
                          <div className="flex gap-4 text-[10px] text-zinc-500 uppercase tracking-widest">
                            <span>Qty: {p.quantity}</span>
                            {p.size && <span>Size: {p.size}</span>}
                            {p.color && <span>Color: {p.color}</span>}
                          </div>
                        </div>
                        <div className="text-sm font-light text-zinc-400">
                          ₹{p.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* JOURNEY LOG */}
                  <div className="mt-12 pt-8 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4 text-zinc-400">
                       <Package size={16} />
                       <span className="text-[10px] uppercase tracking-widest">Order Processed</span>
                       <ArrowRight size={12} className="text-zinc-800" />
                    </div>
                    <div className="flex items-center gap-4 text-white font-bold">
                       <Truck size={16} />
                       <span className="text-[10px] uppercase tracking-widest">In Transit</span>
                       <ArrowRight size={12} className="text-zinc-800" />
                    </div>
                    <div className="flex items-center gap-4 text-zinc-600">
                       <MapPin size={16} />
                       <span className="text-[10px] uppercase tracking-widest">Final Destination</span>
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
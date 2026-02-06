import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../utils/axiosClient";
import { 
  ChevronLeft, ChevronRight, Receipt, CheckCircle2, Loader2, 
  Calendar, XCircle, Phone, AlertTriangle,
  ShoppingBag
} from "lucide-react";

/* ---------------- TYPES ---------------- */
interface Order {
  ID: string;
  emailId: string;
  displayName?: string;
  price: number;
  orderDate: string;
  phoneNo?: string;
  address: {
    houseNo?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  products: any[];
}

/* ---------------- REJECT CONFIRMATION COMPONENT ---------------- */
const RejectModal = ({ order, onConfirm, onClose, processing }: { 
  order: Order | null; 
  onConfirm: () => void; 
  onClose: () => void; 
  processing: boolean;
}) => (
  <AnimatePresence>
    {order && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2 text-white">Reject Order?</h2>
            <p className="text-zinc-500 text-[11px] leading-relaxed mb-8 px-4 uppercase tracking-wider">
              Rejecting order <span className="text-zinc-200 font-mono">#{order.ID.slice(-6).toUpperCase()}</span> will remove it from the active queue.
            </p>

            <div className="w-full space-y-3">
              <button
                onClick={onConfirm}
                disabled={processing}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
              >
                {processing ? <Loader2 className="animate-spin" size={14} /> : <XCircle size={14} />}
                Confirm Rejection
              </button>
              <button
                onClick={onClose}
                disabled={processing}
                className="w-full py-4 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

/* ---------------- MAIN COMPONENT ---------------- */
export default function NewOrdersCondensed() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [orderToReject, setOrderToReject] = useState<Order | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchOrders = async (pageNo: number) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/payment/adminUserOrders/${pageNo}`);
      setOrders(res.data.adminCart || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) { 
        console.error("Fetch failed"); 
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { fetchOrders(page); }, [page]);

  const handleDeliver = async (orderId: string, email: string) => {
    setProcessingId(orderId);
    try {
      const res = await axiosClient.patch(`/payment/productDelivered/${orderId}/${encodeURIComponent(email)}`);
      if (res.data.success) {
        setOrders(prev => prev.filter(o => o.ID !== orderId));
        // If the page is now empty and there are more pages, fetch again
        if (orders.length <= 1 && page < totalPages) fetchOrders(page);
      }
    } catch (err: any) { 
        alert(err.response?.data?.message || "Action failed"); 
    } finally { 
        setProcessingId(null); 
    }
  };

  const handleReject = async () => {
    if (!orderToReject) return;
    setProcessingId(orderToReject.ID);
    try {
      const res = await axiosClient.post(`/cart/rejectOrder`, { 
        Pid: orderToReject.ID, 
        userEmail: orderToReject.emailId 
      });
      if (res.data.success) {
        setOrders(prev => prev.filter(o => o.ID !== orderToReject.ID));
        setOrderToReject(null);
      }
    } catch (err: any) { 
        alert(err.response?.data?.message || "Reject failed"); 
    } finally { 
        setProcessingId(null); 
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 selection:bg-white selection:text-black">
      
      <RejectModal 
        order={orderToReject} 
        onConfirm={handleReject} 
        onClose={() => setOrderToReject(null)} 
        processing={!!processingId} 
      />

      <div className="max-w-6xl mx-auto" ref={scrollRef}>
        
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 mb-1 font-bold">Logistics Queue</p>
            <h1 className="text-4xl font-black uppercase tracking-tighter">
                Incoming <span className="text-zinc-800">Orders</span>
            </h1>
          </div>
          {!loading && orders.length > 0 && (
            <div className="text-right hidden sm:block">
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Queue Index</p>
               <p className="text-2xl font-mono text-zinc-400 font-bold">{page} / {totalPages}</p>
            </div>
          )}
        </div>

        <div className="grid gap-4 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-32">
              <Loader2 className="animate-spin text-zinc-800" size={40} />
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-600">Retrieving Live Queue</p>
            </div>
          ) : orders.length === 0 ? (
            /* EMPTY STATE */
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-40 border border-dashed border-white/5 rounded-[3.5rem] bg-zinc-900/5"
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
                <ShoppingBag size={32} className="text-zinc-700" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-500">Queue Clear</h3>
              <p className="text-zinc-700 text-[10px] uppercase tracking-[0.2em] mt-2 font-bold text-center max-w-[250px] leading-relaxed">
                All incoming orders have been processed or rejected.
              </p>
              <button 
                onClick={() => fetchOrders(1)}
                className="mt-8 px-8 py-3 bg-zinc-800 hover:bg-white hover:text-black transition-all rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                Sync Database
              </button>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {orders.map((order) => (
                <motion.div
                  layout key={order.ID}
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.98, x: -20 }}
                  className="bg-zinc-900/10 border border-white/5 rounded-3xl overflow-hidden hover:bg-zinc-900/20 transition-colors group"
                >
                  {/* 1. Meta Bar */}
                  <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                         <Receipt size={12} className="text-zinc-600" />
                         <span className="text-[10px] font-mono text-zinc-500 font-bold group-hover:text-zinc-300">#{order.ID.toUpperCase()}</span>
                      </div>
                      <div className="h-3 w-[1px] bg-zinc-800" />
                      <span className="text-[10px] font-bold uppercase tracking-tight flex items-center gap-1.5 text-zinc-500">
                        <Calendar size={11} className="text-zinc-700" /> 
                        {new Date(order.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest px-2 py-0.5 border border-white/5 rounded-full">Pending Action</span>
                      <span className="text-xl font-black tracking-tighter text-zinc-200">₹{order.price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 2. Content Body */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Customer Info */}
                    <div className="space-y-5">
                      <div>
                        <span className="text-[9px] uppercase font-black text-zinc-600 block mb-2 tracking-widest">Customer Details</span>
                        <p className="text-xs font-bold text-zinc-100">{order.displayName || "Guest Profile"}</p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate mt-1">{order.emailId}</p>
                        <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-zinc-400 font-mono">
                           <Phone size={10} className="text-zinc-700"/> {order.phoneNo || "No Contact"}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <span className="text-[9px] uppercase font-black text-zinc-600 block mb-2 tracking-widest">Logistics</span>
                        <p className="text-[11px] leading-relaxed text-zinc-400">
                          <span className="text-zinc-100 font-bold">{order.address.houseNo}</span>, {order.address.streetAddress}<br/>
                          {order.address.city}, {order.address.state} <span className="text-zinc-600 font-mono text-[9px]">[{order.address.postalCode}]</span>
                        </p>
                      </div>
                    </div>

                    {/* Product Manifest */}
                    <div className="md:col-span-1 md:border-l border-white/5 md:pl-8">
                      <span className="text-[9px] uppercase font-black text-zinc-600 block mb-3 tracking-widest">Item Manifest</span>
                      <div className="max-h-[140px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {order.products.map((p: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/5">
                            <img src={p.image} className="w-10 h-12 object-cover rounded-lg bg-zinc-800 opacity-70 group-hover:opacity-100 transition-opacity" />
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase truncate text-zinc-200">{p.title}</p>
                              <p className="text-[9px] text-zinc-600 font-black uppercase mt-0.5">Qty {p.quantity} <span className="mx-1">/</span> {p.size || 'STD'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dual Actions */}
                    <div className="flex flex-col justify-center gap-3 md:pl-8 md:border-l border-white/5">
                      <button 
                        onClick={() => handleDeliver(order.ID, order.emailId)}
                        disabled={!!processingId}
                        className="w-full h-12 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-20 shadow-xl"
                      >
                        {processingId === order.ID ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle2 size={14}/>}
                        Confirm Delivery
                      </button>
                      <button 
                        onClick={() => setOrderToReject(order)}
                        disabled={!!processingId}
                        className="w-full h-12 border border-white/5 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600/10 hover:text-red-500 hover:border-red-500/50 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle size={14}/> Reject Order
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Navigation */}
        {!loading && orders.length > 0 && totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-12 border-t border-white/5 pt-12">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p-1))} 
              className="p-3 text-zinc-600 hover:text-white transition-colors disabled:opacity-20"
            >
                <ChevronLeft size={28}/>
            </button>
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-800 mb-1">Queue Control</p>
              <p className="text-sm font-mono text-zinc-500 font-bold">
                PAGE {page} <span className="text-zinc-800 mx-2">OF</span> {totalPages}
              </p>
            </div>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p+1))} 
              className="p-3 text-zinc-600 hover:text-white transition-colors disabled:opacity-20"
            >
                <ChevronRight size={28}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
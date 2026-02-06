import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../utils/axiosClient";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  RotateCcw,
  AlertTriangle,
  Phone,
  Receipt,
  Inbox
} from "lucide-react";
import { useLocation } from "react-router-dom";

/* ---------------- TYPES ---------------- */
interface Product {
  title: string;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface Address {
  houseNo?: string;
  landmark?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

interface AdminHistoryItem {
  emailId: string;
  products: Product[];
  price: number;
  address?: Address;
  phoneNo?: string;
  displayName?: string;
  orderDate?: string;
  ID: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

interface ApiResponse {
  success: boolean;
  adminHistory: AdminHistoryItem[];
  pagination: Pagination;
}

/* ---------------- CONFIRMATION MODAL ---------------- */
const ConfirmationModal = ({ 
  isOpen, onClose, onConfirm, orderId, isProcessing 
}: { 
  isOpen: boolean; onClose: () => void; onConfirm: () => void; orderId: string; isProcessing: boolean;
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/95 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl text-center"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-red-500/20">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter mb-2 text-white">Revert Delivery?</h2>
          <p className="text-zinc-500 text-[11px] mb-8 leading-relaxed uppercase tracking-wider">
            Move order <span className="text-white font-mono">#{orderId.slice(-6).toUpperCase()}</span> back to the active queue?
          </p>
          <div className="space-y-3">
            <button 
              onClick={onConfirm} 
              disabled={isProcessing} 
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={14}/> : <RotateCcw size={14}/>} Confirm Rollback
            </button>
            <button 
              onClick={onClose} 
              className="w-full py-4 bg-zinc-800 text-zinc-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

/* ---------------- MAIN COMPONENT ---------------- */
export default function History() {
  const [history, setHistory] = useState<AdminHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminHistoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [pathname]);

  const fetchHistory = async (pageNo: number) => {
    setLoading(true);
    try {
      const res = await axiosClient.get<ApiResponse>(`/payment/getAdminHistory?page=${pageNo}`);
      if (res.data.success) {
        setHistory(res.data.adminHistory);
        setPagination(res.data.pagination);
      }
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchHistory(page); }, [page]);

  const handleRollback = async () => {
    if (!selectedOrder) return;
    setProcessingId(selectedOrder.ID);
    try {
      const res = await axiosClient.patch(
        `/cart/productNotDelivered/${selectedOrder.ID}/${encodeURIComponent(selectedOrder.emailId)}`
      );
      if (res.data.success) {
        // Refresh the current page view
        await fetchHistory(page);
        setIsModalOpen(false);
      }
    } catch (err) {
      alert("Failed to revert order status");
    } finally {
      setProcessingId(null);
      setSelectedOrder(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 md:px-8 py-24">
      <ConfirmationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleRollback} 
        orderId={selectedOrder?.ID || ""} 
        isProcessing={!!processingId} 
      />

      <div className="max-w-6xl mx-auto" ref={scrollRef}>
        <header className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-500 mb-1 font-bold">Logistics Archive</p>
            <h1 className="text-5xl font-black uppercase tracking-tighter">History <span className="text-zinc-800">Logs</span></h1>
          </div>
          {!loading && pagination && pagination.totalCount > 0 && (
            <div className="hidden md:block text-right">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Lifetime Resolved</p>
              <p className="text-3xl font-mono font-bold text-zinc-400">{pagination.totalCount}</p>
            </div>
          )}
        </header>

        <div className="space-y-4">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-zinc-800" size={40} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Syncing Records</p>
            </div>
          ) : history.length === 0 ? (
            /* EMPTY STATE */
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-40 border border-dashed border-white/5 rounded-[3rem] bg-zinc-900/5"
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
                <Inbox size={32} className="text-zinc-700" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-400">Archive Clear</h3>
              <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] mt-2 font-bold text-center max-w-[200px]">
                No processed orders found in the history vault.
              </p>
              <button 
                onClick={() => fetchHistory(1)}
                className="mt-8 px-8 py-3 bg-zinc-800 hover:bg-white hover:text-black transition-all rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <RotateCcw size={12} /> Refresh Data
              </button>
            </motion.div>
          ) : (
            history.map((order) => (
              <motion.div 
                layout 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                key={order.ID} 
                className="bg-zinc-900/10 border border-white/5 rounded-3xl overflow-hidden hover:bg-zinc-900/20 transition-colors group"
              >
                {/* Card Meta Header */}
                <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Receipt size={12} className="text-zinc-600" />
                      <span className="text-[10px] font-mono text-zinc-500 font-bold group-hover:text-zinc-300 transition-colors">#{order.ID.toUpperCase()}</span>
                    </div>
                    <div className="h-3 w-[1px] bg-zinc-800" />
                    <span className="text-[10px] font-bold uppercase tracking-tight flex items-center gap-1.5 text-zinc-500">
                      <Calendar size={10} /> 
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] text-emerald-500/60 uppercase font-black tracking-widest border border-emerald-500/20 px-2 py-0.5 rounded-full bg-emerald-500/5">Resolved</span>
                    <span className="text-xl font-black tracking-tighter text-zinc-200">₹{order.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Main Info Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* 1. Customer & Logistics */}
                  <div className="space-y-5">
                    <div>
                      <span className="text-[9px] uppercase font-black text-zinc-600 block mb-2 tracking-widest">Customer Profile</span>
                      <p className="text-xs font-bold text-zinc-200">{order.displayName || "Guest User"}</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate mt-1">{order.emailId}</p>
                      <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-zinc-400 font-mono">
                         <Phone size={10} className="text-zinc-700"/> {order.phoneNo || "N/A"}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <span className="text-[9px] uppercase font-black text-zinc-600 block mb-2 tracking-widest">Logistics</span>
                      <p className="text-[11px] leading-relaxed text-zinc-400 font-medium">
                        {order.address?.houseNo}, {order.address?.streetAddress}<br/>
                        {order.address?.city}, {order.address?.state} <span className="text-zinc-600 font-mono text-[9px]">[{order.address?.postalCode}]</span>
                      </p>
                    </div>
                  </div>

                  {/* 2. Product Manifest */}
                  <div className="md:col-span-1 md:border-l border-white/5 md:pl-8">
                    <span className="text-[9px] uppercase font-black text-zinc-600 block mb-4 tracking-widest">Product Manifest</span>
                    <div className="max-h-[140px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                      {order.products.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/5">
                          <img src={p.image} alt="" className="w-10 h-12 object-cover rounded-lg bg-zinc-800 opacity-60 group-hover:opacity-100 transition-opacity" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase truncate text-zinc-300">{p.title}</p>
                            <p className="text-[9px] text-zinc-600 font-black uppercase mt-0.5">Qty {p.quantity} <span className="mx-1">/</span> {p.size || 'STD'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Actions */}
                  <div className="flex flex-col justify-center items-end md:pl-8 md:border-l border-white/5">
                    <div className="w-full space-y-3">
                       <div className="text-center p-3 border border-white/5 rounded-2xl bg-zinc-900/30">
                          <p className="text-[9px] uppercase font-black text-zinc-500 tracking-tighter">Status</p>
                          <p className="text-[10px] uppercase font-black text-zinc-400">Delivered</p>
                       </div>
                       <button 
                        onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                        className="w-full h-12 border border-white/5 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <RotateCcw size={14} className="group-hover/btn:rotate-[-45deg] transition-transform" /> Revert to New
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination Navigation */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-12 border-t border-white/5 pt-12">
            <button 
              disabled={page === 1}
              onClick={() => { setPage(p => Math.max(1, p-1)); }} 
              className="p-3 text-zinc-600 hover:text-white transition-colors disabled:opacity-20"
            >
              <ChevronLeft size={28}/>
            </button>
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-1">Vault Navigation</p>
              <p className="text-sm font-mono text-zinc-500 font-bold">
                <span className="text-white">{page}</span> <span className="text-zinc-800 mx-2">/</span> {pagination.totalPages}
              </p>
            </div>
            <button 
              disabled={page === pagination.totalPages}
              onClick={() => { setPage(p => Math.min(pagination.totalPages, p+1)); }} 
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
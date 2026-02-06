import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../utils/axiosClient";
import { 
  History, 
  User, 
  MapPin, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  IndianRupee,
  Clock,
  ShieldCheck
} from "lucide-react";
import { useLocation } from "react-router-dom";

/* ================= TYPES ================= */
type Product = {
  title?: string;
  quantity?: number;
  size?: string;
  color?: string;
  image?: string;
};

type Address = {
  houseNo?: string;
  landmark?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

type AdminReturnedOrder = {
  emailId?: string;
  products?: Product[];
  price?: number;
  address?: Address;
  phoneNo?: string;
  displayName?: string;
  orderDate?: string;
  ID?: string;
  dateString?: string;
  AccountNo?: number;
  IFSCcode?: string;
  AccountHolderName?: string;
  BankName?: string;
  UPIid?: string;
  UserName?: string;
};

type ApiResponse = {
  success: boolean;
  totalItems?: number;
  page?: number;
  totalPages?: number;
  count?: number;
  adminReturnedCart?: AdminReturnedOrder[];
};

export default function AdminReturnedOrders() {
  const [orders, setOrders] = useState<AdminReturnedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Reduced for better UX per page
  const [totalPages, setTotalPages] = useState(1);
const {pathname} = useLocation()
  const fetchReturnedOrders = async (pageNo: number) => {
    try {
      setLoading(true);
      const res = await axiosClient.get<ApiResponse>(`/cart/getAdminReturnedHistory`, {
        params: { page: pageNo, limit },
      });
      if (res.data.success) {
        setOrders(res.data.adminReturnedCart ?? []);
        setTotalPages(res.data.totalPages ?? 1);
      }
    } catch (err) {
      console.error("Ledger Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  useEffect(() => {
    fetchReturnedOrders(page);
  }, [page]);

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 md:px-8 py-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[1px] w-8 bg-zinc-700" />
              <span className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-bold">Financial Audit</span>
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">
              Return <span className="text-zinc-700">Ledger</span>
            </h1>
          </motion.div>

          <div className="flex items-center gap-4 bg-zinc-900/40 p-2 rounded-2xl border border-white/5">
            <button 
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="p-3 hover:bg-white hover:text-black rounded-xl transition-all disabled:opacity-20"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest px-4">
              System Page {page} <span className="text-zinc-600">/ {totalPages}</span>
            </span>
            <button 
              disabled={page === totalPages || loading}
              onClick={() => setPage(p => p + 1)}
              className="p-3 hover:bg-white hover:text-black rounded-xl transition-all disabled:opacity-20"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 w-full bg-zinc-900/20 animate-pulse rounded-[2rem] border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {orders.map((order, index) => (
                <motion.div
                  key={order.ID ?? index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-zinc-900/10 border border-white/5 rounded-[2.5rem] p-8 hover:border-white/10 transition-all overflow-hidden relative"
                >
                  {/* Status Watermark */}
                  <ShieldCheck className="absolute -right-8 -top-8 w-40 h-40 text-white/[0.02] group-hover:text-emerald-500/[0.03] transition-colors" />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                    
                    {/* section 1: Identity */}
                    <div className="lg:col-span-3 space-y-6 border-r border-white/5 pr-4">
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-zinc-600 font-black flex items-center gap-2 mb-2">
                          <User size={10} /> Originator
                        </label>
                        <h3 className="text-lg font-black uppercase tracking-tight truncate">{order.displayName || "ANONYMOUS"}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">{order.emailId}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{order.phoneNo}</p>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-zinc-600 font-black flex items-center gap-2 mb-2">
                          <Clock size={10} /> Timestamp
                        </label>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                          {order.dateString || order.orderDate || "PENDING"}
                        </p>
                        <p className="text-[9px] text-zinc-600 mt-1 uppercase font-black">ID: {order.ID?.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>

                    {/* Section 2: Manifest (Products) */}
                    <div className="lg:col-span-4 space-y-4">
                      <label className="text-[9px] uppercase tracking-widest text-zinc-600 font-black flex items-center gap-2">
                        <Package size={10} /> Asset Manifest
                      </label>
                      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                        {order.products?.map((p, i) => (
                          <div key={i} className="flex items-center gap-4 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                            <img src={p.image} className="w-12 h-12 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider line-clamp-1">{p.title}</p>
                              <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                                UNIT: {p.quantity} | {p.size} | {p.color}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 3: Logistics & Settlement */}
                    <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Address */}
                      <div className="space-y-3">
                        <label className="text-[9px] uppercase tracking-widest text-zinc-600 font-black flex items-center gap-2">
                          <MapPin size={10} /> Terminal
                        </label>
                        <p className="text-[10px] leading-relaxed text-zinc-400 font-medium uppercase tracking-wider">
                          {order.address?.houseNo}, {order.address?.streetAddress},<br />
                          {order.address?.city}, {order.address?.state} - {order.address?.postalCode}
                        </p>
                      </div>

                      {/* Refund Settlement */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] uppercase tracking-widest text-zinc-600 font-black flex items-center gap-2">
                            <CreditCard size={10} /> Settlement
                          </label>
                          <span className="text-xs font-black text-emerald-500 flex items-center">
                            <IndianRupee size={10} strokeWidth={3} /> {order.price}
                          </span>
                        </div>
                        
                        <div className="bg-zinc-900/60 rounded-2xl p-4 border border-white/5 space-y-1">
                          {order.UPIid ? (
                            <p className="text-[10px] font-mono text-zinc-300">UPI: <span className="text-white">{order.UPIid}</span></p>
                          ) : (
                            <>
                              <p className="text-[9px] font-mono text-zinc-500 tracking-tighter">BANK: {order.BankName}</p>
                              <p className="text-[10px] font-mono text-white tracking-tighter">ACC: {order.AccountNo}</p>
                              <p className="text-[9px] font-mono text-zinc-500 tracking-tighter uppercase">IFSC: {order.IFSCcode}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-40 border border-dashed border-white/10 rounded-[3rem]">
            <History className="mx-auto w-12 h-12 text-zinc-800 mb-4" />
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">No records found in current sequence</h3>
          </div>
        )}
      </div>
    </div>
  );
}
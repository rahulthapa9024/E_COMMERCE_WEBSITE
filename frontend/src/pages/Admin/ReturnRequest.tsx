import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../utils/axiosClient";
import {
  ChevronLeft, ChevronRight, Phone,
  CheckCircle2,Loader2, 
  CreditCard, Calendar,
  RefreshCcw
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type Product = { title: string; quantity: number; size: string; color: string; image: string; };
type Address = { houseNo: string; landmark: string; streetAddress: string; city: string; state: string; postalCode: string; };

type ReturnedOrder = {
  emailId: string; products: Product[]; price: number; address: Address;
  phoneNo: string; displayName: string; orderDate: string; ID: string;
  AccountNo?: number; IFSCcode?: string; AccountHolderName?: string;
  BankName?: string; UPIid?: string; UserName?: string;
  dateString?: string;
};

/* ---------------- APPROVE CONFIRMATION MODAL ---------------- */
const ApproveModal = ({ order, onConfirm, onClose, processing }: { 
  order: ReturnedOrder | null; 
  onConfirm: () => void; 
  onClose: () => void; 
  processing: boolean;
}) => (
  <AnimatePresence>
    {order && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-emerald-500/20">
            <CheckCircle2 className="text-emerald-500" size={32} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter mb-2 text-white">Approve Refund?</h2>
          <p className="text-zinc-500 text-[11px] mb-8 leading-relaxed uppercase tracking-wider">
            Confirming refund of <span className="text-emerald-400 font-bold">₹{order.price.toLocaleString()}</span> for <span className="text-white font-mono">#{order.ID.slice(-6).toUpperCase()}</span>.
          </p>
          <div className="space-y-3">
            <button onClick={onConfirm} disabled={processing} className="w-full py-4 bg-white text-black hover:bg-emerald-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              {processing ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} Confirm Success
            </button>
            <button onClick={onClose} disabled={processing} className="w-full py-4 bg-zinc-800 text-zinc-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors">Cancel</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);



export default function ReturnRequest() {
  const [orders, setOrders] = useState<ReturnedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [orderToApprove, setOrderToApprove] = useState<ReturnedOrder | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReturnedOrders = async (pageNo: number) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/cart/adminReturnRequest?page=${pageNo}`);
      if (res.data?.success) {
        setOrders(res.data.adminreturnedCart ?? []);
        setTotalPages(res.data.totalPages ?? 1);
        setTotalCount(res.data.totalCount ?? 0);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchReturnedOrders(page); }, [page]);

  const handleAcceptConfirm = async () => {
    if (!orderToApprove) return;
    setProcessingId(orderToApprove.ID);
    try {
      const res = await axiosClient.patch("/cart/productReturnedSuccessFully", {
        ID: orderToApprove.ID,
        emailId: orderToApprove.emailId,
      });
      if (res.data.success) {
        setOrders(prev => prev.filter(o => o.ID !== orderToApprove.ID));
        setOrderToApprove(null);
        if (orders.length <= 1 && page < totalPages) fetchReturnedOrders(page);
      }
    } catch (err) { alert("Accept failed"); } finally { setProcessingId(null); }
  };



  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 md:px-8 py-24 selection:bg-white selection:text-black">
      
      <ApproveModal 
        order={orderToApprove} 
        onConfirm={handleAcceptConfirm} 
        onClose={() => setOrderToApprove(null)} 
        processing={!!processingId} 
      />


      <div className="max-w-7xl mx-auto">
        <header className="flex items-end justify-between mb-12 border-b border-white/5 pb-8">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-500 mb-1 font-bold">Reverse Logistics</p>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Return <span className="text-zinc-800">Requests</span></h1>
          </div>
          {!loading && orders.length > 0 && (
            <div className="text-right hidden sm:block">
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Queue Size</p>
               <p className="text-2xl font-mono text-zinc-400 font-bold">{totalCount || orders.length}</p>
            </div>
          )}
        </header>

        {loading ? (
          <div className="flex flex-col items-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-zinc-800" />
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-600">Syncing Request Data</p>
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40 border border-dashed border-white/5 rounded-[3.5rem] bg-zinc-900/5">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-white/5"><RefreshCcw size={32} className="text-zinc-700" /></div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-500">Vault Clear</h3>
            <p className="text-zinc-700 text-[10px] uppercase tracking-[0.2em] mt-2 font-bold">No return requests pending.</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6">
            <AnimatePresence mode="popLayout">
              {orders.map(order => (
                <motion.div key={order.ID} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -20 }} className="bg-zinc-900/10 border border-white/5 rounded-3xl p-6 hover:bg-zinc-900/20 transition-all group">
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* CUSTOMER & LOGISTICS */}
                    <div className="xl:col-span-3 space-y-5">
                      <div>
                        <span className="text-[9px] uppercase font-black text-zinc-600 block mb-2 tracking-widest">Customer</span>
                        <p className="text-xs font-black uppercase text-zinc-100">{order.displayName || order.UserName || "Guest"}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mb-2">#{order.ID.toUpperCase()}</p>
                        <p className="text-[11px] text-zinc-400 flex items-center gap-2 font-mono"><Phone size={11} className="text-zinc-700"/> {order.phoneNo}</p>
                      </div>
                      <div className="pt-5 border-t border-white/5">
                        <div className="text-[11px] text-zinc-400">
                          <p className="font-bold text-emerald-500/80 uppercase text-[9px] mb-2 tracking-widest">Pickup Address</p>
                          <p className="text-zinc-300">{order.address.houseNo}, {order.address.streetAddress}</p>
                          <p>{order.address.city}, {order.address.state} <span className="text-zinc-600 font-mono text-[9px]">[{order.address.postalCode}]</span></p>
                        </div>
                      </div>
                    </div>

                    {/* REFUND CHANNEL */}
                    <div className="xl:col-span-3 bg-white/[0.02] rounded-2xl p-5 border border-white/5 relative">
                      <p className="text-[9px] font-black uppercase text-zinc-500 mb-4 tracking-widest flex items-center gap-2"><CreditCard size={10}/> Refund Channel</p>
                      {order.UPIid ? (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                          <p className="text-[9px] uppercase text-emerald-500/60 font-black mb-1">UPI</p>
                          <p className="text-xs font-mono text-emerald-400 truncate">{order.UPIid}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div><p className="text-[9px] uppercase text-zinc-600 font-bold">Holder</p><p className="text-[10px] font-bold text-zinc-300">{order.AccountHolderName}</p></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-[9px] uppercase text-zinc-600 font-bold">Bank</p><p className="text-[10px] text-zinc-400">{order.BankName}</p></div>
                            <div><p className="text-[9px] uppercase text-zinc-600 font-bold">IFSC</p><p className="text-[10px] font-mono text-zinc-400">{order.IFSCcode}</p></div>
                          </div>
                          <div><p className="text-[9px] uppercase text-zinc-600 font-bold">Account</p><p className="text-xs font-mono text-zinc-200">{order.AccountNo}</p></div>
                        </div>
                      )}
                    </div>

                    {/* MANIFEST */}
                    <div className="xl:col-span-4 space-y-4">
                      <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Returned Manifest</p>
                      <div className="grid gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {order.products.map((p, i) => (
                          <div key={i} className="flex gap-4 bg-white/[0.02] p-2.5 rounded-2xl border border-white/5">
                            <img src={p.image} className="w-10 h-14 rounded-lg object-cover bg-zinc-800 opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                            <div className="flex flex-col justify-center min-w-0">
                              <p className="text-[10px] font-bold uppercase text-zinc-200 truncate">{p.title}</p>
                              <p className="text-[9px] text-zinc-500 font-black uppercase mt-1">Size: {p.size} <span className="mx-1 text-zinc-800">|</span> Qty: {p.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TOTAL & ACTIONS */}
                    <div className="xl:col-span-2 flex flex-col justify-between items-end xl:border-l border-white/5 xl:pl-8">
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-black text-zinc-600 tracking-widest block mb-1">Refund Due</span>
                        <p className="text-3xl font-black tracking-tighter text-zinc-100">₹{order.price.toLocaleString()}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center justify-end gap-1.5"><Calendar size={10}/> {new Date(order.orderDate).toLocaleDateString('en-GB')}</p>
                      </div>
                      <div className="w-full space-y-3 mt-8">
                        <button onClick={() => setOrderToApprove(order)} disabled={!!processingId} className="w-full h-12 bg-white text-black hover:bg-emerald-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-20"><CheckCircle2 size={14}/> Approve Refund</button>

                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* PAGINATION */}
        {!loading && orders.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-12 mt-16 border-t border-white/5 pt-12">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="p-3 text-zinc-600 hover:text-white transition-colors disabled:opacity-20"><ChevronLeft size={28}/></button>
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-800 mb-1">Logistics Index</p>
              <p className="text-sm font-mono text-zinc-500 font-bold">{page} <span className="text-zinc-800 mx-2">/</span> {totalPages}</p>
            </div>
            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="text-zinc-500 hover:text-white transition-colors disabled:opacity-20"><ChevronRight size={28}/></button>
          </div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axiosClient from "../utils/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Calendar, 
  Hash, 
  RotateCcw, 
  Loader2, 
  AlertTriangle,
  X,
  CreditCard,
  QrCode
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ---------------- TYPES ---------------- */
type OrderProduct = {
  title: string;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
};

type PastOrder = {
  ID: string;
  price: number;
  createdAt: string;
  products: OrderProduct[];
};

/* ---------------- HELPERS ---------------- */
const isWithin7Days = (date: string) => {
  const delivered = new Date(date).getTime();
  const now = Date.now();
  const diffDays = (now - delivered) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
};

/* ---------------- MAIN COMPONENT ---------------- */
export default function UserOrderHistory() {
  const { user, isLoaded } = useUser();
  const emailId = user?.primaryEmailAddress?.emailAddress;
  const navigate = useNavigate();

  const [orders, setOrders] = useState<PastOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Return/Refund States
  const [returningId, setReturningId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PastOrder | null>(null);
  const [returnMethod, setReturnMethod] = useState<"BANK" | "UPI">("BANK");
  
  const [refundForm, setRefundForm] = useState({
    AccountNo: "",
    IFSCcode: "",
    AccountHolderName: "",
    BankName: "",
    UPIid: "",
    UserName: ""
  });

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    if (!isLoaded || !emailId) return;
    axiosClient
      .get(`/payment/getUserHistory/${encodeURIComponent(emailId)}`)
      .then(res => setOrders(res.data.data || []))
      .catch(err => setError(err.response?.data?.message || "Failed to load history"))
      .finally(() => setLoading(false));
  }, [isLoaded, emailId]);

  /* ---------------- RETURN ACTION ---------------- */
  const submitReturn = async () => {
    if (!selectedOrder || !emailId) return;

    // Clear irrelevant fields based on method before sending
    const payload = { ...refundForm };
    if (returnMethod === "BANK") {
      payload.UPIid = "";
      payload.UserName = "";
    } else {
      payload.AccountNo = "";
      payload.IFSCcode = "";
      payload.AccountHolderName = "";
      payload.BankName = "";
    }

    setReturningId(selectedOrder.ID);
    try {
      const res = await axiosClient.patch(
        `/cart/userMarkAsReturn/${selectedOrder.ID}`,
        payload,
        { params: { emailId } }
      );

      if (res.data.success) {
        setOrders(prev => prev.filter(o => o.ID !== selectedOrder.ID));
        setShowModal(false);
        setRefundForm({
          AccountNo: "", IFSCcode: "", AccountHolderName: "", 
          BankName: "", UPIid: "", UserName: ""
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Return initialization failed");
    } finally {
      setReturningId(null);
      setSelectedOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-black">Scanning Archives</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6 sm:px-10 lg:px-16 selection:bg-white selection:text-black">
      
      {/* REFUND MODAL */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="text-yellow-500" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tighter leading-none">Initialize Return</h2>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* METHOD SWITCHER */}
              <div className="flex p-1 bg-black border border-white/5 rounded-2xl mb-8">
                <button 
                  onClick={() => setReturnMethod("BANK")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${returnMethod === "BANK" ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                  <CreditCard size={14} /> Bank Account
                </button>
                <button 
                  onClick={() => setReturnMethod("UPI")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${returnMethod === "UPI" ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                  <QrCode size={14} /> UPI Transfer
                </button>
              </div>

              <div className="space-y-4">
              {returnMethod === "BANK" ? (
  <motion.div key="bank" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
    {/* Account Number & Bank Name */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-[9px] uppercase font-black text-zinc-600 ml-2">Bank Account Number</label>
        <input 
          type="text" 
          placeholder="Ex: 9120100456..." 
          className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-white focus:border-emerald-500/50 transition-colors outline-none" 
          onChange={e => setRefundForm(p => ({ ...p, AccountNo: e.target.value }))} 
        />
      </div>
      <div className="space-y-1">
        <label className="text-[9px] uppercase font-black text-zinc-600 ml-2">Bank Name</label>
        <input 
          type="text" 
          placeholder="Ex: HDFC, SBI, ICICI" 
          className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-white focus:border-emerald-500/50 transition-colors outline-none" 
          onChange={e => setRefundForm(p => ({ ...p, BankName: e.target.value }))} 
        />
      </div>
    </div>

    {/* IFSC & Holder Name */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-[9px] uppercase font-black text-zinc-600 ml-2">IFSC Code (11 Chars)</label>
        <input 
          type="text" 
          placeholder="Ex: HDFC0001234" 
          maxLength={11}
          className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-white uppercase focus:border-emerald-500/50 transition-colors outline-none" 
          onChange={e => setRefundForm(p => ({ ...p, IFSCcode: e.target.value }))} 
        />
        <p className="text-[8px] text-zinc-600 ml-2 italic">* 5th character is always 0 (Zero)</p>
      </div>
      <div className="space-y-1">
        <label className="text-[9px] uppercase font-black text-zinc-600 ml-2">Account Holder Name</label>
        <input 
          type="text" 
          placeholder="NAME AS PER BANK" 
          className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-white focus:border-emerald-500/50 transition-colors outline-none" 
          onChange={e => setRefundForm(p => ({ ...p, AccountHolderName: e.target.value }))} 
        />
      </div>
    </div>

    {/* visual guide for bank checks */}
    
    
    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
      <AlertTriangle className="text-emerald-500 shrink-0 mt-0.5" size={14} />
      <p className="text-[9px] text-emerald-500/70 leading-relaxed font-medium uppercase tracking-wider">
        Ensure your IFSC code is 11 digits and the 5th digit is a ZERO (0). Incorrect bank details may delay your refund by 5-7 business days.
      </p>
    </div>
  </motion.div>
) : (
                  <motion.div key="upi" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-zinc-600 ml-2">UPI ID</label>
                      <input type="text" placeholder="user@okaxis" className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-mono focus:border-white/20 outline-none" 
                        onChange={e => setRefundForm(p => ({ ...p, UPIid: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-zinc-600 ml-2">UPI Verified Name</label>
                      <input type="text" placeholder="DISPLAY NAME" className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-mono focus:border-white/20 outline-none" 
                        onChange={e => setRefundForm(p => ({ ...p, UserName: e.target.value }))} />
                    </div>
                  </motion.div>
                )}
              </div>

              <button
                onClick={submitReturn}
                disabled={returningId === selectedOrder.ID}
                className="mt-8 w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {returningId ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}
                Process Return Request
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[1px] w-8 bg-zinc-700" />
            <span className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-bold">Account Dashboard</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            Order <br /> <span className="text-zinc-700">History</span>
          </h1>
        </motion.div>

        {error ? (
          <div className="border border-red-900/30 bg-red-900/10 p-6 rounded-2xl text-red-400 text-xs uppercase tracking-widest">{error}</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-zinc-800 rounded-[2.5rem]">
            <ShoppingBag className="text-zinc-900 mb-6" size={64} />
            <p className="text-zinc-500 uppercase tracking-[0.3em] text-[10px] mb-8 font-bold text-center">Archive Empty</p>
            <button onClick={() => navigate("/")} className="bg-white text-black px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">Explore Collection</button>
          </div>
        ) : (
          <div className="grid gap-10">
            {orders.map((order, index) => {
              const eligible = isWithin7Days(order.createdAt);
              return (
                <motion.div
                  key={order.ID}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-zinc-950/50 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-white/10 transition-all"
                >
                  <div className="bg-white/[0.02] px-8 py-6 flex flex-wrap items-center justify-between gap-6 border-b border-white/5">
                    <div className="flex flex-wrap items-center gap-8">
                      <div>
                        <span className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-1"><Hash size={10} /> ID</span>
                        <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-tighter">#{order.ID.slice(-12)}</p>
                      </div>
                      <div className="w-px h-8 bg-white/5 hidden sm:block" />
                      <div>
                        <span className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-1"><Calendar size={10} /> Date</span>
                        <p className="text-xs text-zinc-300 font-bold uppercase tracking-tight">{new Date(order.createdAt).toDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {eligible && (
                        <button 
                          onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                          className="flex items-center gap-2 px-4 py-2 border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all"
                        >
                          <RotateCcw size={12} /> Return Order
                        </button>
                      )}
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Delivered</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      {order.products.map((p, idx) => (
                        <div key={idx} className="flex gap-6 items-center">
                          <div className="w-16 h-20 bg-zinc-900 rounded-xl overflow-hidden border border-white/5 flex-shrink-0">
                            {p.image ? <img src={p.image} className="w-full h-full object-cover grayscale opacity-70" /> : <ShoppingBag className="m-auto text-zinc-800" />}
                          </div>
                          <div>
                            <h3 className="text-xs font-black uppercase text-white mb-1">{p.title}</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Qty: {p.quantity} · {p.size || 'STD'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col justify-end items-end text-right">
                      <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-600 mb-1 font-black">Transaction Value</p>
                      <p className="text-4xl font-black text-white tracking-tighter">₹{order.price.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
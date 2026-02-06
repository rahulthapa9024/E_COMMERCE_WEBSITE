import { useState,useEffect } from "react";
import axiosClient from "../../utils/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  ShieldAlert,
  X
} from "lucide-react";
import { useLocation } from "react-router-dom";
export default function DeleteProduct() {
  const [title, setTitle] = useState("");
  const [verification, setVerification] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
const {pathname} = useLocation()
  // Safety check: Button only enables if checkbox is ticked AND title matches verification
  const isVerified = confirm && title.trim() === verification.trim() && title.length > 0;
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  const handleDelete = async () => {
    setError(null);
    setSuccess(null);

    if (!isVerified) return;

    try {
      setLoading(true);
      const res = await axiosClient.delete("/product/deleteProduct", {
        data: { title: title.trim() }
      });

      if (res.data.success) {
        setSuccess("Entity Purged from Database");
        setTitle("");
        setVerification("");
        setConfirm(false);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Purge Protocol Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 md:px-8 py-24 selection:bg-red-500 selection:text-white">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <header className="mb-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[1px] w-8 bg-red-900" />
              <span className="text-red-500 text-[10px] uppercase tracking-[0.4em] font-bold">Destructive Action</span>
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">
              Purge <span className="text-zinc-700">Product</span>
            </h1>
          </motion.div>
        </header>

        {/* Warning Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-950/10 border border-red-500/20 rounded-[2rem] p-8 mb-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldAlert size={80} />
          </div>
          <div className="relative z-10 flex gap-6">
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-red-500">Critical Warning</h3>
              <p className="text-xs text-zinc-500 leading-relaxed uppercase tracking-wider font-medium">
                Deleting an entity is <span className="text-red-400">irreversible</span>. This will remove the item from active orders, user wishlists, and global search indexes.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Step 1: Identification */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-600 ml-2">Target Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="EXISTING PRODUCT NAME"
              className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-5 text-sm font-bold tracking-widest focus:border-red-500/50 focus:outline-none transition-all placeholder:text-zinc-800"
            />
          </div>

          {/* Step 2: Confirmation String */}
          <AnimatePresence>
            {title.length > 2 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-600 ml-2">Confirm by typing title again</label>
                <input
                  type="text"
                  value={verification}
                  onChange={(e) => setVerification(e.target.value)}
                  placeholder="RE-TYPE TITLE TO VERIFY"
                  className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-5 text-sm font-bold tracking-widest focus:border-red-500 focus:outline-none transition-all placeholder:text-zinc-800"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Checkbox */}
          <label className="flex items-center gap-4 cursor-pointer group py-4">
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${confirm ? 'bg-red-500 border-red-500' : 'border-zinc-800 group-hover:border-zinc-600'}`}>
              <input
                type="checkbox"
                className="hidden"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
              />
              {confirm && <CheckCircle2 size={14} className="text-white" />}
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 group-hover:text-zinc-300 transition-colors">Confirm Permanent Deletion</span>
          </label>

          {/* Feedback */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500">
                <X size={14} />
                <span className="text-[10px] uppercase font-black tracking-widest">{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-500">
                <CheckCircle2 size={14} />
                <span className="text-[10px] uppercase font-black tracking-widest">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <button
            onClick={handleDelete}
            disabled={!isVerified || loading}
            className="group relative w-full py-6 rounded-[2rem] bg-zinc-900 border border-white/5 text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all overflow-hidden disabled:opacity-30 disabled:grayscale"
          >
            <div className={`absolute inset-0 bg-red-600 transition-transform duration-500 ${isVerified ? 'translate-y-0' : 'translate-y-full'}`} />
            <span className="relative z-10 flex items-center justify-center gap-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className={`w-4 h-4 ${isVerified ? 'animate-pulse' : ''}`} />}
              {loading ? "COMMITTING PURGE..." : "Confirm Protocol"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
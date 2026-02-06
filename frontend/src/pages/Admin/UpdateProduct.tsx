import { useState ,useEffect} from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../utils/axiosClient";
import { useUser } from "@clerk/clerk-react";
import { 
  Pencil, 
  RefreshCcw, 
  Image as ImageIcon, 
  Type, 
  Layers, 
  Tag, 
  Palette, 
  Ruler, 
  Loader2,
  X,
  Zap
} from "lucide-react";
import { useLocation } from "react-router-dom";

/* ---------------- TYPES ---------------- */
type UpdateProductPayload = {
  title: string;
  newTitle?: string;
  description?: string;
  category?: "men" | "women" | "both";
  price?: number;
  discount?: number;
  size?: string[];
  colors?: string[];
  image?: string[];
  inStock?: boolean;
};

export default function UpdateProduct() {
  const { user } = useUser();
  const emailId = user?.primaryEmailAddress?.emailAddress;

  const [form, setForm] = useState<UpdateProductPayload>({
    title: "",
  });
const {pathname} = useLocation()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  // Local state for tags
  const [tempSize, setTempSize] = useState("");
  const [tempColor, setTempColor] = useState("");

  /* ---------------- HELPERS ---------------- */
  const addTag = (field: "size" | "colors", value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    const items = value.split(",").map(v => v.trim().toUpperCase()).filter(Boolean);
    setForm(prev => ({
      ...prev,
      [field]: Array.from(new Set([...(prev[field] || []), ...items]))
    }));
    setter("");
  };

  const removeTag = (field: "size" | "colors", index: number) => {
    setForm(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === "number" ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!emailId) return setError("Unauthorized: Admin email missing");
    if (!form.title) return setError("Protocol Error: Original Title Required");

    try {
      setLoading(true);
      const res = await axiosClient.patch("/product/updateProduct", form, { params: { emailId } });
      if (res.data.success) {
        setSuccess("Ledger Updated Successfully");
        setForm({ title: "" });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Modification Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 md:px-8 py-24 selection:bg-white selection:text-black">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-16">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[1px] w-8 bg-zinc-700" />
              <span className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-bold">Database Refactor</span>
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">
              Modify <span className="text-zinc-700">Entity</span>
            </h1>
          </motion.div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Targeted Entity (The "Key") */}
          <section className="bg-zinc-900/10 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group">
            <Zap className="absolute -right-4 -top-4 w-24 h-24 text-white/[0.02] group-hover:text-emerald-500/10 transition-colors duration-700" />
            <div className="relative z-10">
                <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2 mb-4">
                   <Type size={12} /> Target Identification
                </label>
                <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="ENTER EXISTING PRODUCT TITLE *"
                    className="w-full bg-transparent border-b border-zinc-800 p-0 pb-4 text-2xl font-black uppercase tracking-tighter focus:border-white focus:outline-none transition-all placeholder:text-zinc-800"
                />
                <p className="text-[9px] text-zinc-600 mt-4 uppercase tracking-widest font-bold italic">Note: This name must match the database record exactly to apply patches.</p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column: Attributes */}
            <div className="space-y-8">
                <section className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2">
                        <RefreshCcw size={12} /> Rename Entity
                    </label>
                    <input
                        type="text"
                        name="newTitle"
                        value={form.newTitle || ""}
                        onChange={handleChange}
                        placeholder="NEW TITLE (OPTIONAL)"
                        className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-4 text-sm font-bold tracking-widest focus:border-white/20 focus:outline-none transition-all placeholder:text-zinc-800"
                    />
                </section>

                <section className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2">
                        <Tag size={12} /> Pricing & Discount
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold text-[10px]">INR</span>
                            <input
                                type="number"
                                name="price"
                                value={form.price || ""}
                                onChange={handleChange}
                                placeholder="PRICE"
                                className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-4 pl-12 text-sm font-mono focus:border-white/20 focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold text-[10px]">%</span>
                            <input
                                type="number"
                                name="discount"
                                value={form.discount || ""}
                                onChange={handleChange}
                                placeholder="DISC"
                                className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-4 pl-10 text-sm font-mono focus:border-white/20 focus:outline-none"
                            />
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2">
                        <Layers size={12} /> New Classification
                    </label>
                    <select
                        name="category"
                        value={form.category || ""}
                        onChange={handleChange}
                        className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-4 text-xs font-black uppercase tracking-widest focus:border-white/20 focus:outline-none"
                    >
                        <option value="">NO CHANGE</option>
                        <option value="men">MEN</option>
                        <option value="women">WOMEN</option>
                        <option value="both">UNISEX</option>
                    </select>
                </section>
            </div>

            {/* Right Column: Variants */}
            <div className="space-y-8">
                <section className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2">
                        <Ruler size={12} /> Update Sizes
                    </label>
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-2 min-h-[58px] flex flex-wrap gap-2 items-center">
                        <AnimatePresence>
                        {(form.size || []).map((s, i) => (
                            <motion.span 
                                key={s} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className="bg-white text-black text-[9px] font-black px-3 py-1.5 rounded-lg flex items-center gap-2"
                            >
                                {s} <X size={10} className="cursor-pointer" onClick={() => removeTag("size", i)} />
                            </motion.span>
                        ))}
                        </AnimatePresence>
                        <input 
                            type="text" value={tempSize}
                            onChange={(e) => setTempSize(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag("size", tempSize, setTempSize))}
                            placeholder="PATCH SIZES (ENTER)"
                            className="bg-transparent border-none focus:outline-none text-xs font-mono p-2 flex-1"
                        />
                    </div>
                </section>

                <section className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2">
                        <Palette size={12} /> Chromatic Shift
                    </label>
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-2 min-h-[58px] flex flex-wrap gap-2 items-center">
                        <AnimatePresence>
                        {(form.colors || []).map((c, i) => (
                            <motion.span 
                                key={c} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className="bg-zinc-800 border border-white/10 text-zinc-300 text-[9px] font-black px-3 py-1.5 rounded-lg flex items-center gap-2"
                            >
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.toLowerCase() }} />
                                {c} <X size={10} className="cursor-pointer" onClick={() => removeTag("colors", i)} />
                            </motion.span>
                        ))}
                        </AnimatePresence>
                        <input 
                            type="text" value={tempColor}
                            onChange={(e) => setTempColor(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag("colors", tempColor, setTempColor))}
                            placeholder="PATCH COLORS (ENTER)"
                            className="bg-transparent border-none focus:outline-none text-xs font-mono p-2 flex-1"
                        />
                    </div>
                </section>

                <section className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2">
                        <ImageIcon size={12} /> Asset Overwrite
                    </label>
                    <textarea
                        placeholder="PASTE NEW URLS (COMMA SEPARATED)"
                        onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value.split(",").map(img => img.trim()).filter(Boolean) }))}
                        className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-4 text-[10px] font-mono focus:border-white/20 focus:outline-none h-20 placeholder:text-zinc-800"
                    />
                </section>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <label className="flex items-center gap-4 cursor-pointer group">
                <div className={`w-12 h-6 rounded-full transition-all duration-500 relative ${form.inStock ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                    <input type="checkbox" className="hidden" checked={form.inStock || false} onChange={(e) => setForm(prev => ({ ...prev, inStock: e.target.checked }))} />
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${form.inStock ? 'left-7' : 'left-1'}`} />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 group-hover:text-white">Overwrite Stock Status</span>
            </label>

            <div className="flex items-center gap-6">
                <AnimatePresence>
                    {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] uppercase font-bold tracking-widest">{error}</motion.p>}
                    {success && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-500 text-[10px] uppercase font-bold tracking-widest">{success}</motion.p>}
                </AnimatePresence>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all duration-500 flex items-center justify-center gap-3 disabled:bg-zinc-800 disabled:text-zinc-600"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                    {loading ? "PATCHING DATA..." : "Push Changes"}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
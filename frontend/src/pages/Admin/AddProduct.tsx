import { useState,useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../utils/axiosClient";
import { useUser } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import { 
  PlusCircle, 
  Image as ImageIcon, 
  Type, 
  Layers, 
  Tag, 
  Palette, 
  Ruler, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type AddProductPayload = {
  title: string;
  description: string;
  category: "men" | "women" | "both";
  price: number;
  size: string[];
  colors: string[];
  image: string[];
  inStock: boolean;
};

export default function AddProduct() {
  const { user } = useUser();
  const emailId = user?.primaryEmailAddress?.emailAddress;

  const [form, setForm] = useState<AddProductPayload>({
    title: "",
    description: "",
    category: "men",
    price: 0,
    size: [],
    colors: [],
    image: [],
    inStock: true,
  });
  

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const {pathname} = useLocation()
  /* ---------------- HELPERS ---------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === "number" ? Number(value) : value 
    }));
  };
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  const handleArrayChange = (name: keyof Pick<AddProductPayload, "size" | "colors" | "image">, value: string) => {
    const arr = value.split(",").map((v) => v.trim()).filter(Boolean);
    setForm((prev) => ({ ...prev, [name]: arr }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!emailId) return setError("Unauthorized: Admin email missing");
    if (!form.title || !form.price || form.image.length === 0) return setError("Required fields missing");

    try {
      setLoading(true);
      const res = await axiosClient.post(`/product/addProduct`, form, { params: { emailId } });
      if (res.data.success) {
        setSuccess("Inventory Updated Successfully");
        setForm({ title: "", description: "", category: "men", price: 0, size: [], colors: [], image: [], inStock: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Protocol Error: Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 md:px-8 py-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-16">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[1px] w-8 bg-zinc-700" />
              <span className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-bold">Inventory System</span>
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">
              Forge <span className="text-zinc-700">Product</span>
            </h1>
          </motion.div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Column: Core Details */}
          <div className="space-y-8">
            <section className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2">
                <Type size={12} /> Nomenclature
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="PRODUCT TITLE"
                className="w-full bg-zinc-900/20 border border-white/5 rounded-2xl p-4 text-sm font-bold tracking-widest focus:border-white/20 focus:outline-none transition-all placeholder:text-zinc-800"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="ARCHITECTURAL DESCRIPTION"
                rows={4}
                className="w-full bg-zinc-900/20 border border-white/5 rounded-2xl p-4 text-sm focus:border-white/20 focus:outline-none transition-all placeholder:text-zinc-800"
              />
            </section>

            <div className="grid grid-cols-2 gap-4">
              <section className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2">
                  <Layers size={12} /> Classification
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full bg-zinc-900/20 border border-white/5 rounded-2xl p-4 text-xs font-black uppercase tracking-widest focus:border-white/20 focus:outline-none appearance-none"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="both">Unisex</option>
                </select>
              </section>

              <section className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2">
                  <Tag size={12} /> Valuation
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/20 border border-white/5 rounded-2xl p-4 pl-8 text-sm font-mono focus:border-white/20 focus:outline-none"
                  />
                </div>
              </section>
            </div>
          </div>

          {/* Right Column: Variants & Assets */}
          <div className="space-y-8">
            <section className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2">
                <Ruler size={12} /> Size Matrix
              </label>
              <input
                type="text"
                placeholder="S, M, L, XL (COMMA SEPARATED)"
                onChange={(e) => handleArrayChange("size", e.target.value)}
                className="w-full bg-zinc-900/20 border border-white/5 rounded-2xl p-4 text-xs font-mono focus:border-white/20 focus:outline-none placeholder:text-zinc-800"
              />
            </section>

            <section className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2">
                <Palette size={12} /> Chromatic Options
              </label>
              <input
                type="text"
                placeholder="BLACK, WHITE, ZINC (COMMA SEPARATED)"
                onChange={(e) => handleArrayChange("colors", e.target.value)}
                className="w-full bg-zinc-900/20 border border-white/5 rounded-2xl p-4 text-xs font-mono focus:border-white/20 focus:outline-none placeholder:text-zinc-800"
              />
            </section>

            <section className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2">
                <ImageIcon size={12} /> Asset Links
              </label>
              <input
                type="text"
                placeholder="HTTPS://IMAGE-URL.COM, ..."
                onChange={(e) => handleArrayChange("image", e.target.value)}
                className="w-full bg-zinc-900/20 border border-white/5 rounded-2xl p-4 text-xs font-mono focus:border-white/20 focus:outline-none placeholder:text-zinc-800"
              />
            </section>

            <label className="flex items-center gap-4 cursor-pointer group">
              <div className={`w-12 h-6 rounded-full transition-all duration-500 relative ${form.inStock ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={form.inStock}
                  onChange={(e) => setForm(prev => ({ ...prev, inStock: e.target.checked }))}
                />
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${form.inStock ? 'left-7' : 'left-1'}`} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 group-hover:text-white transition-colors">Immediate Availability</span>
            </label>
          </div>

          {/* Status & Submit */}
          <div className="md:col-span-2 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-red-500">
                    <AlertCircle size={14} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-12 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all duration-500 flex items-center justify-center gap-3 disabled:bg-zinc-800 disabled:text-zinc-600"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              {loading ? "COMMITTING DATA..." : "Deploy Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
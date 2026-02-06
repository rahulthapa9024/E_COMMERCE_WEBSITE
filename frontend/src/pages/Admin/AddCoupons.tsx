import { useEffect, useState } from "react";
import axiosClient from "../../utils/axiosClient";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Ticket
} from "lucide-react";
import { useLocation } from "react-router-dom";

/* ================= TYPES ================= */

type Coupon = {
  _id: string;
  coupon: {
    code: string;
    value: number;
    name: string;
  };
  usedUsers: string[];
};

type ApiResponse = {
  success: boolean;
  coupons?: Coupon[];
  message?: string;
};

/* ================= COMPONENT ================= */

export default function CouponManager() {
  const { user } = useUser();
  const emailId = user?.primaryEmailAddress?.emailAddress;
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    value: 0,
    name: "",
  });

  /* ================= FETCH ================= */

  const fetchCoupons = async () => {
    if (!emailId) return;

    try {
      setLoading(true);
      const res = await axiosClient.get<ApiResponse>(
        `/coupon/getAllCoupons/${emailId}`
      );

      if (res.data.success) {
        setCoupons(res.data.coupons ?? []);
      }
    } catch (err) {
      console.error("Fetch coupons error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [emailId]);

  /* ================= ADD ================= */

  const addCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!emailId) return setError("Unauthorized");
    if (!form.code || !form.value || !form.name) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);
      const res = await axiosClient.post(
        `/coupon/addCoupon/${emailId}`,
        form
      );

      if (res.data.success) {
        setSuccess("Coupon added successfully");
        setForm({ code: "", value: 0, name: "" });
        fetchCoupons();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add coupon");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const deleteCoupon = async (code: string) => {
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      const res = await axiosClient.delete(
        `/coupon/deleteCoupon`,
        { data: { code } }
      );

      if (res.data.success) {
        setSuccess("Coupon deleted");
        fetchCoupons();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete coupon");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 md:px-8 py-24">
      <div className="max-w-4xl mx-auto space-y-14">

        {/* HEADER */}
        <header>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black uppercase tracking-tight flex items-center gap-4"
          >
            <Ticket className="w-8 h-8" />
            Coupons
          </motion.h1>
        </header>

        {/* ADD COUPON */}
        <form
          onSubmit={addCoupon}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <input
            placeholder="CODE (e.g. SAVE50)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 text-sm"
          />

          <input
            type="number"
            placeholder="VALUE"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 text-sm"
          />

          <input
            placeholder="COUPON NAME"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 text-sm"
          />

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-3 py-4 rounded-xl bg-white text-black font-black uppercase text-xs tracking-widest flex justify-center items-center gap-3 disabled:bg-zinc-700"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <PlusCircle />}
            Add Coupon
          </button>
        </form>

        {/* STATUS */}
        <AnimatePresence>
          {error && (
            <motion.div className="flex items-center gap-2 text-red-500">
              <AlertCircle size={14} />
              <span className="text-xs uppercase tracking-widest font-bold">
                {error}
              </span>
            </motion.div>
          )}
          {success && (
            <motion.div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 size={14} />
              <span className="text-xs uppercase tracking-widest font-bold">
                {success}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LIST */}
        <div className="space-y-4">
          {coupons.length === 0 ? (
            <p className="text-zinc-500">No coupons found.</p>
          ) : (
            coupons.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between border border-white/5 rounded-xl p-4"
              >
                <div>
                  <p className="font-bold tracking-widest">
                    {c.coupon.code}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {c.coupon.name} • Value: {c.coupon.value}
                  </p>
                </div>

                <button
                  onClick={() => deleteCoupon(c.coupon.code)}
                  className="text-red-500 hover:text-red-600 transition"
                >
                  <Trash2 />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

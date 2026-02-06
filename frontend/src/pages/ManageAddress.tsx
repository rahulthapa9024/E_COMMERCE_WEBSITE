import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import ShimmerPage from "./ShimmerPage";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronLeft, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";

/* ---------------- TYPES ---------------- */
type Address = {
  houseNo: string;
  landmark: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
};

export default function ManageAddress() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const emailId = user?.primaryEmailAddress?.emailAddress || "";

  /* ---------------- STATE ---------------- */
  const initialAddressState: Address = {
    houseNo: "",
    landmark: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
  };

  const [address, setAddress] = useState<Address>(initialAddressState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      navigate("/signup");
      return;
    }

    const fetchAddress = async () => {
      try {
        const res = await axiosClient.get(`/auth/address/${emailId}`);
        if (res.data?.address) {
          setAddress({
            houseNo: res.data.address.houseNo || "",
            landmark: res.data.address.landmark || "",
            streetAddress: res.data.address.streetAddress || "",
            city: res.data.address.city || "",
            state: res.data.address.state || "",
            postalCode: res.data.address.postalCode || "",
          });
        }
      } catch (err) {
        console.log("No existing address found.");
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [isLoaded, user, emailId, navigate]);

  /* ---------------- SAVE DATA ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate all fields are filled
    const isFormIncomplete = Object.values(address).some((val) => !val.trim());
    if (isFormIncomplete) {
      setError("All fields are mandatory for secure delivery.");
      return;
    }

    try {
      setSaving(true);
      await axiosClient.post(`/auth/address/${emailId}`, address);
      
      // Trigger Success UI
      setSuccess(true);
      
      // Empty the form after success
      setAddress(initialAddressState);

      // Remove success message after 3 seconds
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Transmission failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) return <ShimmerPage />;

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6 sm:px-10">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-8 group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em]">Profile Settings</span>
          </button>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            Manage <br />
            <span className="text-zinc-800">Address</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* SIDEBAR INFO */}
          <div className="lg:col-span-1">
            <div className="p-8 border border-zinc-900 rounded-[2rem] bg-zinc-950/30 sticky top-32">
              <MapPin className="text-white mb-6" size={28} />
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Shipping Protocol</h3>
              <p className="text-zinc-500 text-[10px] leading-relaxed uppercase tracking-[0.15em] mb-6">
                Updating your address will apply to all future orders. Ensure your Postal Code matches your City for local logistics sync.
              </p>
              <div className="h-[1px] w-full bg-zinc-900 mb-6" />
              <button 
                onClick={() => setAddress(initialAddressState)}
                className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
              >
                <RefreshCcw size={12} /> Clear Current Form
              </button>
            </div>
          </div>

          {/* FORM AREA */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STATUS MESSAGES */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] uppercase tracking-widest"
                  >
                    <AlertCircle size={14} /> {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-4 bg-white/10 border border-white/20 rounded-xl text-green-600 text-[10px] uppercase tracking-widest"
                  >
                    <CheckCircle2 size={14} /> Database Updated. Form Reset.
                  </motion.div>
                )}
              </AnimatePresence>

              {/* INPUT FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "House / Flat No", key: "houseNo", full: false },
                  { label: "Landmark", key: "landmark", full: false },
                  { label: "Street Address", key: "streetAddress", full: true },
                  { label: "City", key: "city", full: false },
                  { label: "State", key: "state", full: false },
                  { label: "Postal Code", key: "postalCode", full: true },
                ].map(({ label, key, full }) => (
                  <div key={key} className={full ? "md:col-span-2" : ""}>
                    <label className="block text-[9px] uppercase tracking-[0.3em] text-zinc-600 mb-2 font-black">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={(address as any)[key]}
                      onChange={e => setAddress(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`Specify ${label.toLowerCase()}`}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 text-xs focus:outline-none focus:border-white focus:ring-1 focus:ring-white/5 transition-all placeholder:text-zinc-800"
                    />
                  </div>
                ))}
              </div>

              {/* SUBMIT ACTION */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-zinc-200 transition-all active:scale-[0.97] disabled:opacity-30 flex items-center justify-center gap-4 shadow-2xl shadow-white/5"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Encrypting...
                    </>
                  ) : (
                    "Save & Sync"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import axiosClient from "../../utils/axiosClient";
import { useUser } from "@clerk/clerk-react";
import {
  ChevronLeft,
  ChevronRight,
  ArchiveX,
  MapPin,
  Loader2,
  Phone,
  Package,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type Product = {
  title?: string;
  quantity?: number;
  size?: string;
  color?: string;
  image?: string;
};

type Address = {
  houseNo?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

type RejectedOrder = {
  emailId?: string;
  products?: Product[];
  price?: number;
  address?: Address;
  phoneNo?: string;
  displayName?: string;
  orderDate?: string;
  ID?: string;
};

type ApiResponse = {
  success: boolean;
  totalPages?: number;
  adminRejected?: RejectedOrder[];
  rejectedOrder?: RejectedOrder[];
};

/* ---------------- COMPONENT ---------------- */
export default function RecoredOrders() {
  const { user, isLoaded } = useUser();
  const emailId = user?.primaryEmailAddress?.emailAddress;

  const [orders, setOrders] = useState<RejectedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  /* ---------------- FETCH ---------------- */

  const fetchRejectedOrders = async (pageNo: number) => {
    if (!emailId) return;

    setLoading(true);
    try {
      const res = await axiosClient.get<ApiResponse>(
        "/cart/getRejectedOrder",
        {
          params: { emailId, page: pageNo },
        }
      );

      console.log("API RESPONSE:", res.data);

      if (res.data.success) {
        const data =
          res.data.adminRejected ??
          res.data.rejectedOrder ??
          [];

        setOrders(data);
        setTotalPages(res.data.totalPages ?? 1);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch rejected orders");
      console.error("STATUS:", err.response?.status);
      console.error("DATA:", err.response?.data);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    if (!isLoaded || !emailId) return;
    fetchRejectedOrders(page);
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page, emailId, isLoaded]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 md:px-8 py-24">
      <div className="max-w-6xl mx-auto" ref={scrollRef}>

        {/* HEADER */}
        <header className="flex justify-between items-end mb-16">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-500">
              Archive Log
            </p>
            <h1 className="text-6xl font-black uppercase">
              Rejected <span className="text-zinc-700">Orders</span>
            </h1>
          </div>

          <div className="bg-zinc-900/30 px-6 py-4 rounded-2xl border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Total Records
            </p>
            <p className="text-xl font-mono font-bold">
              {orders.length}
            </p>
          </div>
        </header>

        {/* CONTENT */}
        <div className="relative min-h-[600px]">
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10"
              >
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="text-xs uppercase tracking-widest text-zinc-500 mt-4">
                  Loading archives…
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && orders.length === 0 && (
            <div className="py-40 text-center border border-dashed border-white/5 rounded-[3rem]">
              <ArchiveX className="w-16 h-16 mx-auto text-zinc-800 mb-6" />
              <p className="text-zinc-500 uppercase tracking-widest text-xs">
                No rejected orders found
              </p>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="space-y-12">
              {orders.map((order, idx) => (
                <motion.div
                  key={order.ID ?? idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-white/5 rounded-[2.5rem] p-10 bg-zinc-900/10"
                >
                  {/* TOP */}
                  <div className="grid md:grid-cols-4 gap-8 pb-8 border-b border-white/5">
                    <div>
                      <p className="text-xs text-zinc-500">ORDER ID</p>
                      <p className="font-mono">{order.ID}</p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">DATE</p>
                      <p className="font-bold uppercase">
                        {order.orderDate || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">USER</p>
                      <p className="font-bold">{order.displayName || "GUEST"}</p>
                      <p className="text-xs text-zinc-600">{order.emailId}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-zinc-500">AMOUNT</p>
                      <p className="text-3xl font-black">
                        ₹{order.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="grid lg:grid-cols-2 gap-12 mt-10">
                    <div className="space-y-4">
                      {(order.products ?? []).map((p, i) => (
                        <div key={i} className="flex gap-4 items-center">
                          {p.image ? (
                            <img
                              src={p.image}
                              className="w-16 h-20 object-cover rounded-xl"
                            />
                          ) : (
                            <Package className="w-10 h-10 text-zinc-800" />
                          )}
                          <div>
                            <p className="font-bold">{p.title}</p>
                            <p className="text-xs text-zinc-500">
                              Qty {p.quantity} · {p.size}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8">
                      <MapPin className="text-zinc-700 mb-4" />
                      <p className="text-sm text-zinc-400">
                        {order.address?.houseNo},{" "}
                        {order.address?.streetAddress}<br />
                        {order.address?.city}, {order.address?.state}<br />
                        {order.address?.postalCode}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-zinc-600">
                        <Phone size={12} />
                        <span className="text-xs font-mono">
                          {order.phoneNo || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center gap-10 mt-24">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft />
            </button>

            <span className="font-mono">
              {page.toString().padStart(2, "0")} /{" "}
              {totalPages.toString().padStart(2, "0")}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

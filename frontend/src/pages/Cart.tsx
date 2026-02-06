import { useUser } from "@clerk/clerk-react";
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import ShimmerSpinner from "../pages/ShimmerPage";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------- TYPES ---------------- */
type CartItem = {
  _id: string;
  title: string;
  quantity: number;
  color?: string;
  size?: string;
};

type ProductDetails = {
  title: string;
  price: number;
  image: string[];
};

/* ---------------- ICONS ---------------- */
const ShoppingBagIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H5.505c-.656 0-1.189-.585-1.119-1.243l1.263-12a1.125 1.125 0 011.12-1.007h8.632c.626 0 1.15.472 1.12 1.007z"
    />
  </svg>
);

const ArrowRightIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

const TrashIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const SpinnerIcon = (props: any) => (
  <motion.svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </motion.svg>
);

/* ---------------- ANIMATIONS ---------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Cart() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const emailId = user?.primaryEmailAddress?.emailAddress || null;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const goToCheckOut = () => {
    navigate("/checkout");
  };
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  const fetchData = useCallback(async () => {
    if (!emailId) return;
    try {
      const [cartRes, favRes, prodRes] = await Promise.all([
        axiosClient.get("/cart/getCart", { params: { emailId } }),
        axiosClient.get("/cart/fetchAllFavourites", { params: { emailId } }),
        axiosClient.get("/product/getAllProducts"),
      ]);
      setCart(cartRes.data.cart || []);
      setFavourites(favRes.data.favourites || []);
      setProducts(prodRes.data.products || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setUpdatingId(null);
    }
  }, [emailId]);

  useEffect(() => {
    if (isLoaded) {
      if (!user) navigate("/");
      else fetchData();
    }
  }, [isLoaded, user, fetchData, navigate]);

  const handleQuantityChange = async (item: CartItem, action: "add" | "remove") => {
    setUpdatingId(item._id);
    try {
      if (action === "add") {
        await axiosClient.post(
          `/cart/addInCart`,
          { product: { title: item.title } },
          { params: { emailId } }
        );
      } else {
        await axiosClient.delete(`/cart/removeProductFromCart`, {
          params: { emailId },
          data: { product: { title: item.title } },
        });
      }
      fetchData();
    } catch {
      setUpdatingId(null);
    }
  };

  const toggleFav = async (title: string) => {
    try {
      if (favourites.includes(title)) {
        await axiosClient.delete("/cart/removeProductFromFavourites", {
          params: { emailId },
          data: { title },
        });
      } else {
        await axiosClient.post(
          "/cart/addInFavourites",
          { title },
          { params: { emailId } }
        );
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getProductDetails = (title: string): ProductDetails | undefined => {
    return products.find(p => p.title === title);
  };
  

  const total = cart.reduce((acc, item) => {
    const detail = getProductDetails(item.title);
    return acc + (detail?.price ?? 0) * item.quantity;
  }, 0);
  

  if (loading) return <ShimmerSpinner />;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 sm:mb-12 border-b border-zinc-900 pb-6 sm:pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
              <ShoppingBagIcon className="w-5 h-5 text-zinc-200" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                Cart
              </h1>
              <p className="text-[10px] sm:text-xs text-zinc-500 tracking-[0.3em] uppercase mt-2">
                {cart.length} item{cart.length !== 1 ? "s" : ""} in your cart
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="text-[10px] sm:text-xs tracking-[0.25em] uppercase border-b border-white/60 pb-1 text-zinc-100 hover:text-white hover:border-white transition-colors"
          >
            Back to collection
          </Link>
        </motion.header>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
          {cart.length === 0 ? (
            <EmptyCartView key="empty" navigate={navigate} />
          ) : (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10"
            >
              {/* LEFT: ITEMS */}
              <div className="lg:col-span-8 rounded-2xl border border-zinc-900 bg-zinc-950/60 overflow-hidden">
                {cart.map(item => {
                  const details =
                  getProductDetails(item.title) ?? {
                    title: item.title,
                    price: 0,
                    image: [""],
                  };
                
                  return (
                    <motion.div
                      key={item._id}
                      variants={itemVariants}
                      className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch px-4 sm:px-6 py-5 border-b border-zinc-900 last:border-b-0 bg-black/40 hover:bg-black/60 transition-colors"
                    >
                      {/* IMAGE */}
                      <div className="w-28 h-32 sm:w-32 sm:h-36 bg-zinc-950 flex-shrink-0 border border-zinc-900 overflow-hidden rounded-xl">
                        {details.image[0] ? (
                          <img
                            src={details.image[0]}
                            alt={item.title}
                            className="w-full h-full object-cover transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700 text-2xl">
                            ?
                          </div>
                        )}
                      </div>

                      {/* TITLE + META */}
                      <div className="flex-grow text-center md:text-left space-y-2">
                        <h2 className="text-sm sm:text-base font-black uppercase tracking-[0.2em]">
                          {item.title}
                        </h2>
                        <div className="flex justify-center md:justify-start gap-4 text-[10px] text-zinc-500 uppercase tracking-[0.18em]">
                          <span>Size: {item.size || "STD"}</span>
                          <span>Color: {item.color || "BLK"}</span>
                        </div>
                        <button
                          onClick={() => toggleFav(item.title)}
                          className={`text-[10px] uppercase tracking-[0.2em] border-b pb-0.5 ${
                            favourites.includes(item.title)
                              ? "text-white border-white"
                              : "text-zinc-600 border-zinc-800 hover:text-zinc-300 hover:border-zinc-500"
                          }`}
                        >
                          {favourites.includes(item.title)
                            ? "Saved to favorites"
                            : "Save for later"}
                        </button>
                      </div>

                      {/* QTY + PRICE */}
                      <div className="flex flex-col items-end gap-3 md:gap-4">
                        <div className="flex items-center gap-5 border border-zinc-800 rounded-full px-4 py-1.5 bg-black/60">
                          <button
                            disabled={updatingId === item._id}
                            onClick={() => handleQuantityChange(item, "remove")}
                            className="text-sm text-zinc-200 disabled:text-zinc-600"
                          >
                            {item.quantity > 1 ? "−" : <TrashIcon className="w-4 h-4" />}
                          </button>
                          <span className="text-xs font-black w-5 text-center">
                            {updatingId === item._id ? (
                              <SpinnerIcon className="w-4 h-4" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            disabled={updatingId === item._id}
                            onClick={() => handleQuantityChange(item, "add")}
                            className="text-sm text-zinc-200 disabled:text-zinc-600"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm sm:text-base font-black">
                            ₹{(details.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-zinc-500 tracking-[0.15em] uppercase">
                            ₹{details.price.toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* RIGHT: SUMMARY */}
              <div className="lg:col-span-4">
                <div className="bg-black/70 border border-zinc-900 rounded-2xl p-6 sm:p-8 sticky top-28">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-zinc-400">
                    Cart summary
                  </h2>

                  <div className="space-y-4 text-[11px] uppercase tracking-[0.18em]">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Shipping</span>
                      <span className="text-emerald-400">Free</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Items</span>
                      <span>{cart.reduce((sum, i) => sum + i.quantity, 0)}</span>
                    </div>

                    <div className="pt-5 mt-2 border-t border-zinc-900 flex justify-between items-baseline">
                      <span className="font-black text-xs text-zinc-100">Total</span>
                      <span className="text-2xl sm:text-3xl font-black italic">
                        ₹{total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                  onClick={goToCheckOut}className="w-full mt-8 bg-white text-black py-3.5 sm:py-4 font-black uppercase text-[10px] tracking-[0.28em] hover:bg-zinc-200 active:bg-zinc-300 transition-colors rounded-full flex items-center justify-center gap-2">
                    <span>Proceed to checkout</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const EmptyCartView = ({ navigate }: any) => (
  <div className="py-32 sm:py-40 text-center border border-dashed border-zinc-800 rounded-2xl bg-black/40">
    <ShoppingBagIcon className="w-10 h-10 mx-auto mb-6 text-zinc-700" />
    <h2 className="text-sm sm:text-base font-semibold mb-2">Your cart is empty</h2>
    <p className="text-zinc-500 uppercase tracking-[0.25em] text-[10px] mb-8">
      Add items to see them here
    </p>
    <button
      onClick={() => navigate("/")}
      className="bg-white text-black px-10 py-3.5 sm:py-4 font-black uppercase text-[10px] tracking-[0.2em] inline-flex items-center gap-3 rounded-full hover:bg-zinc-200 transition-colors"
    >
      Shop collection <ArrowRightIcon className="w-4 h-4" />
    </button>
  </div>
);

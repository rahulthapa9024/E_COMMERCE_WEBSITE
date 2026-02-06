import { useUser } from "@clerk/clerk-react";
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Heart, ArrowLeft, Eye, ExternalLink } from "lucide-react";

/* ---------------- TYPES ---------------- */
type Product = {
  _id: string;
  title: string;
  price: number;
  image?: string[];
  inStock?: boolean;
};

/* ---------------- ANIMATIONS ---------------- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1],
    },
  },
  hover: {
    y: -8,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const imageVariants: Variants = {
  hidden: { scale: 1.1, opacity: 0.7 },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.215, 0.61, 0.355, 1],
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};


/* ---------------- LOADING COMPONENT ---------------- */
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-white/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-zinc-400 text-sm tracking-widest">Loading Favourites...</p>
    </div>
  </div>
);

export default function Favourites() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const emailId = user?.primaryEmailAddress?.emailAddress || null;

  const [favTitles, setFavTitles] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  /* ---------------- DATA FETCHING ---------------- */
  const fetchData = useCallback(async () => {
    if (!emailId) return;
    try {
      const [favRes, prodRes] = await Promise.all([
        axiosClient.get("/cart/fetchAllFavourites", { params: { emailId } }),
        axiosClient.get("/product/getAllProducts")
      ]);

      setFavTitles(favRes.data.favourites || []);
      setAllProducts(prodRes.data.products || []);
    } catch (err) {
      console.error("Error loading favourites:", err);
    } finally {
      setLoading(false);
    }
  }, [emailId]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [pathname]);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        navigate("/");
      } else {
        fetchData();
      }
    }
  }, [isLoaded, user, fetchData, navigate]);

  /* ---------------- PRODUCT FILTERING ---------------- */
  const favouriteProducts = allProducts.filter(product =>
    favTitles.includes(product.title)
  );

  /* ---------------- PRODUCT NAVIGATION ---------------- */
  const goToProduct = (id: string) => {
    navigate(`/product/${id}`);
  };

  /* ---------------- REMOVE FAVOURITE ---------------- */
  const removeFromFavourites = async (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!emailId) return;

    try {
      await axiosClient.delete(`/cart/removeProductFromFavourites`, {
        params: { emailId },
        data: { title },
      });
      setFavTitles(prev => prev.filter(t => t !== title));
    } catch (err) {
      console.error("Failed to remove from favourites", err);
    }
  };

  if (!isLoaded || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 md:mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="space-y-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs sm:text-sm uppercase tracking-widest">Back to Shop</span>
              </Link>

              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-300 to-zinc-500">
                    FAVOURITES
                  </span>
                </h1>
                <p className="text-zinc-400 text-xs sm:text-sm md:text-base tracking-wide max-w-xl">
                  Your curated collection of premium selections
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-1">
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
                Items Saved
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-black text-white leading-none">
                  {favouriteProducts.length}
                </span>
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl">
                  <Heart size={18} className="text-red-500" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] sm:text-sm text-zinc-400">
            <span className="uppercase tracking-widest">Your Collection</span>
            <div className="h-4 w-px bg-zinc-800"></div>
            <span className="text-zinc-500">Premium Selection</span>
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          {favouriteProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 md:py-24 text-center"
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 flex items-center justify-center">
                  <Heart size={32} className="text-zinc-600" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3">Your Favourites List is Empty</h3>
                <p className="text-zinc-400 mb-8">Start exploring our collection and save items you love</p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-white to-zinc-300 text-black rounded-lg font-medium hover:from-zinc-300 hover:to-white transition-all text-sm"
                >
                  Explore Collection
                  <ExternalLink size={16} />
                </Link>
              </div>
            </motion.div>
          ) : (
            /* PRODUCT GRID - grid-cols-2 is the key change here */
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6 lg:gap-8 pb-8 md:pb-12"
            >
              {favouriteProducts.map((product) => (
                <motion.div
                  key={product._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="show"
                  whileHover="hover"
                  className="group relative cursor-pointer"
                  onClick={() => goToProduct(product._id)}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-zinc-900 bg-gradient-to-br from-zinc-900 to-black mb-2 md:mb-4">
                    {product.image?.[0] ? (
                      <>
                        <motion.img
                          variants={imageVariants}
                          src={product.image[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-zinc-600 text-[10px] uppercase tracking-widest">No Image</p>
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-3 md:bottom-6 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded-full text-[10px] md:text-sm font-medium transition-transform group-hover:scale-105">
                          <Eye size={14} />
                          <span className="hidden xs:inline">View</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => removeFromFavourites(product.title, e)}
                        className="absolute top-2 md:top-4 right-2 md:right-4 p-1.5 md:p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-all hover:scale-110"
                      >
                        <Heart size={14} className="text-red-500" fill="currentColor" />
                      </button>

                      <div className="absolute top-2 md:top-4 left-2 md:left-4 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
                        <span className="text-[10px] md:text-sm font-bold">₹{product.price.toLocaleString()}</span>
                      </div>
                    </div>

                    {product.inStock === false && (
                      <div className="absolute top-2 md:top-4 left-2 md:left-4 px-2 py-0.5 bg-red-900/30 border border-red-700/50 text-red-300 text-[8px] md:text-xs tracking-widest uppercase rounded-full">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="px-1">
                    <h3 className="font-medium text-xs sm:text-sm md:text-base mb-1 line-clamp-1 group-hover:text-white/90 transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="text-zinc-500 text-[9px] sm:text-xs uppercase tracking-widest">
                        Favourite
                      </div>
                      <div className="flex items-center gap-1 text-zinc-400">
                        <Heart size={8} className="text-red-500" fill="currentColor" />
                        <span className="text-[9px] sm:text-xs">Saved</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -inset-1 border border-white/0 group-hover:border-white/10 rounded-lg transition-all duration-300 pointer-events-none"></div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="pt-4 md:pt-8"></div>
      </main>
    </div>
  );
}
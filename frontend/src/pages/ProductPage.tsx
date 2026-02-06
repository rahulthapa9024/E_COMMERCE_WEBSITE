import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate,useLocation } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import { useUser } from "@clerk/clerk-react";
import { ChevronLeft, ShoppingBag, Heart, X, ChevronRight, ChevronLeft as ChevronLeftIcon, Maximize2 } from "lucide-react";
import ShimmerSpinner from "./ShimmerPage";
/* ================= TYPES ================= */
type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  colors: string[];
  size: string[];
  image: string[];
  inStock: boolean;
  category?: string;
};

type CartItem = {
  title: string;
  quantity: number;
};

type ApiResponse = {
  product: Product;
};

/* ================= COLOR MAP ================= */
const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  black: { bg: "bg-black", text: "text-white", border: "border-zinc-800" },
  white: { bg: "bg-white", text: "text-black", border: "border-zinc-300" },
  red: { bg: "bg-red-600", text: "text-white", border: "border-red-700" },
  blue: { bg: "bg-blue-600", text: "text-white", border: "border-blue-700" },
  green: { bg: "bg-green-600", text: "text-white", border: "border-green-700" },
  yellow: { bg: "bg-yellow-500", text: "text-black", border: "border-yellow-600" },
  pink: { bg: "bg-pink-600", text: "text-white", border: "border-pink-700" },
  purple: { bg: "bg-purple-600", text: "text-white", border: "border-purple-700" },
  orange: { bg: "bg-orange-500", text: "text-black", border: "border-orange-600" },
  gray: { bg: "bg-gray-500", text: "text-white", border: "border-gray-600" },
  navy: { bg: "bg-blue-900", text: "text-white", border: "border-blue-950" },
  brown: { bg: "bg-amber-900", text: "text-white", border: "border-amber-950" },
  beige: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-200" },
  maroon: { bg: "bg-red-900", text: "text-white", border: "border-red-950" },
  teal: { bg: "bg-teal-500", text: "text-white", border: "border-teal-600" },
  cyan: { bg: "bg-cyan-500", text: "text-black", border: "border-cyan-600" },
  silver: { bg: "bg-gray-300", text: "text-gray-800", border: "border-gray-400" },
  gold: { bg: "bg-yellow-300", text: "text-yellow-900", border: "border-yellow-400" },
};

const getColorStyle = (color: string) => {
  const normalizedColor = color.toLowerCase().trim();
  return (
    colorMap[normalizedColor] || {
      bg: "bg-zinc-800",
      text: "text-zinc-300",
      border: "border-zinc-700",
    }
  );
};



/* ================= FULL SCREEN IMAGE VIEWER ================= */
interface ImageViewerProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ images, currentIndex, onClose, onIndexChange }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndexChange((currentIndex - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onIndexChange((currentIndex + 1) % images.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length, onClose, onIndexChange]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-3 bg-black/50 hover:bg-black/80 rounded-full transition-all hover:scale-110"
      >
        <X size={24} className="text-white" />
      </button>

      <button
        onClick={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
        className="absolute left-4 md:left-8 z-50 p-3 bg-black/50 hover:bg-black/80 rounded-full transition-all hover:scale-110"
      >
        <ChevronLeftIcon size={24} className="text-white" />
      </button>

      <button
        onClick={() => onIndexChange((currentIndex + 1) % images.length)}
        className="absolute right-4 md:right-8 z-50 p-3 bg-black/50 hover:bg-black/80 rounded-full transition-all hover:scale-110"
      >
        <ChevronRight size={24} className="text-white" />
      </button>

      <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center p-4">
        <img
          src={images[currentIndex]}
          alt={`Product view ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>

      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onIndexChange(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 text-white/60 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

/* ================= PRODUCT PAGE ================= */
export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const emailId = user?.primaryEmailAddress?.emailAddress || null;
  const { pathname } = useLocation();

  /* ================= STATE ================= */
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // UI States
  const [selectedImgIndex, setSelectedImgIndex] = useState<number>(0);
  const [showImageViewer, setShowImageViewer] = useState(false);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosClient.get<ApiResponse>(`/product/getProductById/${id}`);
        setProduct(res.data.product);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [pathname]);

  /* ================= FETCH CART & FAVORITES ================= */
  const fetchCartFav = useCallback(async () => {
    if (!emailId) return;
    try {
      const [cartRes, favRes] = await Promise.all([
        axiosClient.get("/cart/getCart", { params: { emailId } }),
        axiosClient.get("/cart/fetchAllFavourites", { params: { emailId } }),
      ]);
      setCart(cartRes.data.cart || []);
      setFavourites(favRes.data.favourites || []);
    } catch (err) {
      console.error("Failed to sync cart/favorites", err);
    }
  }, [emailId]);

  useEffect(() => {
    if (emailId) fetchCartFav();
  }, [emailId, fetchCartFav]);

  /* ================= CART FUNCTIONS ================= */
  const getQty = (title: string) => cart.find(i => i.title === title)?.quantity || 0;

  const addToCart = async () => {
    if (!emailId) {
      navigate("/signup");
      return;
    }
    if (!product) return;
    
    setCartLoading(true);
    try {
      await axiosClient.post(
        `/cart/addInCart`,
        {
          product: { title: product.title },
        },
        { params: { emailId } }
      );
      fetchCartFav();
    } catch (err) {
      console.error("Failed to add to cart", err);
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async () => {
    if (!emailId || !product) return;
    
    setCartLoading(true);
    try {
      await axiosClient.delete(`/cart/removeProductFromCart`, {
        params: { emailId },
        data: { product: { title: product.title } },
      });
      fetchCartFav();
    } catch (err) {
      console.error("Failed to remove from cart", err);
    } finally {
      setCartLoading(false);
    }
  };

  /* ================= FAVORITE FUNCTIONS ================= */
  const isFavorite = product ? favourites.includes(product.title) : false;

  const toggleFav = async () => {
    if (!emailId) {
      navigate("/signup");
      return;
    }
    if (!product) return;

    setFavLoading(true);
    try {
      if (isFavorite) {
        await axiosClient.delete(`/cart/removeProductFromFavourites`, {
          params: { emailId },
          data: { title: product.title },
        });
      } else {
        await axiosClient.post(
          `/cart/addInFavourites`,
          { title: product.title },
          { params: { emailId } }
        );
      }
      fetchCartFav();
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    } finally {
      setFavLoading(false);
    }
  };

  /* ================= IMAGE FUNCTIONS ================= */
  const handleImageClick = (index: number) => {
    setSelectedImgIndex(index);
    setShowImageViewer(true);
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImgIndex(index);
  };

  /* ================= LOADING STATES ================= */
  if (!isLoaded) return <ShimmerSpinner />;
  if (loading) return <ShimmerSpinner />;
  if (error || !product) return <div className="p-6 text-center text-red-500 min-h-screen flex items-center justify-center">{error || "Product Not Found"}</div>;

  const qty = getQty(product.title);

  return (
    <div className="min-h-screen bg-black text-white">
      {showImageViewer && product.image.length > 0 && (
        <ImageViewer
          images={product.image}
          currentIndex={selectedImgIndex}
          onClose={() => setShowImageViewer(false)}
          onIndexChange={setSelectedImgIndex}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all duration-300 mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm uppercase tracking-widest">Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT: Image Section */}
          <div className="lg:col-span-7">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Thumbnails */}
              {product.image.length > 1 && (
                <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto order-2 md:order-1">
                  {product.image.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleThumbnailClick(idx)}
                      className={`relative flex-shrink-0 w-16 h-20 md:w-20 md:h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedImgIndex === idx 
                          ? "border-white scale-105 shadow-lg shadow-white/20" 
                          : "border-transparent opacity-60 hover:opacity-100 hover:border-zinc-600"
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.title} view ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Display */}
              <div className={`flex-1 ${product.image.length > 1 ? 'order-1 md:order-2' : ''}`}>
                <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl overflow-hidden border border-zinc-900 h-[400px] md:h-[600px] lg:h-[700px] group cursor-pointer">
                  {product.image.length > 0 ? (
                    <>
                      <img 
                        src={product.image[selectedImgIndex]} 
                        alt={product.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        onClick={() => handleImageClick(selectedImgIndex)}
                      />
                      <button
                        onClick={() => handleImageClick(selectedImgIndex)}
                        className="absolute top-4 left-4 z-20 p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
                        aria-label="View full screen"
                      >
                        <Maximize2 size={20} className="text-white" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-zinc-700 text-5xl mb-3">🛍️</div>
                        <p className="text-zinc-600 text-sm uppercase tracking-widest">
                          No Image Available
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Favorite Button */}
                  <button
                    onClick={toggleFav}
                    disabled={favLoading}
                    className="absolute top-4 right-4 z-20 p-3 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart 
                      size={24} 
                      className={`transition-all duration-300 ${isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-white"}`} 
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* Image Counter */}
                {product.image.length > 1 && (
                  <div className="text-center mt-3 text-zinc-500 text-sm">
                    Click image to view full screen • {selectedImgIndex + 1} of {product.image.length}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-6">
              <span className="text-zinc-400 font-medium uppercase tracking-widest text-xs">
                {product.category || "Premium Collection"}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mt-2 leading-tight bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mt-6">
                <p className="text-3xl font-bold text-white">₹{product.price.toLocaleString()}</p>
                {!product.inStock && (
                  <span className="px-3 py-1 bg-red-900/30 border border-red-700/50 text-red-300 text-xs tracking-widest uppercase rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            <p className="text-zinc-400 leading-relaxed mb-8 border-b border-zinc-900 pb-8">
              {product.description || "No description available."}
            </p>

            {/* Display Options (No Selection) */}
            <div className="space-y-8 mb-8">
              {/* Display Sizes */}
              {product.size && product.size.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-4 uppercase tracking-widest">Available Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.size.map((s) => (
                      <span
                        key={s}
                        className="h-12 w-14 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 text-sm font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Display Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-4 uppercase tracking-widest">Available Colors</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((c) => {
                      const style = getColorStyle(c);
                      return (
                        <div
                          key={c}
                          className={`px-6 py-6 rounded-full border ${style.border} ${style.bg} ${style.text} text-xs flex items-center gap-2 capitalize`}
                        >
                          <span className={`w-3 h-3 rounded-full ${style.border}`}></span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Status & Action */}
            <div className="mt-auto pt-8 border-t border-zinc-900">
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm text-zinc-400">Availability</span>
                <span className={`text-sm font-medium ${product.inStock ? "text-green-400" : "text-red-400"}`}>
                  {product.inStock ? "● In Stock" : "○ Out of Stock"}
                </span>
              </div>

              {/* Cart Controls */}
              {qty > 0 ? (
                <div className="flex items-center justify-between bg-zinc-900/50 rounded-xl p-2 mb-4">
                  <button
                    onClick={removeFromCart}
                    disabled={cartLoading}
                    className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 transition-colors active:scale-95 disabled:opacity-50"
                    aria-label="Remove from cart"
                  >
                    {qty > 1 ? (
                      <span className="text-xl">−</span>
                    ) : (
                      <span className="text-xl">×</span>
                    )}
                  </button>
                  <div className="flex flex-col items-center px-4">
                    <span className="text-sm font-bold tabular-nums">{qty} in cart</span>
                   
                  </div>
                  <button
                    onClick={addToCart}
                    disabled={!product.inStock || cartLoading}
                    className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 transition-colors active:scale-95 disabled:opacity-50"
                    aria-label="Add more to cart"
                  >
                    <span className="text-xl">+</span>
                  </button>
                </div>
              ) : null}

              <button 
                onClick={addToCart}
                disabled={!product.inStock || cartLoading}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                  product.inStock
                    ? "bg-gradient-to-r from-white to-zinc-300 text-black hover:from-zinc-300 hover:to-white hover:shadow-lg hover:shadow-white/20"
                    : "bg-zinc-900 text-zinc-600"
                }`}
              >
                <ShoppingBag size={20} />
                {cartLoading ? "Processing..." : qty > 0 ? "Add More" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}
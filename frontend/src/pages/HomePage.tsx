import { useUser } from "@clerk/clerk-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import FloatingCartButton from "./CartButton";
import Advertisement from "../components/Advertisment";
/* ---------------- TYPES ---------------- */
type Product = {
  _id: string;
  title: string;
  price: number;
  colors?: string[];
  size?: string[];
  image?: string[];
  inStock: boolean;
};

type CartItem = {
  title: string;
  quantity: number;
};

/* ---------------- ICONS ---------------- */
const HeartIcon = ({ isFavorite }: { isFavorite: boolean }) => (
  <svg
    className={`w-5 h-5 transition-all duration-300 ${
      isFavorite ? "text-red-500 scale-110" : "text-zinc-400 hover:text-white"
    }`}
    fill={isFavorite ? "currentColor" : "none"}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={isFavorite ? 2 : 1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
    />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


/* ---------------- SKELETON LOADER ---------------- */
const ProductSkeleton = () => (
  <div className="bg-black animate-pulse rounded-2xl overflow-hidden border border-zinc-900">
    <div className="aspect-[3/4] bg-gradient-to-br from-zinc-900 to-black"></div>
    <div className="p-6 space-y-3">
      <div className="h-5 bg-zinc-900 rounded w-3/4"></div>
      <div className="h-4 bg-zinc-900 rounded w-1/2"></div>
      <div className="flex gap-2">
        <div className="h-6 w-12 bg-zinc-900 rounded-full"></div>
        <div className="h-6 w-12 bg-zinc-900 rounded-full"></div>
      </div>
      <div className="h-10 bg-zinc-900 rounded-xl mt-4"></div>
    </div>
  </div>
);

/* ---------------- COLOR MAP ---------------- */
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

/* ---------------- PAGE ---------------- */
export default function Home() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const emailId = user?.primaryEmailAddress?.emailAddress || null;

  /* ---------------- STATE ---------------- */
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [phoneExists, setPhoneExists] = useState<boolean | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [filterColor, setFilterColor] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const goToProduct = (id: string) => {
    navigate(`/product/${id}`);
  };
  
  
  /* ---------------- SCROLL ---------------- */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  /* ---------------- PHONE CHECK ---------------- */
  const checkPhone = useCallback(async () => {
    if (!emailId) {
      setPhoneExists(true);
      console.log(phoneExists)
      return;
    }
    setCheckingPhone(true);
    try {
      const res = await axiosClient.get("/auth/phoneNoExist", {
        params: { emailId },
      });
      setPhoneExists(res.data.exists);
    } catch {
      setPhoneExists(false);
    } finally {
      setCheckingPhone(false);
    }
  }, [emailId]);

  useEffect(() => {
    if (isLoaded) checkPhone();
  }, [isLoaded, checkPhone]);

  /* ---------------- FETCH PRODUCTS ---------------- */
  useEffect(() => {
    setIsLoading(true);
    axiosClient
      .get("/product/getAllProducts")
      .then(res => {
        setProducts(res.data.products || []);
        setIsLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setIsLoading(false);
      });
  }, []);

  /* ---------------- FETCH CART & FAV ---------------- */
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
      console.error("Failed to sync data", err);
    }
  }, [emailId]);

  useEffect(() => {
    if (emailId) fetchCartFav();
  }, [emailId, fetchCartFav]);

  /* ---------------- HELPERS ---------------- */
  const getQty = (title: string) =>
    cart.find(i => i.title === title)?.quantity || 0;

  const addToCart = async (title: string) => {
    if (!emailId) return navigate("/signup");
  
    await axiosClient.post(
      `/cart/addInCart`,
      { product: { title } },
      { params: { emailId } }
    );
  
    fetchCartFav();
  
    // 🔔 notify floating button
    window.dispatchEvent(new Event("cartUpdated"));
  };
  

  const removeFromCart = async (title: string) => {
    await axiosClient.delete(`/cart/removeProductFromCart`, {
      params: { emailId },
      data: { product: { title } },
    });
  
    fetchCartFav();
  
    // 🔔 notify floating button
    window.dispatchEvent(new Event("cartUpdated"));
  };
  

  const toggleFav = async (title: string) => {
    if (!emailId) return navigate("/signup");
    if (favourites.includes(title)) {
      await axiosClient.delete(`/cart/removeProductFromFavourites`, {
        params: { emailId },
        data: { title },
      });
    } else {
      await axiosClient.post(
        `/cart/addInFavourites`,
        { title },
        { params: { emailId } }
      );
    }
    fetchCartFav();
  };

  /* ---------------- FILTERS ---------------- */
  const filteredProducts = products.filter(p => {
    const priceOk = p.price >= priceRange[0] && p.price <= priceRange[1];
    const searchOk = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const colorOk = !filterColor || p.colors?.includes(filterColor);
    const sizeOk = !filterSize || p.size?.includes(filterSize);
    return priceOk && searchOk && colorOk && sizeOk;
  });

  const allColors = [
    ...new Set(products.flatMap(p => p.colors ?? []).filter(Boolean)),
  ];
  const allSizes = [
    ...new Set(products.flatMap(p => p.size ?? []).filter(Boolean)),
  ];

  /* ---------------- LOADING/PHONE CHECK ---------------- */
  if (!isLoaded || checkingPhone) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 uppercase tracking-widest text-sm">
            Loading Experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">


      {/* HERO HEADER */}
      <header className="relative pt-24  px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-transparent z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 px-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-300 to-zinc-500">
              THE COLLECTION
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 tracking-wide px-4">
            Premium performance gear engineered for the modern athlete
          </p>
        </div>
      </header>


<section className="pb-10">
<Advertisement />
</section>



      {/* FILTER BAR */}
      <div className="top-0 z-50 bg-black/95 backdrop-blur-xl border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between py-4 gap-4">
            {/* Search Bar */}
            <div className="relative w-full lg:w-auto lg:flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all placeholder:text-zinc-500 text-sm"
                placeholder="Search products, colors, sizes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                <FilterIcon />
                <span className="text-sm">Filters</span>
                {(filterColor ||
                  filterSize ||
                  priceRange[1] < 10000) && (
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                )}
              </button>

              {/* Desktop Filters */}
              <div
                className={`${
                  showFilters ? "flex" : "hidden"
                } lg:flex flex-wrap items-center gap-3 w-full lg:w-auto`}
              >
                {/* Color Filter */}
                <select
                  value={filterColor}
                  onChange={e => setFilterColor(e.target.value)}
                  className="flex-1 lg:flex-none min-w-[140px] bg-zinc-900/50 border border-zinc-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all text-sm cursor-pointer appearance-none"
                >
                  <option value="">All Colors</option>
                  {allColors.map(c => (
                    <option
                      key={c}
                      value={c}
                      className="bg-black capitalize"
                    >
                      {c}
                    </option>
                  ))}
                </select>

                {/* Size Filter */}
                <select
                  value={filterSize}
                  onChange={e => setFilterSize(e.target.value)}
                  className="flex-1 lg:flex-none min-w-[140px] bg-zinc-900/50 border border-zinc-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all text-sm cursor-pointer appearance-none"
                >
                  <option value="">All Sizes</option>
                  {allSizes.map(s => (
                    <option key={s} value={s} className="bg-black">
                      {s}
                    </option>
                  ))}
                </select>

                {/* Price Range Filter */}
                <div className="flex-1 lg:flex-none min-w-[200px]">
                  <div className="flex items-center gap-4 px-4 py-3 border border-zinc-800 rounded-lg">
                    <span className="text-xs text-zinc-400 whitespace-nowrap">
                      Price
                    </span>
                    <div className="flex-1">
                      <input
                        type="range"
                        min={0}
                        max={10000}
                        step={100}
                        value={priceRange[1]}
                        onChange={e =>
                          setPriceRange([0, +e.target.value])
                        }
                        className="w-full accent-white cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-zinc-500 mt-1">
                        <span>₹0</span>
                        <span className="font-medium">
                          Up to ₹
                          {priceRange[1].toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* PRODUCT GRID */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-12">
  {/* Results Info */}
  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-6 px-2 xs:px-4">
    {/* You can keep your “showing X products” text here if you had it */}

    {!isLoading && filteredProducts.length > 0 && (
      <div className="order-1 xs:order-2 flex items-center justify-between xs:justify-end gap-3 mb-3 xs:mb-0">
        {(filterColor || filterSize || priceRange[1] < 10000) && (
          <button
            onClick={() => {
              setFilterColor("");
              setFilterSize("");
              setPriceRange([0, 10000]);
            }}
            className="text-xs xs:text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1 px-3 py-1.5 xs:px-4 xs:py-2 bg-zinc-900/50 hover:bg-zinc-800 rounded-lg"
          >
            <CloseIcon />
            Clear filters
          </button>
        )}
      </div>
    )}
  </div>

  {isLoading ? (
    <div
      className="
        grid
        grid-cols-2            /* 2 per row on small screens */
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4         /* 4 per row on large screens */
        xl:grid-cols-4
        2xl:grid-cols-4
        gap-4 sm:gap-5 md:gap-6 lg:gap-8
      "
    >
      {[...Array(10)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  ) : (
    <>
      <div
        className="
          grid
          grid-cols-2          /* 2 per row on small screens */
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4       /* 4 per row on large screens */
          xl:grid-cols-4
          2xl:grid-cols-4
          gap-4 sm:gap-5 md:gap-6 lg:gap-8
        "
      >
        {filteredProducts.map(p => {
          const qty = getQty(p.title);
          const fav = favourites.includes(p.title);

          return (
            <div
            key={p._id}
            className="group relative bg-black rounded-xl md:rounded-2xl overflow-hidden border border-zinc-800 md:border-zinc-900 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg md:hover:shadow-2xl hover:shadow-white/5 cursor-pointer"
          >
          
              {/* Favorite Button */}
              <button
                onClick={() => toggleFav(p.title)}
                className="absolute top-2 right-2 md:top-3 md:right-3 z-20 p-2 md:p-2.5 bg-black/70 md:bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label={fav ? "Remove from favorites" : "Add to favorites"}
              >
                <HeartIcon isFavorite={fav} />
              </button>

              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-zinc-900 to-black"
              onClick={() => goToProduct(p._id)}>
                {p.image?.[0] ? (
                  <>
                    <img
                      src={p.image[0]}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-zinc-700 text-4xl md:text-5xl mb-2 md:mb-3">👕</div>
                      <p className="text-zinc-600 text-xs md:text-xs uppercase tracking-widest px-2">
                        No Image
                      </p>
                    </div>
                  </div>
                )}

                {!p.inStock && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-xs md:backdrop-blur-sm flex items-center justify-center">
                    <span className="px-3 md:px-4 py-1.5 md:py-2 bg-black/90 border border-white/20 text-xs md:text-sm tracking-widest uppercase rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 xs:p-4 sm:p-5 md:p-6">
                <div className="mb-3 md:mb-4">
                  <h3 className="font-medium md:font-semibold text-sm xs:text-base sm:text-lg md:text-xl mb-1.5 md:mb-2 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] group-hover:text-white/90 transition-colors leading-tight md:leading-snug">
                    {p.title}
                  </h3>

                  <div className="mb-2 md:mb-3">
                    <p className="text-lg xs:text-xl md:text-2xl font-bold">₹{p.price.toLocaleString()}</p>
                  </div>

                  {p.colors && p.colors.length > 0 && (
                    <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 flex-wrap">
                      <span className="text-[10px] md:text-xs text-zinc-500 whitespace-nowrap">Colors:</span>
                      <div className="flex items-center gap-1 md:gap-1.5 flex-1 flex-wrap">
                        {p.colors.slice(0, 2).map(color => {
                          const style = getColorStyle(color);
                          return (
                            <span
                              key={color}
                              className={`inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs border ${style.bg} ${style.text} ${style.border} capitalize truncate max-w-[80px] md:max-w-none`}
                              title={color}
                            >
                              <span className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-current flex-shrink-0"></span>
                              <span className="truncate">{color}</span>
                            </span>
                          );
                        })}
                        {p.colors.length > 2 && (
                          <span className="text-[10px] md:text-xs text-zinc-500">
                            +{p.colors.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {p.size && p.size.length > 0 && (
                    <div className="mb-2 md:mb-3">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-1.5">
                        <span className="text-[10px] md:text-xs text-zinc-500 whitespace-nowrap">Sizes:</span>
                        <div className="flex-1 overflow-x-auto pb-1 -mx-1 px-1">
                          <div className="flex items-center gap-1 md:gap-1.5 flex-nowrap">
                            {p.size.map(size => (
                              <span
                                key={size}
                                className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-zinc-900 text-zinc-300 rounded whitespace-nowrap flex-shrink-0"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 md:mt-4">
                  {qty > 0 ? (
                    <div className="flex items-center justify-between bg-zinc-900/50 rounded-lg md:rounded-xl p-1.5 md:p-2">
                      <button
                        onClick={() => removeFromCart(p.title)}
                        className="flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-md md:rounded-lg hover:bg-zinc-800 transition-colors active:scale-95"
                        aria-label="Remove one from cart"
                      >
                        {qty > 1 ? (
                          <MinusIcon />
                        ) : (
                          <span className="text-base md:text-lg">×</span>
                        )}
                      </button>
                      <div className="flex flex-col items-center px-1 md:px-2">
                        <span className="text-xs md:text-sm font-bold tabular-nums">{qty} in cart</span>
                     
                      </div>
                      <button
                        onClick={() => addToCart(p.title)}
                        className="flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-md md:rounded-lg hover:bg-zinc-800 transition-colors active:scale-95"
                        aria-label="Add one more to cart"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(p.title)}
                      disabled={!p.inStock}
                      className={`w-full py-2.5 xs:py-3 sm:py-4 md:py-4 rounded-lg md:rounded-xl font-medium transition-all duration-300 active:scale-[0.98] text-sm xs:text-base md:text-base ${
                        p.inStock
                          ? "bg-gradient-to-r from-white to-zinc-300 text-black hover:from-zinc-300 hover:to-white hover:shadow-lg hover:shadow-white/20"
                          : "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                      }`}
                    >
                      {p.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-12 xs:py-16 md:py-24">
          <div className="max-w-md mx-auto px-4">
            <div className="text-5xl xs:text-6xl mb-4">🛍️</div>
            <h3 className="text-lg xs:text-xl font-semibold mb-2">No products found</h3>
            <p className="text-zinc-400 text-sm xs:text-base mb-6">
              {searchQuery
                ? `No products match "${searchQuery}". Try different keywords.`
                : "No products available with the current filters."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterColor("");
                setFilterSize("");
                setPriceRange([0, 10000]);
              }}
              className="inline-flex items-center gap-2 px-4 xs:px-6 py-2.5 xs:py-3 bg-white text-black rounded-lg xs:rounded-xl font-medium hover:bg-zinc-200 transition-colors text-sm xs:text-base"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </>
  )}
</main>

    
<FloatingCartButton />
    </div>
  );
}

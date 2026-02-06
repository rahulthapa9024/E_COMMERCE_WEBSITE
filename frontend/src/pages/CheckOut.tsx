import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from "@clerk/clerk-react";
import { toast } from 'react-toastify';
import axiosClient from '../utils/axiosClient';
import ShimmerEffect from './ShimmerPage';
import { MapPin, ArrowRight, X, ChevronRight, AlertCircle } from 'lucide-react';

/* ---------------- TYPES ---------------- */
interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  image?: string[];
  inStock?: boolean;
  colors?: string[];
  size?: string[];
  quantity: number;
  totalPrice: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface Address {
  city?: string;
  fullName?: string;
  houseNo?: string;
  landmark?: string;
  streetAddress?: string;
  state?: string;
  postalCode?: string;
}

/* ---------------- ANIMATION VARIANTS ---------------- */
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

/* ---------------- SUB-COMPONENTS ---------------- */
const AddressCard: React.FC<{ address: Address | null; phoneNo: string | null; onEdit: () => void }> = ({ address, phoneNo, onEdit }) => (
  <motion.div 
    variants={fadeInUp}
    className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-[2rem] p-6 md:p-8"
  >
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
          <MapPin className="w-5 h-5 text-black" />
        </div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Shipping Protocol</h2>
      </div>
      <button onClick={onEdit} className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
        Edit
      </button>
    </div>
    
    {address && address.city ? (
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div>
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Recipient</p>
          <p className="text-sm font-bold text-white uppercase">{address.fullName}</p>
          <p className="text-xs font-mono text-zinc-400 mt-1">{phoneNo}</p>
        </div>
        <div className="md:text-right">
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Hub Location</p>
          <p className="text-sm text-zinc-300 uppercase tracking-tighter leading-relaxed">
            {address.houseNo}, {address.streetAddress}<br />
            {address.city}, {address.state} {address.postalCode}
          </p>
        </div>
      </div>
    ) : (
      <div className="py-8 text-center border border-dashed border-zinc-800 rounded-2xl">
        <button onClick={onEdit} className="text-[10px] font-black uppercase tracking-[0.2em] text-white hover:underline">
          Assign Delivery Credentials +
        </button>
      </div>
    )}
  </motion.div>
);

const CheckoutItem: React.FC<{ 
  product: Product; 
  onVariantChange: any; 
  onNavigate: (id: string) => void; 
  updatingStates: any 
}> = ({ product, onVariantChange, onNavigate, updatingStates }) => {
  const isMissingVariant = !product.selectedColor || !product.selectedSize;

  return (
    <motion.div 
      variants={fadeInUp}
      className={`flex flex-col sm:flex-row gap-6 py-10 border-b border-zinc-900 last:border-0 group transition-opacity ${isMissingVariant ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
    >
      <div 
        onClick={() => onNavigate(product._id)}
        className="relative w-full sm:w-40 h-52 sm:h-48 shrink-0 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 cursor-pointer"
      >
        <img 
          src={product.image?.[0]} 
          alt={product.title} 
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
        />
        {isMissingVariant && (
          <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="text-red-500 w-8 h-8 animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 
            onClick={() => onNavigate(product._id)}
            className="text-lg font-black uppercase tracking-tighter text-white cursor-pointer hover:text-zinc-400 transition-colors flex items-center gap-2"
          >
            {product.title} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <span className="text-sm font-mono text-white">₹{product.totalPrice.toLocaleString()}</span>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed mb-6 line-clamp-2 max-w-xl">
          {product.description || "Premium high-performance equipment designed for maximum durability and aesthetic precision."}
        </p>
        
        <div className="mt-auto flex flex-wrap gap-8">
          <div className="space-y-3">
            <span className={`text-[9px] font-black uppercase tracking-widest ${!product.selectedColor ? 'text-red-500' : 'text-zinc-600'}`}>
              Color Selection {!product.selectedColor && '*'}
            </span>
            <div className="flex gap-2">
              {product.colors?.map(c => (
                <button
                  key={c}
                  onClick={() => onVariantChange(product._id, product.title, 'Color', c)}
                  className={`w-6 h-6 rounded-full border-1 flex items-center justify-center transition-all ${product.selectedColor === c ? 'border-white scale-125' : 'border-zinc-400'}`}
                >
                  <div className="w-full h-full rounded-full" style={{ backgroundColor: c }} />
                  {updatingStates[`${product._id}-Color`]?.status === 'loading' && product.selectedColor === c && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center"><div className="w-2 h-2 border border-white/50 border-t-white rounded-full animate-spin"/></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className={`text-[9px] font-black uppercase tracking-widest ${!product.selectedSize ? 'text-red-500' : 'text-zinc-600'}`}>
              Size {!product.selectedSize && '*'}
            </span>
            <div className="flex gap-2">
              {product.size?.map(s => (
                <button 
                  key={s}
                  onClick={() => onVariantChange(product._id, product.title, 'Size', s)}
                  className={`text-[9px] font-black px-3 py-1.5 rounded-lg border transition-all ${product.selectedSize === s ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-500'}`}
                >
                  {updatingStates[`${product._id}-Size`]?.status === 'loading' && product.selectedSize === s ? '...' : s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ---------------- MAIN PAGE ---------------- */
const CheckOutPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const emailId = user?.primaryEmailAddress?.emailAddress || null;

  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [phoneNo, setPhoneNo] = useState<string | null>(null);
  const [phoneNoExists, setPhoneNoExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingStates, setUpdatingStates] = useState<any>({});

  const fetchData = async () => {
    if (!isLoaded || !user) return;
    try {
      const cartRes = await axiosClient.get("/cart/getCart", { params: { emailId } });
      const cartData = cartRes.data.cart || [];
      if (cartData.length === 0) { setCartProducts([]); setLoading(false); return; }

      const [addr, ph, phEx] = await Promise.all([
        axiosClient.get(`/auth/address/${emailId}`).catch(() => ({ data: { address: null } })),
        axiosClient.get(`/auth/phone/${emailId}`).catch(() => ({ data: { phoneNo: null } })),
        axiosClient.get("/auth/phoneNoExist", { params: { emailId } }).catch(() => ({ data: { exists: false } }))
      ]);

      setAddress(addr.data.address);
      setPhoneNo(ph.data.phoneNo);
      setPhoneNoExists(phEx.data.exists);

      const titles = cartData.map((i: any) => i.title);
      const prodRes = await axiosClient.get(`/product/fetchProductByTitle?titles=${titles.join(',')}`);
      const prodData = prodRes.data.products || [];

      const final = prodData.map((p: any) => {
        const item = cartData.find((i: any) => i.title === p.title);
        return { 
          ...p, 
          quantity: item.quantity, 
          totalPrice: p.price * item.quantity, 
          selectedColor: item.color, 
          selectedSize: item.size 
        };
      });
      setCartProducts(final);
    } catch (e) { toast.error("Manifest synchronization failed."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [isLoaded, user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  useEffect(() => {
    const verifyCheckoutAccess = async () => {
      const res = await axiosClient.get("/cart/getCart", { params: { emailId } })
  
      if (!res.data.cart || res.data.cart.length === 0) {
        navigate("/cart", { replace: true });
      }
    };
  
    verifyCheckoutAccess();
  }, []);
  
  const handleVariantChange = async (productId: string, title: string, type: 'Size' | 'Color', value: string) => {
    const key = `${productId}-${type}`;
    setUpdatingStates((prev: any) => ({ ...prev, [key]: { status: 'loading' } }));
    try {
      await axiosClient.post(`/cart/addProduct${type}`, { title, [type.toLowerCase()]: value }, { params: { emailId } });
      setCartProducts(prev => prev.map(p => p._id === productId ? { ...p, [type === 'Size' ? 'selectedSize' : 'selectedColor']: value } : p));
    } catch { toast.error("Update failed"); }
    finally { setUpdatingStates((prev: any) => ({ ...prev, [key]: null })); }
  };

  /* ---------------- VALIDATION ---------------- */
  const total = cartProducts.reduce((sum, p) => sum + p.totalPrice, 0);
  const validationErrors: string[] = [];
  
  if (!address?.city) validationErrors.push("Address credentials required");
  if (!phoneNoExists) validationErrors.push("Phone verification required");
  
  const incompleteItems = cartProducts.filter(p => !p.selectedColor || !p.selectedSize);
  if (incompleteItems.length > 0) {
    validationErrors.push(`${incompleteItems.length} item(s) missing color or size`);
  }

  const isLocked = validationErrors.length > 0 || cartProducts.length === 0;

  if (loading) return <ShimmerEffect />;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-40 lg:pb-32">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* LEFT: INFORMATION & ITEMS */}
          <div className="flex-1 space-y-16">
            <header>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-4">
                Verify <br/> <span className="text-zinc-800">Order</span>
              </h1>
              <p className="text-zinc-500 text-xs font-medium max-w-sm uppercase tracking-widest leading-loose">
                Review your configuration. Every item must have a specific color and size assigned before proceeding to the payment gateway.
              </p>
            </header>

            <AddressCard address={address} phoneNo={phoneNo} onEdit={() => navigate('/manageAddress')} />

            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-8 flex items-center gap-4">
                Selected Products <div className="h-px flex-1 bg-zinc-900" />
              </h2>
              {cartProducts.map(p => (
                <CheckoutItem 
                  key={p._id} 
                  product={p} 
                  onVariantChange={handleVariantChange} 
                  onNavigate={(id) => navigate(`/product/${id}`)}
                  updatingStates={updatingStates} 
                />
              ))}
            </motion.div>
          </div>

          {/* RIGHT: SUMMARY (Sticky) */}
          <aside className="lg:w-[400px]">
            <div className="lg:sticky lg:top-32 space-y-6">
              <div className="bg-white text-black rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-white/5">
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] mb-12 flex justify-between items-center">
                  Summary <span>0{cartProducts.length}</span>
                </h2>
                
                <div className="space-y-6 mb-12">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                    <span>Net Subtotal</span>
                    <span className="text-black font-mono">₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                    <span>Priority Logistics</span>
                    <span className="text-emerald-600">FREE</span>
                  </div>
                  <div className="pt-8 border-t border-black/5 flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-tighter">Total Payable</span>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">Inc. all taxes</span>
                    </div>
                    <span className="text-4xl font-black tracking-tighter leading-none">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <AnimatePresence>
                  {validationErrors.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-8 p-6 bg-red-50 rounded-3xl border border-red-100"
                    >
                      {validationErrors.map(err => (
                        <div key={err} className="flex items-center gap-2 text-red-600 mb-1 last:mb-0">
                          <X size={12} strokeWidth={3} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{err}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
onClick={() =>
  navigate('/payment', {
    state: {
      fromCheckout: true,
      amount: total
    }
  })
}

                  disabled={isLocked}
                  className="group relative w-full py-6 bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[11px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-10 disabled:grayscale disabled:hover:scale-100"
                >
                  {incompleteItems.length > 0 ? "Complete Selections" : "Confirm & Pay"} 
                  {!isLocked && <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />}
                </button>
              </div>
              
              <div className="px-10 text-center">
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest leading-loose">
                  By clicking confirm, you agree to our <br/> 
                  <span className="text-zinc-400 hover:text-white cursor-pointer underline">Terms of Service</span> and <span className="text-zinc-400 hover:text-white cursor-pointer underline">Return Policy</span>.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* MOBILE STICKY FOOTER */}
      <div className="lg:hidden fixed bottom-0 w-full bg-black/80 backdrop-blur-2xl border-t border-zinc-900 px-6 py-4 flex items-center justify-between z-50">
        <div>
          <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest">
            {incompleteItems.length > 0 ? "Selections Required" : "Total"}
          </p>
          <p className={`text-lg font-black tracking-tighter ${incompleteItems.length > 0 ? 'text-zinc-700' : 'text-white'}`}>
            ₹{total.toLocaleString()}
          </p>
        </div>
        <button 
onClick={() =>
  navigate('/payment', {
    state: {
      fromCheckout: true,
      amount: total
    }
  })
}

          disabled={isLocked}
          className="bg-white text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest disabled:opacity-20"
        >
          {incompleteItems.length > 0 ? "Fix Selection" : "Proceed"}
        </button>
      </div>
    </div>
  );
};

export default CheckOutPage;
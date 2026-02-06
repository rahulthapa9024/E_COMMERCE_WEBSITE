import { useUser, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../utils/axiosClient";
import type { MouseEvent } from "react";
type NavItemProps = {
  to: string;
  label: string;
  mobile?: boolean;
  protected?: boolean;
};
import {
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

export default function TopBar() {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [cartQuantity, setCartQuantity] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const emailId = user?.primaryEmailAddress?.emailAddress;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchCartQuantity = useCallback(async () => {
    if (!emailId) return setCartQuantity(0);
    try {
      const res = await axiosClient.get(`/cart/getCartQuantity/${emailId}`);
      setCartQuantity(res.data.quantity || 0);
    } catch (err) {
      setCartQuantity(0);
    }
  }, [emailId]);

  useEffect(() => {
    if (isLoaded) fetchCartQuantity();
    const handleUpdate = () => fetchCartQuantity();
    window.addEventListener("cartUpdated", handleUpdate);
    const interval = setInterval(fetchCartQuantity, 5000);
    return () => {
      window.removeEventListener("cartUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, [isLoaded, fetchCartQuantity]);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const handleProtectedNavigation = (
    e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    destination: string
  ) => {
    e.preventDefault();
    setIsSidebarOpen(false);
  
    if (!isSignedIn) {
      navigate("/signup");
    } else {
      navigate(destination);
    }
  };
  

  /* ---------------- COMPONENTS ---------------- */
  const NavItem = ({
    to,
    label,
    mobile = false,
    protected: isProtected = false,
  }: NavItemProps) => (
    <Link
      to={to}
      onClick={(e) =>
        isProtected
          ? handleProtectedNavigation(e, to)
          : setIsSidebarOpen(false)
      }
      className={
        mobile
          ? "flex items-center justify-between text-[15px] font-medium text-zinc-300 py-4 px-3 rounded-lg hover:bg-white/5 transition-all group"
          : "text-[12px] font-medium tracking-[0.15em] text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5 relative"
      }
    >
      {label}
      {mobile && (
        <ChevronRight
          size={16}
          className="text-zinc-600 group-hover:text-zinc-400 transition-colors"
        />
      )}
      {!mobile && (
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white transition-all group-hover:w-4" />
      )}
    </Link>
  );
  

  return (
    <>
  

      {/* Main Header */}
      <header className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/95 border-b border-white/10 shadow-lg shadow-black/20' 
          : 'bg-black/90'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              
              <span className="text-3xl  font-black tracking-tight text-white">
                FITNESTYLE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <NavItem to="/menPage" label="MEN'S" />
              <NavItem to="/collections" label="COLLECTIONS" />
              <NavItem to="/contact" label="CONTACT" />
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 sm:gap-4">

              {/* Wishlist */}
              <button 
                onClick={(e) => handleProtectedNavigation(e, "/favourites")}
                className="relative flex items-center justify-center w-10 h-10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors group"
                title="Wishlist"
              >
                <Heart size={18} className="group-hover:scale-110 transition-transform" />
              </button>

              {/* Cart */}
              <button 
                onClick={(e) => handleProtectedNavigation(e, "/cart")}
                className="relative flex items-center justify-center w-10 h-10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors group"
                title="Cart"
              >
                <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                {cartQuantity > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-[10px] font-bold rounded-full flex items-center justify-center text-white border-2 border-black"
                  >
                    {cartQuantity > 99 ? '99+' : cartQuantity}
                  </motion.span>
                )}
              </button>

              {/* User Account (Desktop) */}
              <SignedIn>
                <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/10 ml-2">
                  <Link 
                    to="/account" 
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 group-hover:border-white/40 transition-colors">
                        <img 
                          src={user?.imageUrl} 
                          alt="User" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    </div>
                  </Link>
                </div>
              </SignedIn>

              <SignedOut>
                <div className="hidden lg:flex items-center gap-3 pl-2 border-l border-white/10 ml-2">
                  <Link 
                    to="/signup" 
                    className="text-xs font-medium text-zinc-400 hover:text-white transition-colors px-3 py-1.5"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="text-xs font-medium bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </SignedOut>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 z-[60] lg:hidden"
            />
            
            {/* Sidebar */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-black border-l border-white/10 z-[70] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-white">FITNESTYLE</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* User Info */}
              <SignedIn>
                <div className="p-6 border-b border-white/10">
                  <Link 
                    to="/account" 
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center gap-4 group"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-white/40 transition-colors">
                        <img 
                          src={user?.imageUrl} 
                          className="w-full h-full object-cover"
                          alt="User"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{user?.fullName}</p>
                      <p className="text-xs text-zinc-500">{emailId}</p>
                    </div>
                    <ChevronRight size={18} className="text-zinc-600" />
                  </Link>
                </div>
              </SignedIn>

              <SignedOut>
                <div className="p-6 border-b border-white/10">
                  <p className="text-white font-medium mb-3">Welcome to FITNESTYLE</p>
                  <div className="flex gap-3">
                    <Link 
                      to="/signup" 
                      onClick={() => setIsSidebarOpen(false)}
                      className="flex-1 text-center text-sm font-medium text-zinc-300 border border-white/10 py-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup" 
                      onClick={() => setIsSidebarOpen(false)}
                      className="flex-1 text-center text-sm font-medium bg-white text-black py-3 rounded-lg hover:bg-zinc-100 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              </SignedOut>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 px-3">Shop</p>
                  <NavItem to="/menPage" label="Men's Collection" mobile />
                  <NavItem to="/" label="Collections" mobile />
                  
                  <div className="pt-6 mt-6 border-t border-white/10">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 px-3">Account</p>
                    <NavItem to="/favourites" label="My Wishlist" mobile protected />
                    <NavItem to="/cart" label="My Cart" mobile protected />
                    <NavItem to="/userHistory" label="My Orders" mobile protected />
                    <NavItem to="/account" label="Account Settings" mobile />
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 px-3">Help</p>
                    <NavItem to="/contact" label="Contact Us" mobile />
                    <NavItem to="/userBeingDelivered" label="Shipping Info" mobile />
                    <NavItem to="/userBeingReturned" label="Return Request" mobile />
                  </div>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
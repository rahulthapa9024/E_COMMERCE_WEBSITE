"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import axiosClient from "../utils/axiosClient";

type Product = {
  _id: string;
  title: string;
  price: number;
  image?: string[];
};

const Advertisement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosClient.get("/product/getAllProducts");
        setProducts((res.data.products || []).slice(0, 5));
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const slideNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1 === products.length ? 0 : prev + 1));
  }, [products.length]);

  const slidePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  // Autoplay effect
  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(slideNext, 5000);
    return () => clearInterval(interval);
  }, [slideNext, products.length]);

  if (loading || products.length === 0) return null;

  const currentProduct = products[currentIndex];

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <section className="relative w-full h-[20rem] md:h-[24rem] bg-black border-y border-zinc-800 overflow-hidden group">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0 flex h-full w-full items-center"
        >
          {/* CONTENT AREA */}
          <div className="w-1/2 md:w-[40%] px-6 md:px-16 lg:px-24 z-10 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] tracking-[0.4em] text-zinc-500 uppercase font-bold">
                Limited Edition
              </span>
              <h2 className="text-3xl md:text-5xl font-light text-white uppercase tracking-tighter leading-none break-words">
                {currentProduct.title}
              </h2>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <p className="text-xl md:text-2xl font-mono text-zinc-300">
                ₹{currentProduct.price.toLocaleString()}
              </p>
              <button
                onClick={() => (window.location.href = `/product/${currentProduct._id}`)}
                className="flex items-center gap-2 text-white border-b border-white pb-1 text-[10px] uppercase tracking-widest hover:text-zinc-400 hover:border-zinc-400 transition-all w-fit"
              >
                View Details <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* IMAGE AREA */}
          <div className="w-1/2 md:w-[60%] h-full relative overflow-hidden bg-zinc-900">
            {currentProduct.image?.[0] ? (
              <>
                <img
                  src={currentProduct.image[0]}
                  alt={currentProduct.title}
                  className="w-full h-full object-cover contrast-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent md:hidden" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-zinc-700" />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* CUSTOM NAVIGATION CONTROLS */}
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <button
          onClick={slidePrev}
          className="p-2 text-white/20 hover:text-white transition-all pointer-events-auto hidden md:block"
        >
          <ChevronLeft size={32} strokeWidth={1} />
        </button>
        <button
          onClick={slideNext}
          className="p-2 text-white/20 hover:text-white transition-all pointer-events-auto hidden md:block"
        >
          <ChevronRight size={32} strokeWidth={1} />
        </button>
      </div>

      {/* PAGINATION DOTS */}
      <div className="absolute bottom-6 left-6 md:left-16 lg:left-24 flex gap-2 z-20">
        {products.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`h-1.5 transition-all duration-300 ${
              idx === currentIndex ? "w-8 bg-white" : "w-1.5 bg-zinc-700"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Advertisement;
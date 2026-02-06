import { SignIn } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useEffect} from "react";
import { useLocation } from 'react-router-dom';
export default function SignInPage() {

    const { pathname } = useLocation();
  // Mouse tracking for parallax and spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  // Parallax calculations for the "ACCESS" background text
  const xTranslate = useSpring(useTransform(mouseX, [0, 2000], [20, -20]), { stiffness: 50, damping: 20 });
  const yTranslate = useSpring(useTransform(mouseY, [0, 1000], [10, -10]), { stiffness: 50, damping: 20 });

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#050505] text-white selection:bg-zinc-800 flex flex-col items-center justify-center font-sans">
      
      {/* 1. DYNAMIC SPOTLIGHT OVERLAY */}
      <motion.div 
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.04), transparent 80%)`
          )
        }}
      />

      {/* 2. ENHANCED BACKGROUND TEXT WITH PARALLAX */}
      <motion.div 
        style={{ x: xTranslate, y: yTranslate }}
        className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-40"
      >
        <h1 className="text-[clamp(10rem,30vw,35rem)] font-black text-zinc-900 uppercase tracking-tighter italic leading-none select-none filter blur-[2px]">
          Access
        </h1>
      </motion.div>

      {/* 3. MOVING GRID OVERLAY */}
      <motion.div 
        animate={{ 
          backgroundPosition: ["0px 0px", "64px 64px"],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]"
      />

      {/* 4. BIOMETRIC SCAN LINE ANIMATION */}
      <motion.div 
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"
      />

      {/* BRAND HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 text-center mb-8 space-y-3"
      >
        <div className="relative inline-block">
          <h1 className="text-5xl sm:text-7xl font-black tracking-[-0.04em] text-white uppercase italic relative">
            FITNESTYLE
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.8 }}
              className="absolute -bottom-2 left-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent"
            />
          </h1>
        </div>
        <p className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-[0.5em] font-light mt-4">
          Equip. Evolve. Exceed.
        </p>
      </motion.div>

      {/* SIGN IN COMPONENT */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative z-10 flex items-center justify-center w-full max-w-md px-4"
      >
        <div className="relative group w-full">
          {/* Animated Border Glow */}
          <div className="absolute  from-zinc-700 to-transparent rounded-sm opacity-50"></div>
          
          <div className="relative border-zinc-800 shadow-2xl overflow-hidden">
            <SignIn 
              appearance={{
                baseTheme: dark,
                elements: {
                  card: "bg-transparent shadow-none border-none p-6 sm:p-8",
                  headerTitle: "hidden",
                  headerSubtitle: "text-zinc-500 text-sm mb-8 text-center w-full font-light",
                  socialButtonsBlockButton: "bg-zinc-950 border-zinc-800 hover:bg-zinc-900 transition-all duration-300 rounded-none hover:border-zinc-600 h-12",
                  socialButtonsBlockButtonText: "text-zinc-400 font-medium tracking-tight",
                  formButtonPrimary: "bg-white text-black hover:bg-zinc-200 transition-all duration-500 rounded-none font-bold tracking-widest uppercase text-xs py-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]",
                  footerActionLink: "text-white hover:text-zinc-400 transition-colors font-medium underline underline-offset-4",
                  dividerLine: "bg-zinc-800",
                  dividerText: "text-zinc-600 text-[10px] uppercase tracking-widest",
                  formFieldInput: "bg-zinc-950 border-zinc-800 focus:border-white focus:ring-0 transition-all duration-500 rounded-none py-6 text-base",
                  formFieldLabel: "text-zinc-500 text-[10px] uppercase tracking-widest mb-2 font-bold",
                  footer: "bg-[#080808] border-t border-zinc-900",
                },
              }}
            />
          </div>
        </div>
      </motion.div>


      {/* CORNER DECORATIONS WITH PULSE */}
      {[
        "top-8 left-8 border-l border-t", 
        "top-8 right-8 border-r border-t", 
        "bottom-8 left-8 border-l border-b", 
        "bottom-8 right-8 border-r border-b"
      ].map((pos, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 + (i * 0.1) }}
          className={`absolute w-4 h-4 border-zinc-700 ${pos}`} 
        />
      ))}
    </div>
  );
}

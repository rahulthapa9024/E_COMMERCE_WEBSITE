import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, Twitter, Instagram, Linkedin, ArrowUpRight } from 'lucide-react';

/* ---------------- TYPES ---------------- */
interface ContactItem {
  label?: string;
  value: string;
  link?: string;
}

interface ContactMethod {
  title: string;
  icon: React.ReactNode;
  items: ContactItem[];
}

export default function Contact() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  const contactMethods: ContactMethod[] = [
    {
      title: "Electronic Mail",
      icon: <Mail className="w-5 h-5" />,
      items: [
        { label: "Support", value: "support@fitnestyle.com", link: "mailto:support@fitnestyle.com" },
        { label: "Concierge", value: "vip@fitnestyle.com", link: "mailto:vip@fitnestyle.com" }
      ]
    },
    {
      title: "Voice & Direct",
      icon: <Phone className="w-5 h-5" />,
      items: [
        { label: "Global", value: "+1 (800) FIT-NEST", link: "tel:+18003486378" },
        { label: "Headquarters", value: "+1 (212) 555-0199", link: "tel:+12125550199" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Twitter", icon: <Twitter className="w-5 h-5" />, link: "#" },
    { name: "Instagram", icon: <Instagram className="w-5 h-5" />, link: "#" },
    { name: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, link: "#" }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* BACKGROUND ACCENTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-900/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-zinc-900/20 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 pt-32 pb-20 px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
            Get In <br />
            <span className="text-zinc-600">Touch</span>
          </h1>
          <p className="mt-8 text-zinc-500 text-sm md:text-base tracking-[0.2em] uppercase max-w-xl">
            Our concierge team is available 24/7 to assist with your premium selections and inquiries.
          </p>
        </motion.div>

        {/* CONTACT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800/50 border border-zinc-800/50">
          {contactMethods.map((method, index) => (
            <motion.div 
              key={method.title}
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: index * 0.2 }}
              className="bg-black p-10 lg:p-16 hover:bg-zinc-950 transition-colors group"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 border border-zinc-800 rounded-full group-hover:border-white transition-colors">
                  {method.icon}
                </div>
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-500 group-hover:text-white">
                  {method.title}
                </h3>
              </div>

              <div className="space-y-8">
                {method.items.map((item, i) => (
                  <div key={i} className="block group/item">
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-medium">
                      {item.label}
                    </span>
                    <a 
                      href={item.link} 
                      className="text-xl md:text-2xl font-light hover:text-zinc-400 transition-colors flex items-center gap-2"
                    >
                      {item.value}
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-all -translate-y-1" />
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* SOCIAL & FOOTER AREA */}
        <motion.footer 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.6 }}
          className="mt-24 pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-10"
        >
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 mb-6">Social Directories</h3>
            <div className="flex gap-8">
              {socialLinks.map((social) => (
                <a 
                  key={social.name} 
                  href={social.link}
                  className="text-zinc-500 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="text-left md:text-right">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 mb-2">Office</h3>
            <p className="text-sm text-zinc-400 font-light">
              7th Avenue, Fashion District<br />
              New York, NY 10018
            </p>
          </div>
        </motion.footer>

      </main>
    </div>
  );
}
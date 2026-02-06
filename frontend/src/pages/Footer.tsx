import { memo } from 'react';
import { Link } from 'react-router-dom';

interface FooterSection {
  title: string;
  items: FooterItem[];
}

interface FooterItem {
  text: string;
  link: string;
}

const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections: FooterSection[] = [
    {
      title: "Shop",
      items: [
        { text: "All Products", link: "/" },
        { text: "Men's Collection", link: "/menPage" },
        { text: "Favorites", link: "/favourites" },
        { text: "Cart", link: "/cart" },
      ]
    },
    {
      title: "Support",
      items: [
        { text: "Contact Us", link: "/contact" },
        { text: "Shipping", link: "/userBeingDelivered" },
        { text: "Account", link: "/account" },
      ]
    },
    {
      title: "Company",
      items: [
        { text: "Terms of Service", link: "/terms" },
        { text: "Privacy Policy", link: "/privacy" },
        { text: "About Us", link: "/about" },
      ]
    }
  ];

  return (
    <footer role="contentinfo" className="w-full bg-black text-white border-t border-zinc-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-300 to-zinc-500">
                FITNESTYLE
              </span>
            </h2>
            <p className="max-w-md text-zinc-400 text-sm sm:text-base leading-relaxed">
              High-performance athletic wear engineered for excellence. Premium quality, superior comfort.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span className="text-xs text-zinc-500 uppercase tracking-widest">Premium Collection</span>
            </div>
          </div>
          
          {/* Dynamic Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-6 text-zinc-300 border-b border-zinc-800 pb-2">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.text}>
                    <Link 
                      to={item.link} 
                      className="text-zinc-500 hover:text-white text-sm transition-all duration-300 hover:translate-x-1 block group"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-zinc-700 group-hover:bg-white transition-colors"></span>
                        {item.text}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-12 border-t border-zinc-900"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">
              © {currentYear} FITNESTYLE
            </p>
            <p className="text-[9px] text-zinc-700 mt-1">
              All rights reserved. Premium athletic wear.
            </p>
          </div>

          {/* Additional Links */}
          <div className="flex items-center gap-6">
            <Link 
              to="/faq" 
              className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
            <Link 
              to="/size-guide" 
              className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              Size Guide
            </Link>
            <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
            <Link 
              to="/care" 
              className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              Care Instructions
            </Link>
          </div>
        </div>

        {/* Premium Badge */}
        <div className="mt-8 pt-6 border-t border-zinc-900 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <span className="text-[8px] uppercase tracking-[0.3em] text-zinc-400">
              Premium Quality • Crafted with Excellence
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
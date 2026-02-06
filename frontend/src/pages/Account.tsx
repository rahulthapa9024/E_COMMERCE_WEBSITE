import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";

import { useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import ShimmerEffect from "./ShimmerPage";

// --- Modern Icon Components (Lucide Style) ---

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}
const containerVariants: Variants = { 
  hidden: { opacity: 0 }, 
  show: { 
    opacity: 1, 
    transition: { staggerChildren: 0.07 } 
  } 
};

const itemVariants: Variants = { 
  hidden: { opacity: 0, y: 20 }, 
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100 } 
  } 
};

// Generic props for consistency
const defaultIconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const ShoppingBagIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const HistoryIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const TruckIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
);

const MapPinIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PlusCircleIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

const EditIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const LogOutIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const LogInIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" x2="3" y1="12" y2="12" />
  </svg>
);

const ChevronRightIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);



const AlertCircleIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const RotateCcwIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const UndoIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
  </svg>
);

const PackageCheckIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="m16 16 2 2 4-4" />
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22v-9.9" />
  </svg>
);

const TicketIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

const BellRingIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    <path d="M4 2C2.8 3.7 2 5.7 2 8" />
    <path d="M22 8c0-2.3-.8-4.3-2-6" />
  </svg>
);

const ClipboardXIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="m15 11-6 6" />
    <path d="m9 11 6 6" />
  </svg>
);

// --- Types ---
interface MenuOption {
  id: number;
  title: string;
  path: string;
  icon: React.ReactNode;
}

function Account() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, [location.pathname]);

  const emailId = user?.primaryEmailAddress?.emailAddress;
  const iconClass = "w-6 h-6 mr-4 text-white flex-shrink-0";

  // Check if user is admin (you might want to adjust this logic)
  const isAdmin = user?.emailAddresses[0]?.emailAddress === import.meta.env.VITE_ADMIN_EMAIL || false;
  const options: Record<string, MenuOption[]> = {
    user: [
      { id: 1, title: "Orders History", path: "/userHistory", icon: <ShoppingBagIcon className={iconClass}/> },
      { id: 2, title: "Being Delivered", path: "/userBeingDelivered", icon: <TruckIcon className={iconClass}/> },
      { id: 3, title: "Your Return Request", path: "/userBeingReturned", icon: <UndoIcon className={iconClass}/> },
      { id: 4, title: "Your Rejected Orders", path: "/userRejected", icon: <AlertCircleIcon className={iconClass}/> },
      { id: 5, title: "Manage Address", path: "/manageAddress", icon: <MapPinIcon className={iconClass}/> },
      { id: 6, title: "Your Returned Products", path: "/userReturnedHistory", icon: <PackageCheckIcon className={iconClass}/> }
    ],
    admin: [
      { id: 7, title: "New Orders", path: "/admin/new-orders", icon: <BellRingIcon className={iconClass}/> },
      { id: 8, title: "History", path: "/admin/adminHistory", icon: <HistoryIcon className={iconClass}/> },
      { id: 9, title: "Return Request", path: "/admin/returnRequest", icon: <UndoIcon className={iconClass}/> },
      { id: 10, title: "Rejected Orders", path: "/admin/rejectedOrders", icon: <ClipboardXIcon className={iconClass}/> },
      { id: 11, title: "Add Products", path: "/admin/addProducts", icon: <PlusCircleIcon className={iconClass}/> },
      { id: 12, title: "Update Products", path: "/admin/updateProducts", icon: <EditIcon className={iconClass}/> },
      { id: 13, title: "Remove Products", path: "/admin/removeProducts", icon: <TrashIcon className={iconClass}/> },
      { id: 14, title: "Returned Orders", path: "/admin/AdminReturnedHistory", icon: <RotateCcwIcon className={iconClass}/> },
      { id: 15, title: "Manage Coupons", path: "/admin/addCoupon", icon: <TicketIcon className={iconClass}/> }
    ]
  };

  const mainOptions = user ? (isAdmin ? options.admin : options.user) : [];


  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isLoaded) {
    return <ShimmerEffect />;
  }

  return (
    <div className="min-h-screen relative bg-black text-white overflow-hidden">
      {/* Black and white gradient background */}
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-black via-gray-900 to-black -z-10" />
      <div className="fixed top-[-10rem] right-[-15rem] w-[40rem] h-[40rem] bg-white/5 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="fixed bottom-[-5rem] left-[-10rem] w-[30rem] h-[30rem] bg-gray-500/5 rounded-full blur-3xl -z-10" />

      <main className="relative z-10 py-12 sm:py-16 px-4 mx-auto max-w-2xl w-full">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-gray-500">
              MY ACCOUNT
            </span>
          </h1>
          {isAdmin && (
            <span className="mt-2 inline-block text-xs font-bold bg-white/10 text-white px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
              ADMIN DASHBOARD
            </span>
          )}
        </header>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="space-y-3"
        >
          {user ? (
            <>
              {mainOptions.map((option) => (
                <motion.div key={option.id} variants={itemVariants}>
                  <Link
                    to={option.path}
                    className={`group flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      location.pathname === option.path
                        ? "bg-white/10 border border-white/30 shadow-lg ring-1 ring-white/20"
                        : "bg-black/50 border border-gray-800 shadow-sm hover:border-gray-600 hover:bg-gray-900/50"
                    }`}
                  >
                    {/* Icon container */}
                    <div className={`p-2 rounded-lg mr-4 transition-colors ${
                      location.pathname === option.path ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
                    }`}>
                      {option.icon}
                    </div>
                    
                    <span className={`font-semibold text-lg flex-grow truncate ${
                      location.pathname === option.path ? "text-white" : "text-gray-300"
                    }`}>
                      {option.title}
                    </span>
                    
                    <ChevronRightIcon className={`w-5 h-5 ml-2 transition-transform duration-200 flex-shrink-0 ${
                      location.pathname === option.path ? "text-white" : "text-gray-500 group-hover:text-white group-hover:translate-x-1"
                    }`} />
                  </Link>
                </motion.div>
              ))}
              
              {/* Logout Button with Clerk */}
              <motion.div variants={itemVariants} className="pt-6">
                <button
                  onClick={handleLogout}
                  className="group flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-200 bg-black/50 border border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-600 hover:bg-gray-900/50"
                >
                  <div className="p-2 rounded-lg mr-4 bg-white/5 group-hover:bg-white/10 transition-colors">
                    <LogOutIcon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors flex-shrink-0"/>
                  </div>
                  <span className="font-semibold text-lg text-gray-300 flex-grow text-left group-hover:text-white">Logout</span>
                  <ChevronRightIcon className="w-5 h-5 ml-2 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1 flex-shrink-0" />
                </button>
              </motion.div>
            </>
          ) : (
            <motion.div variants={itemVariants}>
              <Link 
                to="/signup"
                className="group flex items-center w-full px-6 py-5 rounded-2xl transition-all duration-300 bg-gradient-to-r from-white to-gray-300 text-black shadow-xl shadow-white/10 hover:shadow-white/20 hover:-translate-y-1"
              >
                <LogInIcon className="w-6 h-6 mr-4 text-black flex-shrink-0" />
                <span className="font-semibold text-lg flex-grow">Login or Register</span>
                <ChevronRightIcon className="w-5 h-5 ml-2 text-black/60 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}
        </motion.div>

        {user && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 + mainOptions.length * 0.07 }} 
            className="mt-10 text-center"
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Logged in as</p>
            <p className="font-medium text-white bg-white/5 py-1 px-4 rounded-full inline-block backdrop-blur-sm border border-white/10">
              {emailId}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default Account;
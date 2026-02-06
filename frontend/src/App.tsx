import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState, useCallback } from "react";
import axiosClient from "../src/utils/axiosClient";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUp";
import ShimmerPage from "./pages/ShimmerPage.tsx";
import Cart from "./pages/Cart.tsx";
import TopBar from "../src/pages/TopBar.tsx";
import Favourites from "./pages/Favourites.tsx";
import MansPage from "./pages/ManProducts.tsx";
import AddPhoneNo from "../src/components/AddNumber.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import Footer from "./pages/Footer.tsx";
import CheckOutPage from "./pages/CheckOut.tsx";
import Account from "./pages/Account.tsx";
import Contact from "./pages/Contact.tsx";
import UserHistory from "./pages/UserHistory.tsx";
import RejectedOrders from "./pages/Admin/RejectedOrders.tsx"

import { syncUserWithBackend } from "./services/authService";
import UserBeingDeliveredPage from "./pages/UserBeingDelivered.tsx";
import UserBeingReturned from "./pages/UserBeingReturned.tsx";
import UserRejectedOrders from "./pages/UserRejectedOrders.tsx";
import ManageAddress from "./pages/ManageAddress.tsx";
import UserReturnedHistoryPage from "./pages/UserReturnedHistoryPage.tsx";
import PaymentGateway from "./pages/Payment.tsx";
import NewOrders from "./pages/Admin/NewOrders.tsx";

import History from "./pages/Admin/History.tsx";
import ReturnRequest from "./pages/Admin/ReturnRequest.tsx";
import AddProduct from "./pages/Admin/AddProduct.tsx";
import UpdateProduct from "./pages/Admin/UpdateProduct.tsx";
import DeleteProduct from "./pages/Admin/RemoveProduct.tsx";
import AdminReturnedOrders from "./pages/Admin/AdminReturnedOrders.tsx";
import CouponManager from "./pages/Admin/AddCoupons.tsx";


/* ---------------- PROTECTED ROUTE ---------------- */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <ShimmerPage />;
  if (!isSignedIn) return <Navigate to="/" replace />;

  return <>{children}</>;
};
/* ---------------- ADMIN ROUTE ---------------- */
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return <ShimmerPage />;
  if (!isSignedIn) return <Navigate to="/" replace />;

  const isAdmin =
    user?.primaryEmailAddress?.emailAddress ===
    import.meta.env.VITE_ADMIN_EMAIL;

  if (!isAdmin) {
    return <Navigate to="/" replace />; // or /unauthorized
  }

  return <>{children}</>;
};

/* ---------------- MAIN APP ---------------- */
export default function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const emailId = user?.primaryEmailAddress?.emailAddress || null;

  const [phoneExists, setPhoneExists] = useState<boolean | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const [userSynced, setUserSynced] = useState(false);

  /* ---------------- USER SYNC (RUNS ONCE) ---------------- */
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || userSynced) return;

    syncUserWithBackend({
      clerkId: user.id,
      emailId: user.primaryEmailAddress?.emailAddress,
      displayName: user.fullName,
      photoURL: user.imageUrl,
    })
      .then(() => {
        setUserSynced(true);
      })
      .catch(err => {
        console.error("User sync failed:", err);
      });
  }, [isLoaded, isSignedIn, user, userSynced]);

  /* ---------------- PHONE CHECK ---------------- */
  const checkPhone = useCallback(
    async (manualState?: boolean) => {
      if (manualState === true) {
        setPhoneExists(true);
        return;
      }

      if (!emailId) {
        setPhoneExists(true);
        return;
      }

      setCheckingPhone(true);
      try {
        const res = await axiosClient.get("/auth/phoneNoExist", {
          params: { emailId },
        });
        setPhoneExists(res.data.exists);
      } catch (err) {
        console.error("Phone check failed", err);
        setPhoneExists(false);
      } finally {
        setCheckingPhone(false);
      }
    },
    [emailId]
  );

  /* ---------------- AUTH WATCH ---------------- */
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      checkPhone();
    } else {
      setPhoneExists(true); // guests allowed
    }
  }, [isLoaded, isSignedIn, checkPhone]);

  /* ---------------- GLOBAL LOADING ---------------- */
  if (!isLoaded || checkingPhone) {
    return <ShimmerPage />;
  }

  /* ---------------- PHONE GATE ---------------- */
  if (isSignedIn && phoneExists === false) {
    return (
      <>
        <TopBar />
        <div className="pt-16">
          <AddPhoneNo onSuccess={() => checkPhone(true)} />
        </div>
      </>
    );
  }

  /* ---------------- ROUTES ---------------- */
  return (
    <>
      <TopBar />
      <div className="pt-16">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/menPage" element={<MansPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth */}
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckOutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/favourites"
            element={
              <ProtectedRoute>
                <Favourites />
              </ProtectedRoute>
            }
          />

          <Route
            path="/userHistory"
            element={
              <ProtectedRoute>
            <UserHistory></UserHistory>
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
              <Route
            path="/userBeingDelivered"
            element={
              <ProtectedRoute>
              <UserBeingDeliveredPage></UserBeingDeliveredPage>
              </ProtectedRoute>
            }
          />

            <Route
            path="/userBeingReturned"
            element={
              <ProtectedRoute>
              <UserBeingReturned></UserBeingReturned>
              </ProtectedRoute>
            }
          />

            <Route
            path="/userRejected"
            element={
              <ProtectedRoute>
             <UserRejectedOrders></UserRejectedOrders>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manageAddress"
            element={
              <ProtectedRoute>
             <ManageAddress></ManageAddress>
              </ProtectedRoute>
            }
          />

          <Route
            path="/userReturnedHistory"
            element={
              <ProtectedRoute>
            <UserReturnedHistoryPage></UserReturnedHistoryPage>
              </ProtectedRoute>
            }
          />

            <Route
            path="/payment"
            element={
              <ProtectedRoute>
                    <PaymentGateway></PaymentGateway>
              </ProtectedRoute>
            }
          />

            <Route
              path="/admin/new-orders"
              element={
                <AdminRoute>
                  <NewOrders />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/adminHistory"
              element={
                <AdminRoute>
                  <History></History>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/returnRequest"
              element={
                <AdminRoute>
                  <ReturnRequest></ReturnRequest>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/rejectedOrders"
              element={
                <AdminRoute>
                  <RejectedOrders></RejectedOrders>
                </AdminRoute>
              }
            />

              <Route
              path="/admin/addProducts"
              element={
                <AdminRoute>
                 <AddProduct></AddProduct>
                </AdminRoute>
              }
            />
          
          <Route
              path="/admin/updateProducts"
              element={
                <AdminRoute>
                <UpdateProduct></UpdateProduct>
                </AdminRoute>
              }
            />

             <Route
              path="/admin/removeProducts"
              element={
                <AdminRoute>
               <DeleteProduct></DeleteProduct>
                </AdminRoute>
              }
            />


          <Route
              path="/admin/AdminReturnedHistory"
              element={
                <AdminRoute>
                  <AdminReturnedOrders></AdminReturnedOrders>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/addCoupon"
              element={
                <AdminRoute>
                 <CouponManager></CouponManager>
                </AdminRoute>
              }
            />
          
          /admin/addCoupon

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
      </div>
    </>
  );
}

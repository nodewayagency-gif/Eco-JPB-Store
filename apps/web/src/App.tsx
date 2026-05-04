import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/providers/CartContext";
import { AuthProvider } from "@/providers/auth/AuthProvider";
import { ConfigProvider } from "@/providers/ConfigContext";
import { RequireAdminAuth, RequireCustomerAuth } from "@/providers/auth/RouteGuards";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import ProductsPage from "./pages/ProductsPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";
import CustomerPage from "./pages/CustomerPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import AdminLoginPage from "./pages/AdminLoginPage.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.tsx";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage.tsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.tsx";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage.tsx";
import AdminCouponsPage from "./pages/admin/AdminCouponsPage.tsx";
import AdminLeadsPage from "./pages/admin/AdminLeadsPage.tsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.tsx";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage.tsx";
import AdminSupportPage from "./pages/admin/AdminSupportPage.tsx";
import AdminCompanySettingsPage from "./pages/admin/AdminCompanySettingsPage.tsx";
import AdminPaymentSettingsPage from "./pages/admin/AdminPaymentSettingsPage.tsx";
import AdminShippingSettingsPage from "./pages/admin/AdminShippingSettingsPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ConfigProvider>
        <CartProvider>
          <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<RegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              <Route
                path="/minha-conta"
                element={
                  <RequireCustomerAuth>
                    <CustomerPage />
                  </RequireCustomerAuth>
                }
              />

              <Route
                path="/admin"
                element={
                  <RequireAdminAuth allowedRoles={["ADMIN", "OPERATOR"]}>
                    <AdminLayout />
                  </RequireAdminAuth>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="pedidos" element={<AdminOrdersPage />} />
                <Route path="produtos" element={<AdminProductsPage />} />
                <Route path="categorias" element={<AdminCategoriesPage />} />
                <Route path="cupons" element={<AdminCouponsPage />} />
                <Route path="usuarios" element={<AdminUsersPage />} />
                <Route path="clientes" element={<AdminCustomersPage />} />
                <Route path="suporte" element={<AdminSupportPage />} />
                <Route path="leads" element={<AdminLeadsPage />} />
                <Route path="configuracoes" element={<Navigate to="/admin/configuracoes/empresa" replace />} />
                <Route path="configuracoes/empresa" element={<AdminCompanySettingsPage />} />
                <Route path="configuracoes/pagamento" element={<AdminPaymentSettingsPage />} />
                <Route path="configuracoes/envio" element={<AdminShippingSettingsPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
        </CartProvider>
      </ConfigProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

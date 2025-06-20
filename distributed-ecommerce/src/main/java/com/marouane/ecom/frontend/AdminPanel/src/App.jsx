import './App.css'
import {AuthProvider} from "././Context/AuthContext.jsx";
import AdminLayout from "./AdminLayout.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./Login/LoginPage.jsx";
import ProductPage from "./ProductPage.jsx";
import CategoryPage from "./CategoryPage.jsx";
import CustomerPage from "./CustomerPage.jsx";
import InventoryPage from "./InventoryPage.jsx";
import {ToastNotificationContainer} from "./utils/toast.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
function App() {


  return (
      <AuthProvider>
          <ToastNotificationContainer />
          <Router>
              <Routes>
                  <Route path="/" element={<LoginPage />} />

                  <Route element={<ProtectedRoute />}>
                      <Route path="/admin" element={<AdminLayout />} />
                      <Route path="/admin/product" element={<ProductPage />} />
                      <Route path="/admin/category" element={<CategoryPage />} />
                      <Route path="/admin/customer" element={<CustomerPage />} />
                      <Route path="/admin/inventory" element={<InventoryPage />} />
                  </Route>
              </Routes>
          </Router>
      </AuthProvider>
  )
}

export default App
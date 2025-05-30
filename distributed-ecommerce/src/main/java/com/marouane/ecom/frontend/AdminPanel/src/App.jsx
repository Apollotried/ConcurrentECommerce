import './App.css'
import {AuthProvider} from "././Context/AuthContext.jsx";
import AdminLayout from "./AdminLayout.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./Login/LoginPage.jsx";
import ProductPage from "./ProductPage.jsx";
import CategoryPage from "./CategoryPage.jsx";
import CustomerPage from "./CustomerPage.jsx";
import InventoryPage from "./InventoryPage.jsx";
function App() {


  return (
      <AuthProvider>
          <Router>
              <Routes>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/admin" element={<AdminLayout />} />
                  <Route path="/admin/product" element={<ProductPage />} />
                  <Route path="/admin/category" element={<CategoryPage />} />
                  <Route path="/admin/customer" element={<CustomerPage />} />
                  <Route path="/admin/inventory" element={<InventoryPage />} />
              </Routes>
          </Router>
      </AuthProvider>
  )
}

export default App
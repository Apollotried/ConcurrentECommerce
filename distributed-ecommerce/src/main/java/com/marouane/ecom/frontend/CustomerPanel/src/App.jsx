import './App.css'
import LoginPage from "./Login/LoginPage.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {AuthProvider} from "./Context/AuthContext.jsx";
import Catalog from "./products/Catalog.jsx";
import Cart from "./cart/Cart.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Checkout from "./checkout/Checkout.jsx";
import OrderConfirmation from "./orders/OrderConfirmation.jsx";
import OrdersHistory from "./orders/OrdersHistory.jsx";

function App() {


  return (
      <AuthProvider>
          <Router>
              <Routes>
                  <Route path="/" element={<LoginPage />} />


                  <Route element={<ProtectedRoute />}>
                      <Route path="/products" element={<Catalog />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-confirmation" element={<OrderConfirmation />} />
                      <Route path="/orders" element={<OrdersHistory />} />


                  </Route>

              </Routes>
          </Router>
      </AuthProvider>
  )
}

export default App

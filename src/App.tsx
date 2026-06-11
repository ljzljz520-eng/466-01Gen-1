import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Publish from "@/pages/Publish";
import OrderDetail from "@/pages/OrderDetail";
import Hall from "@/pages/Hall";
import Profile from "@/pages/Profile";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/hall" element={<Hall />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

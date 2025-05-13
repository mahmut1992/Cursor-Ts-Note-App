import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Sayfalar
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";
import FormPage from "./pages/FormPage";

// Bileşenler
import Navbar from "./components/Navbar";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // LocalStorage'dan tercihi oku veya sistem tercihini kullan
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  // Dark mode değiştiğinde HTML elementine class ekle/çıkar
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Dark mode değiştirme fonksiyonu
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="py-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/detail/:id" element={<DetailPage />} />
            <Route path="/new" element={<FormPage />} />
            <Route path="/edit/:id" element={<FormPage />} />
          </Routes>
        </main>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={darkMode ? "dark" : "light"}
        />
      </div>
    </Router>
  );
}

export default App;

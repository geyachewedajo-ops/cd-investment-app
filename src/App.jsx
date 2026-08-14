

import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import "./App.css";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Withdraw from "./pages/Withdraw";

function App() {
  // ==============================
  // LOAD SAVED USER
  // ==============================

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("loggedInUser");

      if (savedUser) {
        return JSON.parse(savedUser);
      }

      return null;
    } catch (error) {
      console.error("Failed to load saved user:", error);
      return null;
    }
  });

  // ==============================
  // LOGIN
  // ==============================

  const handleLogin = (userData) => {
    console.log("LOGIN USER:", userData);

    setUser(userData);

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify(userData)
    );
  };

  // ==============================
  // LOGOUT
  // ==============================

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");

    setUser(null);
  };

  // ==============================
  // NOT LOGGED IN
  // ==============================

  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  // ==============================
  // LOGGED IN APP
  // ==============================

  return (
    <div className="App">

      {/* NAVBAR */}

      <Navbar user={user} />

      {/* ROUTES */}

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* INVESTMENT MENU */}

        <Route
          path="/menu"
          element={<Menu user={user} />}
        />

        {/* WITHDRAW */}

        <Route
          path="/withdraw"
          element={<Withdraw user={user} />}
        />

        {/* ABOUT */}

        <Route
          path="/about"
          element={<About />}
        />

        {/* CONTACT */}

        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* ADMIN */}

        {user?.role === "admin" ? (
          <Route
            path="/admin"
            element={<Admin />}
          />
        ) : (
          <Route
            path="/admin"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        )}

        {/* UNKNOWN PAGE */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

      {/* LOGOUT BUTTON */}

      <button
        type="button"
        className="logout-btn"
        onClick={handleLogout}
      >
        🚪 Logout
      </button>

    </div>
  );
}

export default App;

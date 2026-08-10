import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ user }) {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <nav className="nav">

      {/* LOGO */}
      <h2 className="logo">
        💎 Osunburg Investment
      </h2>

      {/* MOBILE MENU BUTTON */}
      <div
        className="hamburger"
        onClick={() => setOpen(!open)}
      >
        {open ? "✕" : "☰"}
      </div>

      {/* NAVIGATION */}
      <ul className={open ? "nav-menu active" : "nav-menu"}>

        <li>
          <Link to="/" onClick={closeMenu}>
            🏠 Home
          </Link>
        </li>

        <li>
          <Link to="/menu" onClick={closeMenu}>
            📈 Investment Plans
          </Link>
        </li>

        <li>
          <Link to="/withdraw" onClick={closeMenu}>
            💸 Withdraw
          </Link>
        </li>

        <li>
          <Link to="/about" onClick={closeMenu}>
            ℹ️ About
          </Link>
        </li>

        <li>
          <Link to="/contact" onClick={closeMenu}>
            📞 Contact
          </Link>
        </li>

        {/* ADMIN ONLY */}
        {user?.role === "admin" && (
          <li>
            <Link to="/admin" onClick={closeMenu}>
              🛡️ Admin
            </Link>
          </li>
        )}

      </ul>

    </nav>
  );
}

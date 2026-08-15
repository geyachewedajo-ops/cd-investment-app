import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ user }) {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  // =========================
  // REFERRAL CODE
  // =========================

  const referralCode = user?.referralCode || "";

  const referralLink = referralCode
    ? `${window.location.origin}/register?ref=${referralCode}`
    : "";

  // =========================
  // COPY REFERRAL LINK
  // =========================

  const copyReferralLink = async () => {
    if (!referralLink) {
      alert("Referral code is not available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      alert("Referral link copied!");
    } catch (error) {
      console.error("COPY REFERRAL ERROR:", error);
      alert("Unable to copy referral link.");
    }
  };

  // =========================
  // SHARE REFERRAL LINK
  // =========================

  const shareReferralLink = async () => {
    if (!referralLink) {
      alert("Referral code is not available.");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Osunburg Investment",
          text: "Join Osunburg Investment using my referral link:",
          url: referralLink,
        });
      } else {
        await navigator.clipboard.writeText(referralLink);

        alert(
          "Sharing is not supported on this browser. Referral link copied instead!"
        );
      }
    } catch (error) {
      console.log("Share cancelled or failed:", error);
    }
  };

  // =========================
  // PAGE
  // =========================

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

        {/* HOME */}
        <li>
          <Link to="/" onClick={closeMenu}>
            🏠 Home
          </Link>
        </li>

        {/* INVESTMENT PLANS */}
        <li>
          <Link to="/menu" onClick={closeMenu}>
            📈 Investment Plans
          </Link>
        </li>

        {/* WITHDRAW */}
        <li>
          <Link to="/withdraw" onClick={closeMenu}>
            💸 Withdraw
          </Link>
        </li>

        {/* ABOUT */}
        <li>
          <Link to="/about" onClick={closeMenu}>
            ℹ️ About
          </Link>
        </li>

        {/* CONTACT */}
        <li>
          <Link to="/contact" onClick={closeMenu}>
            📞 Contact
          </Link>
        </li>

        {/* =========================
            REFERRAL SECTION
        ========================= */}

        {user?.role === "customer" && referralCode && (
          <li className="referral-menu">

            <div className="referral-title">
              🎁 Refer & Earn
            </div>

            <div className="referral-code">
              Your Code:
              <strong>{referralCode}</strong>
            </div>

            <div className="referral-earnings">
              💰 Referral Balance:
              <strong>
                {Number(user?.referralBalance || 0).toFixed(2)} ETB
              </strong>
            </div>

            <div className="referral-earnings">
              📊 Total Referral Earnings:
              <strong>
                {Number(
                  user?.totalReferralEarnings || 0
                ).toFixed(2)} ETB
              </strong>
            </div>

            <button
              type="button"
              onClick={copyReferralLink}
              className="referral-button"
            >
              📋 Copy Referral Link
            </button>

            <button
              type="button"
              onClick={shareReferralLink}
              className="referral-button"
            >
              📤 Share Referral Link
            </button>

          </li>
        )}

        {/* =========================
            ADMIN ONLY
        ========================= */}

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

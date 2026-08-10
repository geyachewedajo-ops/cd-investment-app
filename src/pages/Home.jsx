import { useState } from "react";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "dark" : ""}>

      {/* DARK MODE */}
      <div style={{ textAlign: "right", padding: "10px" }}>
        <button
          className="hero-btn"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="hero">

        <div className="investment-icon">
          💎
        </div>

        <h1>
          Welcome to Osunburg Investment
        </h1>

        <p className="hero-text">
          Grow Your Capital • Invest Smart • Build Your Future
        </p>

        <p>
          Choose an investment plan that matches
          your capital and investment goals.
        </p>

        <button
          className="hero-btn"
          onClick={() => {
            window.location.href = "/menu";
          }}
        >
          📈 View Investment Plans
        </button>

      </section>

      {/* INVESTMENT PLANS */}
      <section className="featured">

        <h2>💰 Investment Plans</h2>

        <div className="feature">
          <h3>💎 Quartz</h3>
          <p>
            Start with a small amount and begin
            your investment journey.
          </p>
        </div>

        <div className="feature">
          <h3>🥈 Silver</h3>
          <p>
            A balanced investment option for
            growing your capital.
          </p>
        </div>

        <div className="feature">
          <h3>🥇 Gold</h3>
          <p>
            Higher capital investment with
            attractive growth potential.
          </p>
        </div>

        <div className="feature">
          <h3>💎 Diamond</h3>
          <p>
            Premium investment plan for
            larger capital.
          </p>
        </div>

      </section>

      {/* WHY INVEST */}
      <section className="why-us">

        <h2>Why Invest With Us?</h2>

        <div className="feature">
          <h3>🔒 Secure Investment</h3>
          <p>
            Your investment information is
            securely stored.
          </p>
        </div>

        <div className="feature">
          <h3>📊 Multiple Plans</h3>
          <p>
            Choose Quartz, Silver, Gold,
            or Diamond.
          </p>
        </div>

        <div className="feature">
          <h3>💳 Easy Payment</h3>
          <p>
            Submit your payment using CBE
            and provide your transaction ID.
          </p>
        </div>

        <div className="feature">
          <h3>✅ Admin Verification</h3>
          <p>
            Your investment is reviewed and
            approved by the administrator.
          </p>
        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="hours">

        <h2>📋 How It Works</h2>

        <p>1️⃣ Create your customer account</p>

        <p>2️⃣ Choose an investment plan</p>

        <p>3️⃣ Enter your investment amount</p>

        <p>4️⃣ Make your CBE payment</p>

        <p>5️⃣ Submit your transaction ID</p>

        <p>6️⃣ Wait for admin approval</p>

      </section>

      {/* FOOTER */}
      <footer>

        <h3>
          💎 Osunburg Investment
        </h3>

        <p>
          Smart Investment • Better Future
        </p>

        <p>
          Jerman
        </p>

        <p>
          © 2026 All Rights Reserved.
        </p>

      </footer>

    </div>
  );
}

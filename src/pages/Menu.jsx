import { useEffect, useState } from "react";

const API_URL = "https://investment-backend-2-n9hf.onrender.com";

const CBE_ACCOUNT_NAME = "CBE";
const CBE_ACCOUNT_NUMBER = "1000303329505";

function Menu() {
  const [plans, setPlans] = useState([]);

  const [selectedPlans, setSelectedPlans] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "selectedInvestmentPlans"
      );
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [confirmedInvestments, setConfirmedInvestments] =
    useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Plans");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [currentPlan, setCurrentPlan] = useState(null);
  const [investmentAmount, setInvestmentAmount] =
    useState("");
  const [transactionId, setTransactionId] =
    useState("");

  const [showInvestmentForm, setShowInvestmentForm] =
    useState(false);

  const [showPayment, setShowPayment] =
    useState(false);

  // =========================
  // LOAD PLANS
  // =========================

  useEffect(() => {
    loadPlans();
  }, []);

  // =========================
  // LOAD INVESTMENTS
  // =========================

  useEffect(() => {
    loadInvestments();
  }, []);

  // =========================
  // SAVE SELECTED PLANS
  // =========================

  useEffect(() => {
    localStorage.setItem(
      "selectedInvestmentPlans",
      JSON.stringify(selectedPlans)
    );
  }, [selectedPlans]);

  // =========================
  // LOAD PLANS FROM MONGODB
  // =========================

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/plans`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load investment plans."
        );
      }

      setPlans(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Load plans error:",
        err
      );

      setError(
        "Unable to load investment plans. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD INVESTMENTS
  // =========================

  const loadInvestments = async () => {
    try {
      const response = await fetch(
        `${API_URL}/investments`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load investments."
        );
      }

      setConfirmedInvestments(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Load investments error:",
        err
      );
    }
  };

  // =========================
  // SELECT PLAN
  // =========================

  const openInvestmentForm = (plan) => {
    setCurrentPlan(plan);

    setInvestmentAmount("");
    setTransactionId("");
    setError("");

    setShowInvestmentForm(true);
    setShowPayment(false);

    const alreadySelected =
      selectedPlans.some(
        (item) =>
          item._id === plan._id
      );

    if (!alreadySelected) {
      setSelectedPlans((prev) => [
        ...prev,
        plan
      ]);
    }
  };

  // =========================
  // REMOVE PLAN
  // =========================

  const removePlan = (id) => {
    setSelectedPlans((prev) =>
      prev.filter(
        (item) =>
          item._id !== id
      )
    );

    if (currentPlan?._id === id) {
      setCurrentPlan(null);
      setInvestmentAmount("");
      setTransactionId("");
      setShowInvestmentForm(false);
      setShowPayment(false);
    }
  };

  // =========================
  // START INVESTMENT
  // =========================

  const startInvestment = () => {
    if (!currentPlan) {
      alert(
        "Please select an investment plan."
      );
      return;
    }

    const amount =
      Number(investmentAmount);

    if (!amount || amount <= 0) {
      alert(
        "Please enter an investment amount."
      );
      return;
    }

    const minimum =
      Number(
        currentPlan.minCapital || 0
      );

    const maximum =
      Number(
        currentPlan.maxCapital || 0
      );

    if (amount < minimum) {
      alert(
        `Minimum investment is ${minimum.toLocaleString()} Birr.`
      );
      return;
    }

    if (
      maximum > 0 &&
      amount > maximum
    ) {
      alert(
        `Maximum investment is ${maximum.toLocaleString()} Birr.`
      );
      return;
    }

    setShowInvestmentForm(false);
    setShowPayment(true);
  };

  // =========================
  // CONFIRM PAYMENT
  // =========================

  const confirmPayment = async () => {
    if (!currentPlan) {
      alert(
        "No investment selected."
      );
      return;
    }

    if (!transactionId.trim()) {
      alert(
        "Please enter your CBE Transaction ID."
      );
      return;
    }

    const amount =
      Number(investmentAmount);

    if (!amount || amount <= 0) {
      alert(
        "Invalid investment amount."
      );
      return;
    }

    const minimum =
      Number(
        currentPlan.minCapital || 0
      );

    const maximum =
      Number(
        currentPlan.maxCapital || 0
      );

    if (amount < minimum) {
      alert(
        `Minimum investment is ${minimum.toLocaleString()} Birr.`
      );
      return;
    }

    if (
      maximum > 0 &&
      amount > maximum
    ) {
      alert(
        `Maximum investment is ${maximum.toLocaleString()} Birr.`
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/investments`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            planId:
              currentPlan._id,

            planName:
              currentPlan.name,

            commodity:
              currentPlan.commodity,

            amount:
              amount,

            transactionId:
              transactionId.trim(),

            paymentMethod:
              "CBE",

            status:
              "Pending"
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Investment could not be saved."
        );
      }

      // Backend returns saved investment directly
      const savedInvestment = data;

      setConfirmedInvestments(
        (prev) => [
          savedInvestment,
          ...prev
        ]
      );

      setShowPayment(false);
      setShowInvestmentForm(false);

      setTransactionId("");
      setInvestmentAmount("");
      setCurrentPlan(null);

      alert(
        "Investment submitted successfully!\n\nYour investment has been saved to MongoDB and is pending verification."
      );
    } catch (err) {
      console.error(
        "Investment save error:",
        err
      );

      setError(
        err.message ||
          "Investment could not be saved."
      );

      alert(
        `Investment could not be saved.\n\n${err.message}`
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // CANCEL PAYMENT
  // =========================

  const cancelPayment = () => {
    setShowPayment(false);
    setTransactionId("");
  };

  // =========================
  // CANCEL INVESTMENT
  // =========================

  const cancelInvestment = () => {
    setShowInvestmentForm(false);
    setInvestmentAmount("");
  };

  // =========================
  // FILTER PLANS
  // =========================

  const filteredPlans =
    plans.filter((plan) => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      const searchMatch =
        !searchText ||
        plan.name
          ?.toLowerCase()
          .includes(searchText) ||
        plan.commodity
          ?.toLowerCase()
          .includes(searchText) ||
        plan.description
          ?.toLowerCase()
          .includes(searchText);

      const categoryMatch =
        category === "All Plans" ||
        plan.commodity === category ||
        plan.name === category;

      return (
        searchMatch &&
        categoryMatch
      );
    });

  // =========================
  // PAGE
  // =========================

  return (
    <div className="menu-page">

      {/* =========================
          HEADER
      ========================= */}

      <h1>
        💎 Investment Opportunities
      </h1>

      {/* =========================
          CBE ACCOUNT
      ========================= */}

      <div className="cbe-account-box">
        <p>
          <strong>
            CBE Account Name:
          </strong>{" "}
          {CBE_ACCOUNT_NAME}
        </p>

        <p>
          <strong>
            CBE Account Number:
          </strong>{" "}

          <span
            style={{
              backgroundColor: "#0878f9",
              color: "white",
              padding: "8px 14px",
              borderRadius: "8px",
              fontWeight: "bold",
              display: "inline-block"
            }}
          >
            {CBE_ACCOUNT_NUMBER}
          </span>
        </p>
      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <input
        type="text"
        placeholder="Search Quartz, Silver, Gold or Diamond..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
      />

      <br />
      <br />

      {/* =========================
          CATEGORY
      ========================= */}

      <select
        value={category}
        onChange={(e) =>
          setCategory(
            e.target.value
          )
        }
      >
        <option value="All Plans">
          All Plans
        </option>

        <option value="Quartz">
          Quartz
        </option>

        <option value="Silver">
          Silver
        </option>

        <option value="Gold">
          Gold
        </option>

        <option value="Diamond">
          Diamond
        </option>
      </select>

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <p>
          Loading investment plans...
        </p>
      )}

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {/* =========================
          NO PLANS
      ========================= */}

      {!loading &&
        filteredPlans.length === 0 && (
          <div className="empty-plans">

            <h2>
              No investment plans found.
            </h2>

            <p>
              Make sure your investment
              plans are in MongoDB.
            </p>

          </div>
        )}

      {/* =========================
          PLANS
      ========================= */}

      <div className="menu">

        {filteredPlans.map(
          (plan) => {

            const selected =
              selectedPlans.some(
                (item) =>
                  item._id ===
                  plan._id
              );

            return (
              <div
                className={`card ${
                  selected
                    ? "selected-card"
                    : ""
                }`}
                key={plan._id}
              >

                {/* IMAGE */}

                {plan.image && (
                  <img
                    src={plan.image}
                    alt={
                      plan.name ||
                      "Investment plan"
                    }
                    className="plan-image"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />
                )}

                {/* NAME */}

                <h2>
                  {plan.name}
                </h2>

                {/* COMMODITY */}

                <h3>
                  {plan.commodity}
                </h3>

                {/* MINIMUM */}

                <p>
                  <strong>
                    Initial Capital:
                  </strong>{" "}

                  {Number(
                    plan.minCapital || 0
                  ).toLocaleString()}{" "}
                  Birr
                </p>

                {/* MAXIMUM */}

                {plan.maxCapital && (
                  <p>
                    <strong>
                      Maximum Capital:
                    </strong>{" "}

                    {Number(
                      plan.maxCapital
                    ).toLocaleString()}{" "}
                    Birr
                  </p>
                )}

                {/* RISK */}

                <p>
                  <strong>
                    Risk Level:
                  </strong>{" "}

                  {plan.risk ||
                    "Not specified"}
                </p>

                {/* DESCRIPTION */}

                <p>
                  {plan.description}
                </p>

                {/* SELECT */}

                <button
                  type="button"
                  onClick={() =>
                    openInvestmentForm(
                      plan
                    )
                  }
                >
                  {selected
                    ? "✓ Selected"
                    : "Select Investment"}
                </button>

              </div>
            );
          }
        )}

      </div>

      {/* =========================
          INVESTMENT FORM
      ========================= */}

      {showInvestmentForm &&
        currentPlan && (
          <section
            className="investment-form"
          >

            <h2>
              {currentPlan.name} Investment
            </h2>

            <p>
              <strong>
                Minimum Capital:
              </strong>{" "}

              {Number(
                currentPlan.minCapital || 0
              ).toLocaleString()}{" "}
              Birr
            </p>

            {currentPlan.maxCapital && (
              <p>
                <strong>
                  Maximum Capital:
                </strong>{" "}

                {Number(
                  currentPlan.maxCapital
                ).toLocaleString()}{" "}
                Birr
              </p>
            )}

            <input
              type="number"
              min={
                currentPlan.minCapital
              }
              max={
                currentPlan.maxCapital ||
                undefined
              }
              placeholder="Enter investment amount"
              value={
                investmentAmount
              }
              onChange={(e) =>
                setInvestmentAmount(
                  e.target.value
                )
              }
            />

            <button
              type="button"
              onClick={
                startInvestment
              }
            >
              Continue to Payment
            </button>

            <button
              type="button"
              onClick={
                cancelInvestment
              }
            >
              Cancel
            </button>

          </section>
        )}

      {/* =========================
          CBE PAYMENT
      ========================= */}

      {showPayment &&
        currentPlan && (
          <section
            className="payment-box"
          >

            <h2>
              💳 CBE Payment
            </h2>

            <h3>
              {currentPlan.name}
            </h3>

            <p>
              Investment Amount:
            </p>

            <h2>
              {Number(
                investmentAmount
              ).toLocaleString()}{" "}
              Birr
            </h2>

            <hr />

            <p>
              <strong>
                Payment Method:
              </strong>{" "}
              CBE
            </p>

            <p>
              <strong>
                Account Name:
              </strong>{" "}
              {CBE_ACCOUNT_NAME}
            </p>

            <p>
              <strong>
                CBE Account Number:
              </strong>{" "}

              <span
                style={{
                  backgroundColor: "#0878f9",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  display: "inline-block"
                }}
              >
                {CBE_ACCOUNT_NUMBER}
              </span>
            </p>

            <p>
              Make your payment through
              CBE, then enter your
              transaction ID below.
            </p>

            <input
              type="text"
              placeholder="Enter CBE Transaction ID"
              value={
                transactionId
              }
              onChange={(e) =>
                setTransactionId(
                  e.target.value
                )
              }
            />

            <button
              type="button"
              onClick={
                confirmPayment
              }
              disabled={saving}
            >
              {saving
                ? "Saving to MongoDB..."
                : "Confirm Investment"}
            </button>

            <button
              type="button"
              onClick={
                cancelPayment
              }
              disabled={saving}
            >
              Cancel
            </button>

          </section>
        )}

      {/* =========================
          SELECTED PLANS
      ========================= */}

      <section
        className="selected-investments"
      >

        <h2>
          🛒 Selected Investment Plans
        </h2>

        {selectedPlans.length === 0 ? (
          <p>
            No investment plan selected.
          </p>
        ) : (
          selectedPlans.map(
            (plan) => (
              <div
                className="cart-item"
                key={plan._id}
              >

                <h3>
                  {plan.name}
                </h3>

                <p>
                  Initial Capital:{" "}

                  {Number(
                    plan.minCapital || 0
                  ).toLocaleString()}{" "}
                  Birr
                </p>

                {plan.maxCapital && (
                  <p>
                    Maximum Capital:{" "}

                    {Number(
                      plan.maxCapital
                    ).toLocaleString()}{" "}
                    Birr
                  </p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    openInvestmentForm(
                      plan
                    )
                  }
                >
                  Invest
                </button>

                <button
                  type="button"
                  onClick={() =>
                    removePlan(
                      plan._id
                    )
                  }
                >
                  Remove
                </button>

              </div>
            )
          )
        )}

      </section>

      {/* =========================
          MY INVESTMENTS
      ========================= */}

      <section
        className="confirmed-investments"
      >

        <h2>
          📋 My Investments
        </h2>

        {confirmedInvestments.length === 0 ? (
          <p>
            No investments yet.
          </p>
        ) : (
          confirmedInvestments.map(
            (investment) => (
              <div
                className="investment-record"
                key={
                  investment._id
                }
              >

                <h3>
                  {investment.planName}
                </h3>

                <p>
                  <strong>
                    Commodity:
                  </strong>{" "}

                  {investment.commodity}
                </p>

                <p>
                  <strong>
                    Amount:
                  </strong>{" "}

                  {Number(
                    investment.amount || 0
                  ).toLocaleString()}{" "}
                  Birr
                </p>

                <p>
                  <strong>
                    Payment Method:
                  </strong>{" "}

                  {investment.paymentMethod}
                </p>

                <p>
                  <strong>
                    Transaction ID:
                  </strong>{" "}

                  {investment.transactionId}
                </p>

                <p>
                  <strong>
                    Status:
                  </strong>{" "}

                  {investment.status}
                </p>

                <p>
                  <strong>
                    Date:
                  </strong>{" "}

                  {investment.createdAt
                    ? new Date(
                        investment.createdAt
                      ).toLocaleString()
                    : investment.date
                    ? new Date(
                        investment.date
                      ).toLocaleString()
                    : ""}
                </p>

              </div>
            )
          )
        )}

      </section>

    </div>
  );
}

export default Menu;






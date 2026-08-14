import { useEffect, useState } from "react";

const API_URL = "";

const CBE_ACCOUNT_NAME = "CBE";
const CBE_ACCOUNT_NUMBER = "1000303329505";

function Menu({ user }) {
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

  const [showPayment, setShowPayment] = useState(false);

  // =========================
  // LOAD
  // =========================

  useEffect(() => {
    loadPlans();
    loadInvestments();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "selectedInvestmentPlans",
      JSON.stringify(selectedPlans)
    );
  }, [selectedPlans]);

  // =========================
  // GET USER
  // =========================


  // =========================
  // LOAD PLANS
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
        err.message ||
          "Failed to load investment plans."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD CUSTOMER INVESTMENTS
  // =========================

  const loadInvestments = async () => {
    try {

      if (!user || !user._id) {
        setConfirmedInvestments([]);
        return;
      }

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

      const allInvestments =
        Array.isArray(data) ? data : [];

      const myInvestments =
        allInvestments.filter(
          (investment) =>
            String(investment.userId) ===
            String(user._id)
        );

      setConfirmedInvestments(
        myInvestments
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
      setSelectedPlans((previous) => [
        ...previous,
        plan
      ]);
    }
  };

  // =========================
  // REMOVE PLAN
  // =========================

  const removePlan = (id) => {
    setSelectedPlans((previous) =>
      previous.filter(
        (item) => item._id !== id
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


    if (!user || !user._id) {
      alert(
        "Please log in again before making an investment."
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
            userId: user._id,
            planId: currentPlan._id,
            planName: currentPlan.name,
            commodity:
              currentPlan.commodity,
            amount: amount,
            transactionId:
              transactionId.trim(),
            paymentMethod: "CBE",
            status: "Pending"
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

      const savedInvestment =
        data.investment || data;

      setConfirmedInvestments(
        (previous) => [
          savedInvestment,
          ...previous
        ]
      );

      setShowPayment(false);
      setShowInvestmentForm(false);

      setTransactionId("");
      setInvestmentAmount("");
      setCurrentPlan(null);

      alert(
        "Investment submitted successfully!\n\nYour deposit is now pending admin verification."
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
  // CANCEL
  // =========================

  const cancelInvestment = () => {
    setCurrentPlan(null);
    setInvestmentAmount("");
    setTransactionId("");
    setShowInvestmentForm(false);
    setShowPayment(false);
    setError("");
  };

  // =========================
  // FILTER PLANS
  // =========================

  const categories = [
    "All Plans",
    ...new Set(
      plans
        .map(
          (plan) => plan.category
        )
        .filter(Boolean)
    )
  ];

  const filteredPlans =
    plans.filter((plan) => {
      const searchText =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        String(plan.name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(plan.commodity || "")
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All Plans" ||
        plan.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  // =========================
  // STATUS CLASS
  // =========================

  const getStatusClass = (status) => {
    if (status === "Approved") {
      return "status-approved";
    }

    if (status === "Rejected") {
      return "status-rejected";
    }

    return "status-pending";
  };

  // =========================
  // PAGE
  // =========================

  return (
    <div className="menu-page">

      {/* HEADER */}

      <header className="menu-header">
        <h1>
          💎 Investment Plans
        </h1>

        <p>
          Choose an investment plan
          and submit your payment.
        </p>
      </header>

      {/* ERROR */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* SEARCH */}

      <section className="plan-controls">

        <input
          type="text"
          placeholder="Search plans..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }
        >
          {categories.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>

      </section>

      {/* PLANS */}

      <section className="plans-section">

        <h2>
          Available Plans
        </h2>

        {loading ? (
          <p>
            Loading investment
            plans...
          </p>
        ) : filteredPlans.length === 0 ? (
          <p>
            No investment plans
            found.
          </p>
        ) : (
          <div className="plans-grid">

            {filteredPlans.map(
              (plan) => (

                <div
                  className="plan-card"
                  key={plan._id}
                >

                  <h3>
                    {plan.name}
                  </h3>

                  <p>
                    <strong>
                      Commodity:
                    </strong>{" "}
                    {plan.commodity ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>
                      Minimum:
                    </strong>{" "}
                    {Number(
                      plan.minCapital || 0
                    ).toLocaleString()}{" "}
                    Birr
                  </p>

                  {plan.maxCapital && (
                    <p>
                      <strong>
                        Maximum:
                      </strong>{" "}
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
                    💰 Invest
                  </button>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* SELECTED PLANS */}

      <section className="selected-investments">

        <h2>
          🛒 Selected Investment
          Plans
        </h2>

        {selectedPlans.length === 0 ? (
          <p>
            No investment plan
            selected.
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

      {/* MY INVESTMENTS */}

      <section className="confirmed-investments">

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
                key={investment._id}
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
                    Transaction ID:
                  </strong>{" "}
                  {investment.transactionId}
                </p>

                <p>
                  <strong>
                    Payment Method:
                  </strong>{" "}
                  {investment.paymentMethod ||
                    "CBE"}
                </p>

                <p>
                  <strong>
                    Status:
                  </strong>{" "}

                  <span
                    className={getStatusClass(
                      investment.status
                    )}
                  >
                    {investment.status ||
                      "Pending"}
                  </span>
                </p>

                {investment.status ===
                  "Approved" &&
                  investment.approvedAt && (
                    <p>
                      <strong>
                        Approved:
                      </strong>{" "}
                      {new Date(
                        investment.approvedAt
                      ).toLocaleString()}
                    </p>
                  )}

                {investment.status ===
                  "Pending" && (
                  <p>
                    ⏳ Waiting for admin
                    approval.
                  </p>
                )}

                {investment.status ===
                  "Approved" && (
                  <p>
                    💰 Your deposited
                    amount is credited
                    after approval. The
                    additional 40% becomes
                    available after 24
                    hours.
                  </p>
                )}

              </div>
            )
          )
        )}

      </section>

      {/* INVESTMENT FORM */}

      {showInvestmentForm &&
        currentPlan && (

          <div className="investment-modal">

            <div className="investment-modal-content">

              <h2>
                💰 Invest in{" "}
                {currentPlan.name}
              </h2>

              <p>
                Commodity:{" "}
                {currentPlan.commodity}
              </p>

              <label>
                Investment Amount
              </label>

              <input
                type="number"
                min={
                  currentPlan.minCapital ||
                  1
                }
                value={
                  investmentAmount
                }
                onChange={(e) =>
                  setInvestmentAmount(
                    e.target.value
                  )
                }
                placeholder="Enter amount"
              />

              <div className="modal-actions">

                <button
                  type="button"
                  onClick={
                    startInvestment
                  }
                >
                  Continue
                </button>

                <button
                  type="button"
                  onClick={
                    cancelInvestment
                  }
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>
        )}

      {/* PAYMENT */}

      {showPayment &&
        currentPlan && (

          <div className="investment-modal">

            <div className="investment-modal-content">

              <h2>
                💳 Payment
              </h2>

              <p>
                Plan:{" "}
                {currentPlan.name}
              </p>

              <p>
                Amount:{" "}
                {Number(
                  investmentAmount || 0
                ).toLocaleString()}{" "}
                Birr
              </p>

              <div className="payment-details">

                <p>
                  <strong>
                    Bank:
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
                    Account Number:
                  </strong>{" "}
                  {CBE_ACCOUNT_NUMBER}
                </p>

              </div>

              <label>
                CBE Transaction ID
              </label>

              <input
                type="text"
                value={transactionId}
                onChange={(e) =>
                  setTransactionId(
                    e.target.value
                  )
                }
                placeholder="Enter transaction ID"
              />

              <p>
                After payment, submit
                the transaction ID for
                admin verification.
              </p>

              <div className="modal-actions">

                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    confirmPayment
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Submit Investment"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    cancelInvestment
                  }
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default Menu;

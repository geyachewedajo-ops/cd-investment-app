import { useEffect, useState } from "react";

const API_URL = "https://investment-backend-i2dr.onrender.com";

function Admin() {
  const [investments, setInvestments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  // ==================================================
  // LOAD INVESTMENTS AND WITHDRAWALS
  // ==================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [investmentRes, withdrawalRes] =
        await Promise.all([
          fetch(`${API_URL}/investments`),
          fetch(`${API_URL}/withdrawals`)
        ]);

      if (!investmentRes.ok) {
        throw new Error(
          "Failed to load investments."
        );
      }

      if (!withdrawalRes.ok) {
        throw new Error(
          "Failed to load withdrawals."
        );
      }

      const investmentData =
        await investmentRes.json();

      const withdrawalData =
        await withdrawalRes.json();

      setInvestments(
        Array.isArray(investmentData)
          ? investmentData
          : []
      );

      setWithdrawals(
        Array.isArray(withdrawalData)
          ? withdrawalData
          : []
      );

    } catch (err) {
      console.error(
        "Admin loading error:",
        err
      );

      setError(
        err.message ||
        "Unable to load admin data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // UPDATE INVESTMENT STATUS
  // ==================================================

  const updateInvestmentStatus = async (
    id,
    status
  ) => {
    try {
      setSavingId(id);
      setError("");

      const res = await fetch(
        `${API_URL}/investments/${id}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            status
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
          "Failed to update investment."
        );
      }

      const updatedInvestment =
        data.investment || data;

      setInvestments((previous) =>
        previous.map((investment) =>
          investment._id === id
            ? {
                ...investment,
                ...updatedInvestment,
                status:
                  updatedInvestment.status ||
                  status
              }
            : investment
        )
      );

      alert(
        `Investment ${status.toLowerCase()} successfully.`
      );

    } catch (err) {
      console.error(
        "Investment status error:",
        err
      );

      setError(
        err.message ||
        "Failed to update investment."
      );

      alert(
        `Could not update investment.\n\n${err.message}`
      );

    } finally {
      setSavingId(null);
    }
  };

  // ==================================================
  // APPROVE INVESTMENT
  // ==================================================

  const approveInvestment = (
    investment
  ) => {
    const confirmed =
      window.confirm(
        `Approve this investment?\n\n` +
        `Plan: ${
          investment.planName || "N/A"
        }\n` +
        `Amount: ${Number(
          investment.amount || 0
        ).toLocaleString()} Birr\n` +
        `Transaction ID: ${
          investment.transactionId ||
          "N/A"
        }`
      );

    if (!confirmed) return;

    updateInvestmentStatus(
      investment._id,
      "Approved"
    );
  };

  // ==================================================
  // REJECT INVESTMENT
  // ==================================================

  const rejectInvestment = (
    investment
  ) => {
    const confirmed =
      window.confirm(
        `Reject this investment?\n\n` +
        `Plan: ${
          investment.planName || "N/A"
        }\n` +
        `Amount: ${Number(
          investment.amount || 0
        ).toLocaleString()} Birr\n` +
        `Transaction ID: ${
          investment.transactionId ||
          "N/A"
        }`
      );

    if (!confirmed) return;

    updateInvestmentStatus(
      investment._id,
      "Rejected"
    );
  };

  // ==================================================
  // UPDATE WITHDRAWAL STATUS
  // ==================================================

  const updateWithdrawalStatus = async (
    id,
    status
  ) => {
    try {
      setSavingId(id);
      setError("");

      const res = await fetch(

`${API_URL}/withdrawals/${id}`,

        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            status
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
          "Failed to update withdrawal."
        );
      }

      const updatedWithdrawal =
        data.withdrawal || data;

      setWithdrawals((previous) =>
        previous.map((withdrawal) =>
          withdrawal._id === id
            ? {
                ...withdrawal,
                ...updatedWithdrawal,
                status:
                  updatedWithdrawal.status ||
                  status
              }
            : withdrawal
        )
      );

      alert(
        `Withdrawal ${status.toLowerCase()} successfully.`
      );

    } catch (err) {
      console.error(
        "Withdrawal status error:",
        err
      );

      setError(
        err.message ||
        "Failed to update withdrawal."
      );

      alert(
        `Could not update withdrawal.\n\n${err.message}`
      );

    } finally {
      setSavingId(null);
    }
  };

  // ==================================================
  // APPROVE WITHDRAWAL
  // ==================================================

  const approveWithdrawal = (
    withdrawal
  ) => {
    const confirmed =
      window.confirm(
        `Approve this withdrawal?\n\n` +
        `Amount: ${Number(
          withdrawal.amount || 0
        ).toLocaleString()} Birr\n` +
        `Account Name: ${
          withdrawal.accountName ||
          "N/A"
        }\n` +
        `Account Number: ${
          withdrawal.accountNumber ||
          "N/A"
        }\n` +
        `Payment: ${
          withdrawal.paymentMethod ||
          "CBE"
        }`
      );

    if (!confirmed) return;

    updateWithdrawalStatus(
      withdrawal._id,
      "Approved"
    );
  };

  // ==================================================
  // REJECT WITHDRAWAL
  // ==================================================

  const rejectWithdrawal = (
    withdrawal
  ) => {
    const confirmed =
      window.confirm(
        `Reject this withdrawal?\n\n` +
        `Amount: ${Number(
          withdrawal.amount || 0
        ).toLocaleString()} Birr\n` +
        `Account Name: ${
          withdrawal.accountName ||
          "N/A"
        }\n` +
        `Account Number: ${
          withdrawal.accountNumber ||
          "N/A"
        }`
      );

    if (!confirmed) return;

    updateWithdrawalStatus(
      withdrawal._id,
      "Rejected"
    );
  };

  // ==================================================
  // MARK WITHDRAWAL PAID
  // ==================================================

  const markWithdrawalPaid = (
    withdrawal
  ) => {
    const confirmed =
      window.confirm(
        `Mark this withdrawal as PAID?\n\n` +
        `Amount: ${Number(
          withdrawal.amount || 0
        ).toLocaleString()} Birr\n` +
        `Account: ${
          withdrawal.accountNumber ||
          "N/A"
        }`
      );

    if (!confirmed) return;

    updateWithdrawalStatus(
      withdrawal._id,
      "Paid"
    );
  };

  // ==================================================
  // STATUS CLASS
  // ==================================================

  const getStatusClass = (status) => {
    if (status === "Approved") {
      return "status-approved";
    }

    if (status === "Rejected") {
      return "status-rejected";
    }

    if (status === "Paid") {
      return "status-paid";
    }

    return "status-pending";
  };

  // ==================================================
  // INVESTMENT COUNTS
  // ==================================================

  const pendingInvestments =
    investments.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const approvedInvestments =
    investments.filter(
      (item) =>
        item.status === "Approved"
    ).length;

  const rejectedInvestments =
    investments.filter(
      (item) =>
        item.status === "Rejected"
    ).length;

  // ==================================================
  // WITHDRAWAL COUNTS
  // ==================================================

  const pendingWithdrawals =
    withdrawals.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const approvedWithdrawals =
    withdrawals.filter(
      (item) =>
        item.status === "Approved"
    ).length;

  const rejectedWithdrawals =
    withdrawals.filter(
      (item) =>
        item.status === "Rejected"
    ).length;

  const paidWithdrawals =
    withdrawals.filter(
      (item) =>
        item.status === "Paid"
    ).length;

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="admin-page">

      {/* ============================================
          HEADER
      ============================================ */}

      <div className="admin-header">

        <div>
          <h1>
            🛡️ Admin Dashboard
          </h1>

          <p>
            Manage customer investments
            and withdrawals.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={loadData}
          disabled={loading}
        >
          🔄 {loading
            ? "Loading..."
            : "Refresh"}
        </button>

      </div>

      {/* ============================================
          ERROR
      ============================================ */}

      {error && (
        <div className="admin-error">
          ❌ {error}
        </div>
      )}

      {/* ============================================
          INVESTMENT SUMMARY
      ============================================ */}

      <div className="admin-summary">

        <div className="summary-card">
          <span>📋</span>

          <h3>
            Investments
          </h3>

          <strong>
            {investments.length}
          </strong>
        </div>

        <div className="summary-card pending-summary">
          <span>⏳</span>

          <h3>
            Pending
          </h3>

          <strong>
            {pendingInvestments}
          </strong>
        </div>

        <div className="summary-card approved-summary">
          <span>✅</span>

          <h3>
            Approved
          </h3>

          <strong>
            {approvedInvestments}
          </strong>
        </div>

        <div className="summary-card rejected-summary">
          <span>❌</span>

          <h3>
            Rejected
          </h3>

          <strong>
            {rejectedInvestments}
          </strong>
        </div>

      </div>

      {/* ============================================
          WITHDRAWAL SUMMARY
      ============================================ */}

      <div className="admin-summary">

        <div className="summary-card">
          <span>💸</span>

          <h3>
            Withdrawals
          </h3>

          <strong>
            {withdrawals.length}
          </strong>
        </div>

        <div className="summary-card pending-summary">
          <span>⏳</span>

          <h3>
            Pending
          </h3>

          <strong>
            {pendingWithdrawals}
          </strong>
        </div>

        <div className="summary-card approved-summary">
          <span>✅</span>

          <h3>
            Approved
          </h3>

          <strong>
            {approvedWithdrawals}
          </strong>
        </div>

        <div className="summary-card rejected-summary">
          <span>❌</span>

          <h3>
            Rejected
          </h3>

          <strong>
            {rejectedWithdrawals}
          </strong>
        </div>

        <div className="summary-card paid-summary">
          <span>💰</span>

          <h3>
            Paid
          </h3>

          <strong>
            {paidWithdrawals}
          </strong>
        </div>

      </div>

      {/* ============================================
          LOADING
      ============================================ */}

      {loading && (
        <div className="admin-loading">

          <h2>
            Loading...
          </h2>

          <p>
            Reading data from MongoDB.
          </p>

        </div>
      )}

      {/* ============================================
          INVESTMENTS
      ============================================ */}

      {!loading && (
        <section className="admin-investments">

          <div className="section-title">

            <h2>
              💰 Customer Investments
            </h2>

            <span>
              {investments.length}{" "}
              {investments.length === 1
                ? "record"
                : "records"}
            </span>

          </div>

          {investments.length === 0 ? (

            <div className="admin-empty">

              <div>
                📭
              </div>

              <h2>
                No Investments Yet
              </h2>

              <p>
                Customer investments
                will appear here.
              </p>

            </div>

          ) : (

            investments.map(
              (investment) => (

                <div
                  className="admin-investment-card"
                  key={investment._id}
                >

                  {/* TOP */}

                  <div className="investment-top">

                    <div>

                      <h2>
                        {investment.planName ||
                          "Investment Plan"}
                      </h2>

                      <p className="commodity">
                        💎{" "}
                        {investment.commodity ||
                          "N/A"}
                      </p>

                    </div>

                    <span
                      className={
                        `investment-status ` +
                        getStatusClass(
                          investment.status
                        )
                      }
                    >
                      {investment.status ||
                        "Pending"}
                    </span>

                  </div>

                  {/* DETAILS */}

                  <div className="investment-details">

                    <div className="detail-box">

                      <span>
                        💰 Amount
                      </span>

                      <strong>
                        {Number(
                          investment.amount ||
                          0
                        ).toLocaleString()}{" "}
                        Birr
                      </strong>

                    </div>

                    <div className="detail-box">

                      <span>
                        💳 Payment
                      </span>

                      <strong>
                        {investment.paymentMethod ||
                          "CBE"}
                      </strong>

                    </div>

                    <div className="detail-box">

                      <span>
                        🧾 Transaction ID
                      </span>

                      <strong>
                        {investment.transactionId ||
                          "N/A"}
                      </strong>

                    </div>

                    <div className="detail-box">

                      <span>
                        📅 Date
                      </span>

                      <strong>
                        {investment.createdAt
                          ? new Date(
                              investment.createdAt
                            ).toLocaleString()
                          : "N/A"}
                      </strong>

                    </div>

                  </div>

                  {/* PENDING BUTTONS */}

                  {investment.status ===
                    "Pending" && (

                    <div className="admin-actions">

                      <button
                        type="button"
                        className="approve-button"
                        disabled={
                          savingId ===
                          investment._id
                        }
                        onClick={() =>
                          approveInvestment(
                            investment
                          )
                        }
                      >
                        {savingId ===
                        investment._id
                          ? "Saving..."
                          : "✅ Approve"}
                      </button>

                      <button
                        type="button"
                        className="reject-button"
                        disabled={
                          savingId ===
                          investment._id
                        }
                        onClick={() =>
                          rejectInvestment(
                            investment
                          )
                        }
                      >
                        {savingId ===
                        investment._id
                          ? "Saving..."
                          : "❌ Reject"}
                      </button>

                    </div>

                  )}

                  {/* PROCESSED */}

                  {investment.status ===
                    "Approved" && (

                    <div className="processed-message">
                      ✅ This investment has been approved.
                    </div>

                  )}

                  {investment.status ===
                    "Rejected" && (

                    <div className="processed-message">
                      ❌ This investment has been rejected.
                    </div>

                  )}

                </div>

              )
            )

          )}

        </section>
      )}

      {/* ============================================
          WITHDRAWALS
      ============================================ */}

      {!loading && (
        <section className="admin-investments">

          <div className="section-title">

            <h2>
              💸 Customer Withdrawals
            </h2>

            <span>
              {withdrawals.length}{" "}
              {withdrawals.length === 1
                ? "request"
                : "requests"}
            </span>

          </div>

          {withdrawals.length === 0 ? (

            <div className="admin-empty">

              <div>
                📭
              </div>

              <h2>
                No Withdrawal Requests
              </h2>

              <p>
                Customer withdrawal
                requests will appear here.
              </p>

            </div>

          ) : (

            withdrawals.map(
              (withdrawal) => (

                <div
                  className="admin-investment-card"
                  key={withdrawal._id}
                >

                  {/* TOP */}

                  <div className="investment-top">

                    <div>

                      <h2>
                        💸 Withdrawal Request
                      </h2>

                      <p className="commodity">
                        🏦{" "}
                        {withdrawal.paymentMethod ||
                          "CBE"}
                      </p>

                    </div>

                    <span
                      className={
                        `investment-status ` +
                        getStatusClass(
                          withdrawal.status
                        )
                      }
                    >
                      {withdrawal.status ||
                        "Pending"}
                    </span>

                  </div>

                  {/* DETAILS */}

                  <div className="investment-details">

                    <div className="detail-box">

                      <span>
                        💰 Amount
                      </span>

                      <strong>
                        {Number(
                          withdrawal.amount ||
                          0
                        ).toLocaleString()}{" "}
                        Birr
                      </strong>

                    </div>

                    <div className="detail-box">

                      <span>
                        👤 Account Name
                      </span>

                      <strong>
                        {withdrawal.accountName ||
                          "N/A"}
                      </strong>

                    </div>

                    <div className="detail-box">

                      <span>
                        🏦 Account Number
                      </span>

                      <strong>
                        {withdrawal.accountNumber ||
                          "N/A"}
                      </strong>

                    </div>

                    <div className="detail-box">

                      <span>
                        📅 Date
                      </span>

                      <strong>
                        {withdrawal.createdAt
                          ? new Date(
                              withdrawal.createdAt
                            ).toLocaleString()
                          : "N/A"}
                      </strong>

                    </div>

                  </div>

                  {/* PENDING BUTTONS */}

                  {withdrawal.status ===
                    "Pending" && (

                    <div className="admin-actions">

                      <button
                        type="button"
                        className="approve-button"
                        disabled={
                          savingId ===
                          withdrawal._id
                        }
                        onClick={() =>
                          approveWithdrawal(
                            withdrawal
                          )
                        }
                      >
                        {savingId ===
                        withdrawal._id
                          ? "Saving..."
                          : "✅ Approve"}
                      </button>

                      <button
                        type="button"
                        className="reject-button"
                        disabled={
                          savingId ===
                          withdrawal._id
                        }
                        onClick={() =>
                          rejectWithdrawal(
                            withdrawal
                          )
                        }
                      >
                        {savingId ===
                        withdrawal._id
                          ? "Saving..."
                          : "❌ Reject"}
                      </button>

                    </div>

                  )}

                  {/* APPROVED → PAID */}

                  {withdrawal.status ===
                    "Approved" && (

                    <div className="admin-actions">

                      <button
                        type="button"
                        className="approve-button"
                        disabled={
                          savingId ===
                          withdrawal._id
                        }
                        onClick={() =>
                          markWithdrawalPaid(
                            withdrawal
                          )
                        }
                      >
                        {savingId ===
                        withdrawal._id
                          ? "Saving..."
                          : "💰 Mark as Paid"}
                      </button>

                    </div>

                  )}

                  {/* REJECTED */}

                  {withdrawal.status ===
                    "Rejected" && (

                    <div className="processed-message">
                      ❌ This withdrawal has been rejected.
                    </div>

                  )}

                  {/* PAID */}

                  {withdrawal.status ===
                    "Paid" && (

                    <div className="processed-message">
                      💰 This withdrawal has been paid.
                    </div>

                  )}

                </div>

              )
            )

          )}

        </section>
      )}

    </div>
  );
}

export default Admin;


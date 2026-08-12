import { useEffect, useState } from "react";

const API_URL = "https://investment-backend-2-n9hf.onrender.com";

function Withdraw() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadBalance();
    loadWithdrawals();
  }, []);

  // =========================
  // LOAD AVAILABLE BALANCE
  // =========================

  const loadBalance = async () => {
    try {
      setError("");

      // Load investments
      const investmentRes = await fetch(
        `${API_URL}/investments`
      );

      if (!investmentRes.ok) {
        throw new Error(
          "Failed to load investments."
        );
      }

      const investmentData =
        await investmentRes.json();

      const investments = Array.isArray(
        investmentData
      )
        ? investmentData
        : [];

      // Only APPROVED investments count
      const approvedTotal = investments
        .filter(
          (item) =>
            item.status === "Approved"
        )
        .reduce(
          (sum, item) =>
            sum + Number(item.amount || 0),
          0
        );

      // Load withdrawals
      const withdrawalRes = await fetch(
        `${API_URL}/withdrawals`
      );

      let withdrawalsData = [];

      if (withdrawalRes.ok) {
        const data =
          await withdrawalRes.json();

        withdrawalsData = Array.isArray(data)
          ? data
          : [];
      }

      // Approved/Paid withdrawals reduce balance
      const withdrawnTotal =
        withdrawalsData
          .filter(
            (item) =>
              item.status === "Approved" ||
              item.status === "Paid"
          )
          .reduce(
            (sum, item) =>
              sum + Number(item.amount || 0),
            0
          );

      // Final balance
      const availableBalance =
        approvedTotal - withdrawnTotal;

      setBalance(
        Math.max(0, availableBalance)
      );
    } catch (err) {
      console.error(
        "Balance loading error:",
        err
      );

      setError(
        "Unable to load your available balance."
      );

      setBalance(0);
    }
  };

  // =========================
  // LOAD WITHDRAWAL HISTORY
  // =========================

  const loadWithdrawals = async () => {
    try {
      const res = await fetch(
        `${API_URL}/withdrawals`
      );

      if (!res.ok) {
        return;
      }

      const data = await res.json();

      setWithdrawals(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Withdrawal loading error:",
        err
      );
    }
  };

  // =========================
  // SUBMIT WITHDRAWAL
  // =========================

  const submitWithdrawal = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const withdrawalAmount =
      Number(amount);

    // Check amount
    if (
      !withdrawalAmount ||
      withdrawalAmount <= 0
    ) {
      setError(
        "Please enter a valid withdrawal amount."
      );
      return;
    }

    // Check balance
    if (
      withdrawalAmount > balance
    ) {
      setError(
        "Withdrawal amount cannot be greater than your available balance."
      );
      return;
    }

    // Check account name
    if (!accountName.trim()) {
      setError(
        "Please enter your account name."
      );
      return;
    }

    // Check account number
    if (!accountNumber.trim()) {
      setError(
        "Please enter your CBE account number."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/withdrawals`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            amount: withdrawalAmount,
            accountName:
              accountName.trim(),
            accountNumber:
              accountNumber.trim(),
            paymentMethod: "CBE"
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Withdrawal request failed."
        );
      }

      setMessage(
        "Withdrawal request submitted successfully."
      );

      // Clear form
      setAmount("");
      setAccountName("");
      setAccountNumber("");

      // Reload balance/history
      await loadBalance();
      await loadWithdrawals();

    } catch (err) {
      console.error(
        "Withdrawal error:",
        err
      );

      setError(
        err.message ||
          "Unable to submit withdrawal request."
      );
    } finally {
      setLoading(false);
    }
  };

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

    if (status === "Paid") {
      return "status-paid";
    }

    return "status-pending";
  };

  // =========================
  // PAGE
  // =========================

  return (
    <div className="withdraw-page">

      {/* HEADER */}

      <div className="withdraw-header">

        <h1>
          💸 Withdraw Funds
        </h1>

        <p>
          Request a withdrawal from your
          approved investment balance.
        </p>

      </div>

      {/* BALANCE */}

      <div className="balance-card">

        <span>
          Available Balance
        </span>

        <strong>
          {Number(
            balance
          ).toLocaleString()}{" "}
          Birr
        </strong>

      </div>

      {/* SUCCESS */}

      {message && (
        <div className="withdraw-success">
          {message}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="withdraw-error">
          {error}
        </div>
      )}

      {/* WITHDRAWAL FORM */}

      <form
        className="withdraw-form"
        onSubmit={submitWithdrawal}
      >

        <h2>
          Withdrawal Request
        </h2>

        {/* AMOUNT */}

        <label>
          Withdrawal Amount
        </label>


<input
  className="withdrawal-amount-input"
  type="number"
  min="1"
  max={balance}
  placeholder="Enter withdrawal amount"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}


          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
        />

        

{/* ACCOUNT NAME */}

        <label>
          Account Name
        </label>

<input
  className="withdrawal-amount-input"
  type="text"
  placeholder="Enter CBE account name"
  value={accountName}
  onChange={(e) => setAccountName(e.target.value)}
/>



        {/* ACCOUNT NUMBER */}

        <label>
          CBE Account Number
        </label>

<input
  className="withdrawal-amount-input"
  type="text"
  placeholder="Enter CBE account number"
  value={accountNumber}
  onChange={(e) => setAccountNumber(e.target.value)}
/>


        {/* PAYMENT METHOD */}

        <p className="payment-method">

          <strong>
            Payment Method:
          </strong>{" "}
          CBE

        </p>

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={
            loading ||
            balance <= 0
          }
        >

          {loading
            ? "Submitting..."
            : balance <= 0
            ? "No Available Balance"
            : "Request Withdrawal"}

        </button>

      </form>

      {/* HISTORY */}

      <section className="withdrawal-history">

        <h2>
          📋 Withdrawal History
        </h2>

        {withdrawals.length === 0 ? (

          <p>
            No withdrawal requests yet.
          </p>

        ) : (

          withdrawals.map(
            (withdrawal) => (

              <div
                className="withdrawal-card"
                key={
                  withdrawal._id
                }
              >

                <h3>
                  {Number(
                    withdrawal.amount ||
                      0
                  ).toLocaleString()}{" "}
                  Birr
                </h3>

                <p>
                  Account Name:{" "}
                  {
                    withdrawal.accountName
                  }
                </p>

                <p>
                  Account Number:{" "}
                  {
                    withdrawal.accountNumber
                  }
                </p>

                <p>
                  Payment:{" "}
                  {
                    withdrawal.paymentMethod ||
                      "CBE"
                  }
                </p>

                <p>
                  Status:{" "}

                  <strong
                    className={getStatusClass(
                      withdrawal.status
                    )}
                  >
                    {
                      withdrawal.status
                    }
                  </strong>

                </p>

                <p>
                  Date:{" "}

                  {withdrawal.createdAt
                    ? new Date(
                        withdrawal.createdAt
                      ).toLocaleString()
                    : "N/A"}

                </p>

              </div>

            )
          )

        )}

      </section>

    </div>
  );
}

export default Withdraw;

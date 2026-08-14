


import { useEffect, useState } from "react";

const API_URL = "";

const PROFIT_RATE = 0.40;

const WAITING_PERIOD_MS =
  24 * 60 * 60 * 1000;

function Withdraw({ user }) {
  const [balance, setBalance] = useState(0);

  const [amount, setAmount] = useState("");

  const [accountName, setAccountName] =
    useState("");

  const [accountNumber, setAccountNumber] =
    useState("");

  const [withdrawals, setWithdrawals] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =========================
  // LOAD PAGE
  // =========================

  useEffect(() => {
    loadBalance();
    loadWithdrawals();
  }, []);

  // =========================
  // GET LOGGED-IN USER
  // =========================


  // =========================
  // LOAD AVAILABLE BALANCE
  // =========================

  const loadBalance = async () => {
    try {
      setError("");


      if (!user || !user._id) {
        setBalance(0);

        setError(
          "Please log in again."
        );

        return;
      }

      // -------------------------
      // LOAD INVESTMENTS
      // -------------------------

      const investmentRes =
        await fetch(
          `${API_URL}/investments`
        );

      if (!investmentRes.ok) {
        throw new Error(
          "Failed to load investments."
        );
      }

      const investmentData =
        await investmentRes.json();

      const investments =
        Array.isArray(
          investmentData
        )
          ? investmentData
          : [];

      const now = Date.now();

      let totalBalance = 0;

      // -------------------------
      // CALCULATE CUSTOMER BALANCE
      // -------------------------

      investments
        .filter(
          (investment) =>
            String(
              investment.userId
            ) ===
              String(user._id) &&
            investment.status ===
              "Approved"
        )
        .forEach(
          (investment) => {
            const deposit =
              Number(
                investment.amount || 0
              );

            // Immediately show deposited amount
            totalBalance += deposit;

            // Add 40% after 24 hours
            if (
              investment.approvedAt
            ) {
              const approvedAt =
                new Date(
                  investment.approvedAt
                ).getTime();

              const matured =
                now -
                  approvedAt >=
                WAITING_PERIOD_MS;

              if (matured) {
                const profit =
                  deposit *
                  PROFIT_RATE;

                totalBalance +=
                  profit;
              }
            }
          }
        );

      // -------------------------
      // LOAD WITHDRAWALS
      // -------------------------

      const withdrawalRes =
        await fetch(
          `${API_URL}/withdrawals`
        );

      let withdrawalsData = [];

      if (withdrawalRes.ok) {
        const data =
          await withdrawalRes.json();

        withdrawalsData =
          Array.isArray(data)
            ? data
            : [];
      }

      // -------------------------
      // ONLY THIS CUSTOMER
      // -------------------------

      const userWithdrawals =
        withdrawalsData.filter(
          (withdrawal) =>
            String(
              withdrawal.userId
            ) ===
            String(user._id)
        );

      // Pending, Approved and Paid
      // withdrawals reserve money
      const reservedAmount =
        userWithdrawals
          .filter(
            (withdrawal) =>
              withdrawal.status ===
                "Pending" ||
              withdrawal.status ===
                "Approved" ||
              withdrawal.status ===
                "Paid"
          )
          .reduce(
            (sum, withdrawal) =>
              sum +
              Number(
                withdrawal.amount ||
                  0
              ),
            0
          );

      // -------------------------
      // FINAL BALANCE
      // -------------------------

      const availableBalance =
        totalBalance -
        reservedAmount;

      setBalance(
        Math.max(
          0,
          availableBalance
        )
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

  const loadWithdrawals =
    async () => {
      try {
        const res =
          await fetch(
            `${API_URL}/withdrawals`
          );

        if (!res.ok) {
          return;
        }

        const data =
          await res.json();

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

  const submitWithdrawal =
    async (e) => {
      e.preventDefault();

      setMessage("");
      setError("");

      // -------------------------
      // GET CUSTOMER
      // -------------------------


      if (!user || !user._id) {
        setError(
          "Please log in again."
        );

        return;
      }

      // -------------------------
      // CHECK AMOUNT
      // -------------------------

      const withdrawalAmount =
        Number(amount);

      if (
        !withdrawalAmount ||
        withdrawalAmount <= 0
      ) {
        setError(
          "Please enter a valid withdrawal amount."
        );

        return;
      }

      // -------------------------
      // CHECK BALANCE
      // -------------------------

      if (
        withdrawalAmount >
        balance
      ) {
        setError(
          "Withdrawal amount cannot be greater than your available balance."
        );

        return;
      }

      // -------------------------
      // CHECK ACCOUNT NAME
      // -------------------------

      if (
        !accountName.trim()
      ) {
        setError(
          "Please enter your account name."
        );

        return;
      }

      // -------------------------
      // CHECK ACCOUNT NUMBER
      // -------------------------

      if (
        !accountNumber.trim()
      ) {
        setError(
          "Please enter your CBE account number."
        );

        return;
      }

      try {
        setLoading(true);

        // -------------------------
        // SEND WITHDRAWAL
        // -------------------------

        const res =
          await fetch(
            `${API_URL}/withdrawals`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  userId:
                    user._id,

                  amount:
                    withdrawalAmount,

                  accountName:
                    accountName.trim(),

                  accountNumber:
                    accountNumber.trim(),

                  paymentMethod:
                    "CBE",
                }),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              "Withdrawal request failed."
          );
        }

        // -------------------------
        // SUCCESS
        // -------------------------

        setMessage(
          "Withdrawal request submitted successfully."
        );

        setAmount("");

        setAccountName("");

        setAccountNumber("");

        // Reload balance
        await loadBalance();

        // Reload history
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

  const getStatusClass =
    (status) => {
      if (
        status === "Approved"
      ) {
        return "status-approved";
      }

      if (
        status === "Rejected"
      ) {
        return "status-rejected";
      }

      if (
        status === "Paid"
      ) {
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
          Request a withdrawal
          from your investment
          balance.
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

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="withdraw-success">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="withdraw-error">
          {error}
        </div>
      )}

      {/* WITHDRAW FORM */}

      <form
        className="withdraw-form"
        onSubmit={
          submitWithdrawal
        }
      >

        <div className="form-group">

          <label>
            Amount
          </label>

          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target.value
              )
            }
            placeholder="Enter amount"
            disabled={loading}
          />

        </div>

        <div className="form-group">

          <label>
            Account Name
          </label>

          <input
            type="text"
            value={accountName}
            onChange={(e) =>
              setAccountName(
                e.target.value
              )
            }
            placeholder="Enter account name"
            disabled={loading}
          />

        </div>

        <div className="form-group">

          <label>
            CBE Account Number
          </label>

          <input
            type="text"
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(
                e.target.value
              )
            }
            placeholder="Enter CBE account number"
            disabled={loading}
          />

        </div>

        <div className="form-group">

          <label>
            Payment Method
          </label>

          <input
            type="text"
            value="CBE"
            readOnly
          />

        </div>

        <button
          type="submit"
          className="withdraw-button"
          disabled={loading}
        >
          {loading
            ? "Submitting..."
            : "💸 Request Withdrawal"}
        </button>

      </form>

      {/* WITHDRAWAL HISTORY */}

      <section className="withdrawal-history">

        <h2>
          📋 Withdrawal History
        </h2>

        {withdrawals.length ===
        0 ? (
          <p>
            No withdrawal requests yet.
          </p>
        ) : (
          withdrawals.map(
            (withdrawal) => {

              // Use the logged-in user from App.jsx

              // Only show this customer's
              // withdrawals
              if (
                !user ||
                String(
                  withdrawal.userId
                ) !==
                  String(user._id)
              ) {
                return null;
              }

              return (
                <div
                  className="withdrawal-record"
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
                    <strong>
                      Account Name:
                    </strong>{" "}
                    {
                      withdrawal.accountName
                    }
                  </p>

                  <p>
                    <strong>
                      Account Number:
                    </strong>{" "}
                    {
                      withdrawal.accountNumber
                    }
                  </p>

                  <p>
                    <strong>
                      Payment:
                    </strong>{" "}
                    {
                      withdrawal.paymentMethod ||
                      "CBE"
                    }
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}

                    <span
                      className={getStatusClass(
                        withdrawal.status
                      )}
                    >
                      {
                        withdrawal.status
                      }
                    </span>

                  </p>

                  {withdrawal.createdAt && (
                    <p>
                      <strong>
                        Date:
                      </strong>{" "}
                      {new Date(
                        withdrawal.createdAt
                      ).toLocaleString()}
                    </p>
                  )}

                </div>
              );
            }
          )
        )}

      </section>

    </div>
  );
}

export default Withdraw;











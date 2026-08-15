








import { useState } from "react";

const API_URL = "http://127.0.0.1:5000";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");

  // Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Change password
  const [changeUsername, setChangeUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newChangePassword, setNewChangePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // =========================
  // READ RESPONSE
  // =========================

  const readResponse = async (res) => {
    const text = await res.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        `Backend returned an invalid response (${res.status}).`
      );
    }
  };

  // =========================
  // LOGIN
  // =========================

  const login = async () => {
    if (!username.trim()) {
      alert("Please enter your username.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.user) {
        throw new Error(
          "Login succeeded, but the server did not return a user."
        );
      }

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(data.user)
      );

      alert("Login successful!");

      onLogin(data.user);
    } catch (err) {
      console.error("Login error:", err);

      alert(
        err.message ||
          "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REGISTER
  // =========================

  const register = async () => {
    if (!newUsername.trim()) {
      alert("Please enter a username.");
      return;
    }

    if (!newPassword) {
      alert("Please enter a password.");
      return;
    }

    if (newPassword.length < 4) {
      alert("Password must be at least 4 characters.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          email: `${newUsername.trim()}@investment.com`,
          password: newPassword,
        }),
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          data.message || "Registration failed."
        );
      }

      alert(
        "Account created successfully! You can now login."
      );

      setUsername(newUsername.trim());
      setPassword(newPassword);

      setNewUsername("");
      setNewPassword("");

      setMode("login");
    } catch (err) {
      console.error("Registration error:", err);

      alert(
        err.message ||
          "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CHANGE PASSWORD
  // =========================

  const changePassword = async () => {
    if (!changeUsername.trim()) {
      alert("Please enter your username.");
      return;
    }

    if (!currentPassword) {
      alert("Please enter your current password.");
      return;
    }

    if (!newChangePassword) {
      alert("Please enter your new password.");
      return;
    }

    if (newChangePassword.length < 4) {
      alert("New password must be at least 4 characters.");
      return;
    }

    if (newChangePassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    if (currentPassword === newChangePassword) {
      alert(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: changeUsername.trim(),
            currentPassword: currentPassword,
            newPassword: newChangePassword,
          }),
        }
      );

      const data = await readResponse(res);

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || "Password change failed."
        );
      }

      alert(
        "✅ Password changed successfully!\n\nYou can now login with your new password."
      );

      // Clear form
      setChangeUsername("");
      setCurrentPassword("");
      setNewChangePassword("");
      setConfirmPassword("");

      // Go back to login
      setUsername("");
      setPassword("");
      setMode("login");
    } catch (err) {
      console.error(
        "Change password error:",
        err
      );

      alert(
        err.message ||
          "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGIN PAGE
  // =========================

  if (mode === "login") {
    return (
      <div className="login-page">
        <div className="login-box">

          <h1>Customer Login</h1>

          <p>
            Login to your investment account
          </p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            type="button"
            onClick={login}
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

          <p>
            Don't have an account?
          </p>

          <button
            type="button"
            onClick={() => setMode("register")}
            disabled={loading}
          >
            Create Account
          </button>

          <button
            type="button"
            onClick={() => setMode("change")}
            disabled={loading}
          >
            🔐 Change Password
          </button>

        </div>
      </div>
    );
  }

  // =========================
  // REGISTER PAGE
  // =========================

  if (mode === "register") {
    return (
      <div className="login-page">
        <div className="login-box">

          <h1>Create Account</h1>

          <p>
            Create your investment account
          </p>

          <input
            type="text"
            placeholder="New Username"
            value={newUsername}
            onChange={(e) =>
              setNewUsername(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
          />

          <button
            type="button"
            onClick={register}
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Account"}
          </button>

          <button
            type="button"
            onClick={() => setMode("login")}
            disabled={loading}
          >
            Back to Login
          </button>

        </div>
      </div>
    );
  }

  // =========================
  // CHANGE PASSWORD PAGE
  // =========================

  return (
    <div className="login-page">
      <div className="login-box">

        <h1>🔐 Change Password</h1>

        <p>
          Change your investment account password
        </p>

        <input
          type="text"
          placeholder="Username"
          value={changeUsername}
          onChange={(e) =>
            setChangeUsername(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) =>
            setCurrentPassword(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="New Password"
          value={newChangePassword}
          onChange={(e) =>
            setNewChangePassword(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
        />

        <button
          type="button"
          onClick={changePassword}
          disabled={loading}
        >
          {loading
            ? "Changing Password..."
            : "Change Password"}
        </button>

        <button
          type="button"
          onClick={() => setMode("login")}
          disabled={loading}
        >
          Back to Login
        </button>

      </div>
    </div>
  );
}

export default Login;	


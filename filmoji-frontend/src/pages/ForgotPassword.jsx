import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>

      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Send Reset Link</button>
      </form>

      <p>
        <Link to="/">Back to Login</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;

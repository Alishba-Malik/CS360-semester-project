import logo from "/src/assets/SnapBlocks.png";
import React, { useState } from "react";
import "./Login.css";

const Login = ({ setWalletAddress }) => {
  const [error, setError] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed. Please install MetaMask and refresh.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]); // Update parent state
      setError(""); // Clear errors
    } catch (err) {
      setError("Failed to connect wallet. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <img src={logo} alt="SnapBlock Logo" className="login-image" />
        <h1>Welcome to SnapBlock</h1>
        <p>A snap for today, a block for eternity.</p>
        <button onClick={connectWallet} className="connect-wallet-btn">
          Connect Wallet
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default Login;

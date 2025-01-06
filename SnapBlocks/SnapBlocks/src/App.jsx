import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import SnapBlocks from "/src/artifacts/contracts/SnapBlocks.sol/SnapBlocks.json"; // ABI path
import logo from "/src/assets/SnapBlocks.png"; // Path to your logo image
import Nav from 'react-bootstrap/Nav'; // Import Nav from react-bootstrap
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import React Router components
import Login from "./components/Login"; // Login component
import FileUpload from "./components/FileUpload"; // FileUpload component
import MySnapBlocks from "./components/mySnapBlocks"; // SnapBlocks component
import AccessControl from "./components/AccessControl";
import "./App.css";

function App() {
  const [walletAddress, setWalletAddress] = useState(""); // Wallet state
  const [contract, setContract] = useState(null); // Contract instance
  const [provider, setProvider] = useState(null); // Blockchain provider
  // Initialize provider and contract
  const initializeBlockchain = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Request wallet connection

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address);
      setProvider(provider);

      const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with deployed contract address
      const contractInstance = new ethers.Contract(
        contractAddress,
        SnapBlocks.abi,
        signer
      );

      setContract(contractInstance);
      console.log("Blockchain initialized with contract:", contractInstance);

      navigate("/home");
    }
     catch (err) {
      console.error("Error initializing blockchain:", err.message);
    }
  };

  // Automatically initialize blockchain on walletAddress update
  useEffect(() => {
    if (walletAddress) {
      initializeBlockchain();
    }
  }, [walletAddress]);

  return (
    <div className="App">
      <Router>
        {!walletAddress ? (
          // Display Login component if wallet is not connected
          <Login setWalletAddress={setWalletAddress} />
        ) : (
          // Main Page after wallet connection
          <div>
            <div className="header">
              <img src={logo} alt="SnapBlocks Logo" className="logo" />
              {/* Navigation Bar */}
              <Nav className="navbar-horizontal">
                <Nav.Item>
                  <Nav.Link href="/home">Home</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="/file-upload">File Upload</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="/my-snapblocks">My SnapBlocks</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="/access-control">Access Control</Nav.Link>
                </Nav.Item>
              </Nav>
            </div>

            {/* Routes */}
            <Routes>
              <Route
                path="/home"
                element={
                  <div className="home-page">
                    <img src={logo} alt="SnapBlocks Logo" className="login-image" />
                    <h1>Welcome to SnapBlocks</h1>
                    <p>
                      SnapBlocks is a decentralized application that allows you to securely upload and share your files on the blockchain.
                    </p>
                    <div className="cta-container">
                      <button className="cta-button" onClick={() => window.location.href = "/file-upload"}>Get Started</button>
                      <button className="cta-button" onClick={() => window.location.href = "/my-snapblocks"}>My SnapBlocks</button>
                    </div>
                  </div>
                }
              />
              <Route
                path="/file-upload"
                element={<FileUpload contract={contract} account={walletAddress} provider={provider} />}
              />
              <Route
                path="/my-snapblocks"
               element={<MySnapBlocks contract={contract} account={walletAddress} />} />
              <Route
                path="/access-control"
                element={<AccessControl contract={contract} account={walletAddress} />}
              />
            </Routes>
          </div>
        )}
        {/* <footer className="footer">
          <p>&copy; 2024 SnapBlocks. All rights reserved.</p>
          <p>Created by Your Alishba</p>
        </footer> */}
      </Router>
    </div>
  );
}

export default App;
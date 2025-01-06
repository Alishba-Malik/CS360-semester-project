import React, { useState, useEffect } from "react";
import "./AccessControl.css";

const AccessControl = ({ contract, account }) => {
  const [accessList, setAccessList] = useState([]); // Store list of users who have access to the files
  const [newUserAddress, setNewUserAddress] = useState(""); // State for the new user address
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state for handling error messages

  // Fetch the access list from the contract
  useEffect(() => {
    const fetchAccessList = async () => {
      try {
        const accessListData = await contract.getAccessList(); // Get access list for the current user
        setAccessList(
          accessListData.map((item) => ({
            user: item.user,
            access: item.access,
          }))
        );
      } catch (err) {
        console.error("Error fetching access list:", err);
        setError("Failed to fetch access list.");
      } finally {
        setLoading(false);
      }
    };

    if (contract && account) {
      fetchAccessList();
    }
  }, [contract, account]);

  // Grant access to another user
  const handleGrantAccess = async () => {
    if (!newUserAddress) {
      alert("Please enter a valid address.");
      return;
    }

    try {
      await contract.grantAccess(newUserAddress);
      alert(`Access granted to ${newUserAddress}`);
      setNewUserAddress(""); // Clear the input field

      // Optionally refresh the access list
      const updatedAccessList = await contract.getAccessList();
      setAccessList(
        updatedAccessList.map((item) => ({
          user: item.user,
          access: item.access,
        }))
      );
    } catch (err) {
      console.error("Error granting access:", err);
      alert("Error granting access. Please try again.");
    }
  };

  // Revoke access from a user
  const handleRevokeAccess = async (userAddress) => {
    try {
      setLoading(true); // Optional: Show a loading indicator
      await contract.revokeAccess(userAddress);
      alert(`Access revoked from ${userAddress}`);

      // Refresh the access list
      const updatedAccessList = await contract.getAccessList();
      setAccessList(
        updatedAccessList.map((item) => ({
          user: item.user,
          access: item.access,
        }))
      );
    } catch (err) {
      console.error("Error revoking access:", err);
      alert("Error revoking access. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="access-control-container">
      {loading ? (
        <p>Loading access list...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <h2>Manage Access</h2>

          {/* Grant Access Section */}
          <div className="grant-access">
            <input
              type="text"
              value={newUserAddress}
              onChange={(e) => setNewUserAddress(e.target.value)}
              placeholder="Enter user address"
              className="grant-access-input"
            />
            <button onClick={handleGrantAccess} className="grant-access-button">
              Grant Access
            </button>
          </div>

          {/* Users with Access */}
          <h3>Users with Access:</h3>
          <ul className="access-list">
            {accessList.filter((access) => access.access).length === 0 ? (
              <p>No users have access to your files.</p>
            ) : (
              accessList
                .filter((access) => access.access) // Show only users with active access
                .map((access, index) => (
                  <li key={index} className="access-item">
                    <span>{access.user}</span>
                    <button
                      onClick={() => handleRevokeAccess(access.user)}
                      className="revoke-access-button"
                    >
                      Revoke Access
                    </button>
                  </li>
                ))
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default AccessControl;

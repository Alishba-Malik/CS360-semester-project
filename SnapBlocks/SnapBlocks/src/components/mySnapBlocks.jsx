import React, { useState, useEffect } from "react";
import "./SnapBlocks.css";

const MySnapBlocks = ({ contract, account }) => {
  const [userFiles, setUserFiles] = useState([]); // Files uploaded by the user
  const [grantedFiles, setGrantedFiles] = useState([]); // Files the user has access to
  const [accessAddress, setAccessAddress] = useState(""); // Address for granted access files
  const [error, setError] = useState(""); // Error state
  const [loading, setLoading] = useState(false); // Loading state for granted files

  // Fetch files uploaded by the user
  const fetchUserFiles = async () => {
    try {
      const files = await contract.viewFiles(account);
      console.log("User's files:", files);
      setUserFiles(files);
    } catch (err) {
      console.error("Error fetching user's files:", err);
    }
  };

  // Fetch files for a specific address (granted access)
  const fetchGrantedFiles = async () => {
    try {
      setLoading(true);
      setError(""); // Clear previous errors

      if (!accessAddress) {
        setError("Please enter a valid address.");
        setLoading(false);
        return;
      }

      const files = await contract.viewFiles(accessAddress);
      console.log(`Files for address ${accessAddress}:`, files);
      setGrantedFiles(files);
    } catch (err) {
      console.error(`Error fetching files for address ${accessAddress}:`, err);
      setError("Failed to fetch files for the provided address. Please check the access rights.");
    } finally {
      setLoading(false);
    }
  };

  // Initial effect to fetch the user's files
  useEffect(() => {
    if (contract && account) {
      fetchUserFiles();
    }
  }, [contract, account]);

  // Function to extract folder and file name from file path
  const parseFileData = (file) => {
    const [filePath, fileUrl] = file.split("@");
    const folder = filePath.includes("/") ? filePath.split("/")[0] : "Root";
    const fileName = filePath.split("/").pop();
    return { folder, fileName, fileUrl };
  };

  // Group files by folder
  const groupFilesByFolder = (files) => {
    const grouped = {};
    files.forEach((file) => {
      const { folder } = parseFileData(file);
      if (!grouped[folder]) grouped[folder] = [];
      grouped[folder].push(file);
    });
    return grouped;
  };

  const handleFileClick = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  const groupedUserFiles = groupFilesByFolder(userFiles);
  const groupedGrantedFiles = groupFilesByFolder(grantedFiles);

  return (
    <div className="snapblocks-container">
      <h2>Your Uploaded Files</h2>
      {Object.keys(groupedUserFiles).length === 0 ? (
        <p>You have not uploaded any files yet.</p>
      ) : (
        Object.keys(groupedUserFiles).map((folder) => (
          <div key={folder} className="folder-section">
            <h3>{folder}</h3>
            <ul>
              {groupedUserFiles[folder].map((file, index) => {
                const { fileName, fileUrl } = parseFileData(file);
                return (
                  <li key={index} onClick={() => handleFileClick(fileUrl)}>
                    {fileName}
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}

      <h2>View Files with Granted Access</h2>
      <div className="access-input">
        <label htmlFor="access-address">Enter Address to View Files:</label>
        <input
          type="text"
          id="access-address"
          value={accessAddress}
          onChange={(e) => setAccessAddress(e.target.value)}
          placeholder="0x..."
        />
        <button onClick={fetchGrantedFiles} disabled={loading}>
          {loading ? "Loading..." : "Fetch Files"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {Object.keys(groupedGrantedFiles).length > 0 ? (
        Object.keys(groupedGrantedFiles).map((folder) => (
          <div key={folder} className="folder-section">
            <h3>{folder}</h3>
            <ul>
              {groupedGrantedFiles[folder].map((file, index) => {
                const { fileName, fileUrl } = parseFileData(file);
                return (
                  <li key={index} onClick={() => handleFileClick(fileUrl)}>
                    {fileName}
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      ) : (
        accessAddress && !loading && !error && (
          <p>No files found for the provided address or you do not have access.</p>
        )
      )}
    </div>
  );
};

export default MySnapBlocks;

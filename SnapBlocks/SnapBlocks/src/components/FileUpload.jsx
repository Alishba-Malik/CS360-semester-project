import { useState } from "react";
import axios from "axios";
import "./FileUpload.css";

const FileUpload = ({ contract, account, provider }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [folderName, setFolderName] = useState(""); // New state to track folder name
  const [folders, setFolders] = useState([]); // State to store folder names dynamically
  const [uploadedFiles, setUploadedFiles] = useState([]); // State to track uploaded files

  // Create a new folder
  const handleCreateFolder = () => {
    if (folderName.trim() !== "" && !folders.includes(folderName)) {
      setFolders([...folders, folderName]);
      setFolderName("");
      alert(`Folder '${folderName}' created successfully!`);
    } else {
      alert("Folder already exists or name is empty.");
    }
  };

  // Handle file upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `YOUR_API_KEY`, 
            pinata_secret_api_key: `YOUR_SECRET_KEY`, 
            "Content-Type": "multipart/form-data",
          },
        });

        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        const filePath = folderName ? `${folderName}/${fileName}` : fileName; // Add folder path to the file
        await contract.addFile(account, filePath + "@" + ImgHash); // Append path for better structure

        // Update uploaded files state
        setUploadedFiles([...uploadedFiles, { name: filePath, url: ImgHash }]);

        alert(`File uploaded to folder '${folderName || "root"}' successfully!`);
        setFileName("No file selected");
        setFile(null);
      } catch (e) {
        console.error("Error uploading file:", e);
        alert("Unable to upload file. Try again.");
      }
    } else {
      alert("Please select a file to upload.");
    }
  };

  // Handle file selection
  const retrieveFile = (e) => {
    const data = e.target.files[0];
    setFile(e.target.files[0]);
    setFileName(data.name);
    e.preventDefault();
  };

  // Delete a folder
  const handleDeleteFolder = (folder) => {
    setFolders(folders.filter((f) => f !== folder));
    setUploadedFiles(uploadedFiles.filter((file) => !file.name.startsWith(folder + "/")));
    alert(`Folder '${folder}' and its files have been deleted.`);
  };

  // Delete a file
  const handleDeleteFile = (fileToDelete) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.name !== fileToDelete.name));
    alert(`File '${fileToDelete.name}' has been deleted.`);
  };

  return (
    <div className="file-upload-container">
      {/* Folder Creation */}
      <div className="folder-section">
        <input
          type="text"
          placeholder="Create Folder"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="folder-input"
        />
        <button onClick={handleCreateFolder} className="folder-button">
          Create Folder
        </button>
      </div>

      {/* Display Existing Folders */}
      {folders.length > 0 && (
        <div className="folders-list">
          <h4>Folders:</h4>
          <ul>
            {folders.map((folder, index) => (
              <li key={index} className="folder-item">
                {folder}
                <button
                  className="delete-button"
                  onClick={() => handleDeleteFolder(folder)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* File Upload Section */}
      <form className="file-upload-form" onSubmit={handleSubmit}>
        <label htmlFor="file-upload" className="file-input-label">
          Select File
        </label>
        <input
          disabled={!account}
          type="file"
          id="file-upload"
          className="file-input"
          name="data"
          onChange={retrieveFile}
        />
        <span className="file-name-display">{fileName}</span>

        {/* Folder Selection */}
        {folders.length > 0 && (
          <div>
            <label>Select Folder:</label>
            <select
              onChange={(e) => setFolderName(e.target.value)}
              className="folder-select"
              value={folderName}
            >
              <option value="">Root</option>
              {folders.map((folder, index) => (
                <option key={index} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="file-upload-button" disabled={!file}>
          Upload
        </button>
      </form>

      {/* Display Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>Uploaded Files:</h4>
          <ul>
            {uploadedFiles.map((uploadedFile, index) => (
              <li key={index} className="file-item">
                <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer">
                  {uploadedFile.name}
                </a>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteFile(uploadedFile)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

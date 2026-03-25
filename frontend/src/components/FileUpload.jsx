import React, { useState, useRef } from "react";
import "./FileUpload.css"; // make sure this matches your css filename

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setMessage("File size too large. Maximum size is 10MB.");
        setFile(null);
        return;
      }

      // Check file type
      const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
      const allowedTypes = ["csv", "xlsx", "xls"];

      if (allowedTypes.includes(fileExtension)) {
        setFile(selectedFile);
        setMessage(
          `Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`,
        );
        setData(null);
      } else {
        setMessage("Please select a CSV or Excel file ( .csv, .xlsx, .xls )");
        setFile(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first");
      return;
    }

    setUploading(true);
    setMessage("");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      const response = await new Promise((resolve, reject) => {
        xhr.open('POST', 'http://127.0.0.1:5000/upload_file');

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const responseText = xhr.responseText;
              const parsedResponse = JSON.parse(responseText);
              resolve(parsedResponse);
            } catch (parseError) {
              console.error("JSON Parse Error:", parseError);
              reject(new Error("Invalid server response format"));
            }
          } else {
            reject(new Error(`Server error: ${xhr.status}`));
          }
        };

        xhr.onerror = () =>
          reject(new Error("Network error - cannot connect to server"));
        xhr.send(formData);
      });

      if (response.success) {
        setData(response);
        setMessage(`✅ ${response.message || "File uploaded successfully!"}`);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setMessage(`❌ ${response.message || "Upload failed"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`❌ ${error.message || "Upload failed"}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setData(null);
    setMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper function to safely display cell values
  const displayCellValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "NULL";
    }
    if (typeof value === "number" && (isNaN(value) || !isFinite(value))) {
      return "NULL";
    }
    return String(value);
  };

  return (
    <div className="advanced-upload-container">
      <h2>📁 Upload Data File</h2>

      <div
        className={`drop-zone ${file ? "has-file" : ""}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleDropZoneClick}
        style={{ cursor: "pointer" }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="file-input"
          id="advancedFileInput"
          style={{ display: "none" }}
        />
        <div className="drop-zone-content">
          {file ? (
            <div className="file-info">
              <p>📄 {file.name}</p>
              <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
            </div>
          ) : (
            <div>
              <p>Drag & drop a file here or click to browse</p>
              <p className="file-types">Supported: .csv, .xlsx, .xls</p>
            </div>
          )}
        </div>
      </div>

      <div className="upload-controls">
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="upload-btn"
        >
          {uploading
            ? `Uploading... ${Math.round(uploadProgress)}%`
            : "Upload File"}
        </button>

        <button onClick={resetForm} className="reset-btn">
          Reset
        </button>
      </div>

      {uploading && uploadProgress > 0 && (
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {message && (
        <div
          className={`message ${data ? "success" : file ? "info" : "error"}`}
        >
          {message}
        </div>
      )}

      {data && (
        <div className="data-preview">
          <h3>📊 Data Preview</h3>
          <div className="stats">
            <span>
              Rows: {data.shape ? data.shape[0] : data.preview?.shape[0]}
            </span>
            <span>
              Columns: {data.shape ? data.shape[1] : data.preview?.shape[1]}
            </span>
            {data.null_counts && (
              <span>
                Contains:{" "}
                {
                  Object.values(data.null_counts).filter((count) => count > 0)
                    .length
                }{" "}
                columns with NULL values
              </span>
            )}
          </div>

          {data.preview?.first_few_rows && (
            <div className="table-wrapper data-preview-container">
              <table>
                <thead>
                  <tr>
                    {data.preview.columns.map((column, index) => (
                      <th key={index}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.preview.first_few_rows
                    .slice(0, 5)
                    .map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {data.preview.columns.map((column, colIndex) => (
                          <td key={colIndex}>
                            {displayCellValue(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
              <p className="preview-note">Showing first 5 rows</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;

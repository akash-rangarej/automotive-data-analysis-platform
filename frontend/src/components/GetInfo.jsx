import React, { useState } from "react";

function GetInfo() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  const handleAnalysis = async (analysisType) => {
    setLoading(true);
    setError(null);
    setCurrentAnalysis(analysisType);
    try {
      const response = await fetch(`http://localhost:5000/${analysisType}`);
      
      // Parse the response first to get the backend error message
      const data = await response.json();
      
      // Then check if the response was ok
      if (!response.ok) {
        // Use the backend error message if available, otherwise use generic message
        throw new Error(data.error || "Something went wrong");
      }
      
      setAnalysisData(data.data); // Access the data property from backend response
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  };

  const cellStyle = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
  };

  const headerStyle = {
    ...cellStyle,
    backgroundColor: "#f4f4f4",
    fontWeight: "bold",
  };

  const renderAnalysisResults = () => {
    if (!analysisData) return null;

    // All data from backend is now arrays, so we can safely check
    if (!Array.isArray(analysisData)) {
      return (
        <div>
          <h3>Analysis Results</h3>
          <pre>{JSON.stringify(analysisData, null, 2)}</pre>
        </div>
      );
    }

    switch (currentAnalysis) {
      case "get_nulls":
        return (
          <div>
            <h3>Null Values Count</h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerStyle}>Column</th>
                  <th style={headerStyle}>Null Count</th>
                  <th style={headerStyle}>Total Values</th>
                  <th style={headerStyle}>Null Percentage</th>
                </tr>
              </thead>
              <tbody>
                {analysisData.map((item, index) => {
                  const nullPercentage = ((item.null_count / item.total_values) * 100).toFixed(2);
                  return (
                    <tr key={index}>
                      <td style={cellStyle}>{item.column}</td>
                      <td style={cellStyle}>{item.null_count}</td>
                      <td style={cellStyle}>{item.total_values}</td>
                      <td style={cellStyle}>{nullPercentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case "get_outliers":
        return (
          <div>
            <h3>Outliers Analysis</h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerStyle}>Column</th>
                  <th style={headerStyle}>Outliers Count</th>
                  <th style={headerStyle}>Outlier Percentage</th>
                  <th style={headerStyle}>Lower Fence</th>
                  <th style={headerStyle}>Upper Fence</th>
                  <th style={headerStyle}>Total Values</th>
                </tr>
              </thead>
              <tbody>
                {analysisData.map((item, index) => (
                  <tr key={index}>
                    <td style={cellStyle}>{item.column}</td>
                    <td style={cellStyle}>{item.outliers_count}</td>
                    <td style={cellStyle}>{item.outlier_percentage}</td>
                    <td style={cellStyle}>{item.lower_fence?.toFixed(2)}</td>
                    <td style={cellStyle}>{item.upper_fence?.toFixed(2)}</td>
                    <td style={cellStyle}>{item.total_values}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "get_value_counts":
        // Check if analysisData is empty (no categorical columns)
        if (analysisData.length === 0) {
          return (
            <div>
              <h3>Value Counts</h3>
              <p style={{ color: "#666", fontStyle: "italic", marginTop: "20px" }}>
                No categorical data available to show as value counts
              </p>
            </div>
          );
        }
        
        return (
          <div>
            <h3>Value Counts</h3>
            {analysisData.map((item, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <h4>{item.column} Value Counts (Top 5):</h4>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={headerStyle}>Value</th>
                      <th style={headerStyle}>Count</th>
                      <th style={headerStyle}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(item.value_counts || {}).map(([value, count]) => {
                      const percentage = ((count / item.total_values) * 100).toFixed(2);
                      return (
                        <tr key={value}>
                          <td style={cellStyle}>{value || '(Empty)'}</td>
                          <td style={cellStyle}>{count}</td>
                          <td style={cellStyle}>{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="get-info">
      <h2>Dataset Information</h2>
      <div className="info-container">
        <div className="analysis-buttons" style={{ marginBottom: "20px" }}>
          <button
            onClick={() => handleAnalysis("get_nulls")}
            style={{ margin: "0 10px" }}
          >
            Get No. of Nulls
          </button>
          <button
            onClick={() => handleAnalysis("get_outliers")}
            style={{ margin: "0 10px" }}
          >
            Get No. of Outliers
          </button>
          <button
            onClick={() => handleAnalysis("get_value_counts")}
            style={{ margin: "0 10px" }}
          >
            Get Value Counts
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {analysisData && renderAnalysisResults()}
      </div>
    </div>
  );
}

export default GetInfo;
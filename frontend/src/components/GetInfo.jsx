import React, { useState } from "react";
import "./GetInfo.css";

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
      const response = await fetch(`/${analysisType}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setAnalysisData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysisResults = () => {
    if (!analysisData) return null;

    if (!Array.isArray(analysisData)) {
      return (
        <div className="analysis-results">
          <h3>Analysis Results</h3>
          <pre>{JSON.stringify(analysisData, null, 2)}</pre>
        </div>
      );
    }

    switch (currentAnalysis) {
      case "get_nulls":
        return (
          <div className="analysis-results get_nulls">
            <h3>Null Values Analysis</h3>
            <div className="analysis-table-wrapper">
              <table className="analysis-table">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Null Count</th>
                    <th>Total Values</th>
                    <th>Null Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisData.map((item, index) => {
                    const nullPercentage = (
                      (item.null_count / item.total_values) *
                      100
                    ).toFixed(2);
                    return (
                      <tr key={index}>
                        <td>{item.column}</td>
                        <td>{item.null_count}</td>
                        <td>{item.total_values}</td>
                        <td>{nullPercentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "get_outliers":
        return (
          <div className="analysis-results get_outliers">
            <h3>Outliers Analysis</h3>
            <div className="analysis-table-wrapper">
              <table className="analysis-table">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Outliers Count</th>
                    <th>Outlier Percentage</th>
                    <th>Lower Fence</th>
                    <th>Upper Fence</th>
                    <th>Total Values</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.column}</td>
                      <td>{item.outliers_count}</td>
                      <td>{item.outlier_percentage}</td>
                      <td>{item.lower_fence?.toFixed(2)}</td>
                      <td>{item.upper_fence?.toFixed(2)}</td>
                      <td>{item.total_values}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "get_value_counts":
        if (analysisData.length === 0) {
          return (
            <div className="analysis-results get_value_counts">
              <h3>Value Counts</h3>
              <div className="no-data-message">
                No categorical data available to show as value counts
              </div>
            </div>
          );
        }

        return (
          <div className="analysis-results get_value_counts">
            <h3>Value Counts</h3>
            {analysisData.map((item, index) => (
              <div key={index} style={{ marginBottom: "2rem" }}>
                <h4>{item.column} Value Counts (Top 5):</h4>
                <div className="analysis-table-wrapper">
                  <table className="analysis-table">
                    <thead>
                      <tr>
                        <th>Value</th>
                        <th>Count</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(item.value_counts || {}).map(
                        ([value, count]) => {
                          const percentage = (
                            (count / item.total_values) *
                            100
                          ).toFixed(2);
                          return (
                            <tr key={value}>
                              <td>{value || "(Empty)"}</td>
                              <td>{count}</td>
                              <td>{percentage}%</td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
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
        <div className="analysis-buttons-wrapper">
          <div className="analysis-buttons">
            <button
              className="analysis-btn"
              onClick={() => handleAnalysis("get_nulls")}
            >
              <span>🔍</span>
              Get Null Values
            </button>
            <button
              className="analysis-btn"
              onClick={() => handleAnalysis("get_outliers")}
            >
              <span>📊</span>
              Get Outliers
            </button>
            <button
              className="analysis-btn"
              onClick={() => handleAnalysis("get_value_counts")}
            >
              <span>📈</span>
              Get Value Counts
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            Analyzing dataset...
          </div>
        )}

        {error && <div className="error-state">{error}</div>}

        {analysisData && renderAnalysisResults()}
      </div>
    </div>
  );
}

export default GetInfo;

import React, { useState } from "react";
import "./GetProcessedData.css";

function GetProcessedData() {
  const [selectedStep, setSelectedStep] = useState("");
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [target_column, setTarget_column] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState("");

  const handleStepProcessing = async () => {
    if (!selectedStep) {
      setError("Please select a processing step");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch("http://127.0.0.1:5000/get_processed_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          processing_type: selectedStep,
          target_column: target_column,
          model_type: null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'processed_data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess(`Successfully processed data with ${selectedStep.replace(/_/g, ' ')}`);
      
    } catch (error) {
      console.error("Error processing data:", error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFullPipeline = async () => {
    if (!selectedModel) {
      setError("Please select a model type");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch("http://127.0.0.1:5000/get_processed_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          processing_type: 'full_pipeline',
          model_type: selectedModel,
          target_column: target_column
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'processed_data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess("Successfully processed data through full pipeline");
      
    } catch (error) {
      console.error("Error processing data:", error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const processingSteps = [
    { value: "handle_missing_values", label: "Handle Missing Values" },
    { value: "scale_features", label: "Scale the Dataset" },
    { value: "remove_outliers", label: "Remove Outliers" },
    { value: "encode_categorical", label: "Encode Categorical Data" }
  ];

  const modelTypes = [
    { 
      value: "linear_models", 
      label: "Linear Models",
      description: "Linear/Logistic Regression, SVM"
    },
    { 
      value: "tree_models", 
      label: "Tree-based Models", 
      description: "Random Forest, XGBoost" 
    },
    { 
      value: "clustering_models", 
      label: "Clustering Models", 
      description: "K-Means, DBSCAN" 
    },
    { 
      value: "naive_bayes", 
      label: "Naive Bayes" 
    },
    { 
      value: "neural_network", 
      label: "Neural Network" 
    },
    { 
      value: "distance_based_models", 
      label: "Distance-based Models", 
      description: "KNN, PCA" 
    }
  ];

  return (
    <div className="processed-data">
      <h2>Data Processing Pipeline</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
      
      <div className="processing-options">
        <h3>Individual Processing Steps</h3>
        <div className="control-group">
          <div className="form-control">
            <label>Processing Type</label>
            <select 
              className="form-select"
              value={selectedStep} 
              onChange={(e) => setSelectedStep(e.target.value)}
            >
              <option value="">Select Processing Type</option>
              {processingSteps.map(step => (
                <option key={step.value} value={step.value}>
                  {step.label}
                </option>
              ))}
            </select>
          </div>

          {selectedStep === "encode_categorical" && (
            <div className="form-control">
              <label>Target Column</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="Enter target column name or 'no'" 
                onChange={(e) => setTarget_column(e.target.value)}
              />
            </div>
          )}

          <button 
            className="process-btn"
            onClick={handleStepProcessing} 
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Process Data"}
          </button>
        </div>

        {isProcessing && (
          <div className="processing-state">
            <div className="processing-spinner"></div>
            Processing your data...
          </div>
        )}
      </div>

      <div className="full-pipeline">
        <h3>Get Fully Pre-processed Dataset</h3>
        <p>Select the ML model type you are going to train with this dataset:</p>
        
        <div className="control-group">
          <div className="form-control">
            <label>ML Model Type</label>
            <select 
              className="form-select"
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="">Select the ML model type</option>
              {modelTypes.map(model => (
                <option key={model.value} value={model.value}>
                  {model.label}
                  {model.description && ` (${model.description})`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label>Target Column (for encoding)</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="Enter target column name or 'no'" 
              onChange={(e) => setTarget_column(e.target.value)}
            />
          </div>

          <button 
            className="process-btn"
            onClick={handleFullPipeline} 
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Get Processed Data"}
          </button>
        </div>

        {isProcessing && (
          <div className="processing-state">
            <div className="processing-spinner"></div>
            Running full pipeline processing...
          </div>
        )}
      </div>
    </div>
  );
}

export default GetProcessedData;
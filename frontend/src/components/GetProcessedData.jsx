import React, { useState } from "react";

function GetProcessedData() {
  const [selectedStep, setSelectedStep] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStepProcessing = async () => {
    if (!selectedStep) {
      alert("Please select a processing step");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("http://localhost:5000/get_processed_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          processing_type: selectedStep,
          model_type: null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'processed_data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error processing data:", error);
      alert("Error processing data. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFullPipeline = async () => {
    if (!selectedModel) {
      alert("Please select a model type");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("http://localhost:5000/get_processed_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          processing_type: 'full_pipeline',
          model_type: selectedModel
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'processed_data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error processing data:", error);
      alert("Error processing data. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="processed-data">
      <h2>Processed Data</h2>
      
      <div className="processing-options">
        <h3>Individual Processing Steps</h3>
        <select 
          value={selectedStep} 
          onChange={(e) => setSelectedStep(e.target.value)}
        >
          <option value="">Select Processing Type</option>
          <option value="handle_missing_values">Handle Missing Values</option>
          <option value="scale_features">Scale the Dataset</option>
          <option value="remove_outliers">Remove Outliers</option>
          <option value="encode_categorical">Encode Categorical Data</option>
          <option value="normalize_features">Normalize Features</option>
        </select>
        <button 
          onClick={handleStepProcessing} 
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Process Data"}
        </button>
      </div>

      <div className="full-pipeline">
        <h3>Get Fully Pre-processed Dataset</h3>
        <p>Select the ML model type you are going to train with this dataset:</p>
        <select 
          value={selectedModel} 
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="">Select the ML model type</option>
          <option value="linear_models">Linear Models (Linear/Logistic Regression, SVM)</option>
          <option value="tree_models">Tree-based Models (Random Forest, XGBoost)</option>
          <option value="clustering_models">Clustering Models (K-Means, DBSCAN)</option>
          <option value="naive_bayes">Naive Bayes</option>
          <option value="neural_network">Neural Network</option>
          <option value="distance_based_models">Distance-based Models (KNN, PCA)</option>
        </select>
        <button 
          onClick={handleFullPipeline} 
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Get Processed Data"}
        </button>
      </div>
    </div>
  );
}

export default GetProcessedData;
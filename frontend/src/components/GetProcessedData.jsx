import React, { useState } from "react";

function GetProcessedData() {
  const [selectedStep, setSelectedStep] = useState("");
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [target_column, setTarget_column] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStepProcessing = async () => {
    if (!selectedStep) {
      alert("Please select a processing step");
      return;
    }

    setIsProcessing(true);
    setError(""); // Clear previous errors
    
    try {
      const response = await fetch("http://localhost:5000/get_processed_data", {
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

      // Check if response is OK
      if (!response.ok) {
        // Try to parse error message from response
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Check if response is JSON (error) or blob (success)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // It's a JSON error response
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      // It's a CSV file - proceed with download
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
      setError(error.message); // Set error state to show on page
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
    setError(""); // Clear previous errors
    
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

      // Check if response is OK
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Check if response is JSON (error) or blob (success)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error);
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
      setError(error.message); // Set error state to show on page
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="processed-data">
      <h2>Processed Data</h2>
      
      {/* Show error message prominently */}
      {error && (
        <div className="error-message" style={{color: 'red', padding: '10px', border: '1px solid red', margin: '10px 0'}}>
           {error}
        </div>
      )}
      
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
        </select>

        <button 
          onClick={handleStepProcessing} 
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Process Data"}
        </button>
        {selectedStep==="encode_categorical"?
        <input 
          type="text" 
          placeholder="Enter categorical target column name(if available) or 'no'" 
          onChange={(e)=>setTarget_column(e.target.value)}
          style={{marginLeft: '10px', padding: '5px', width:'380px'}}
        />:''
        }
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
         <input 
          type="text" 
          placeholder="Enter categorical target column name(if available) or 'no'" 
          onChange={(e)=>setTarget_column(e.target.value)}
          style={{marginLeft: '10px', padding: '5px', width:'380px'}}
        />
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
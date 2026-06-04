import React, { useEffect, useState } from "react";
import "./ModelTrain.css";

const problemTypes = [
  { value: "classification", label: "Classification" },
  { value: "regression", label: "Regression" }
];

const modelTypes = [
  { value: "linear_models", label: "Linear Models" },
  { value: "tree_models", label: "Tree-based Models" },
  { value: "distance_based_models", label: "Distance-based Models" },
  { value: "naive_bayes", label: "Naive Bayes" },
  { value: "neural_network", label: "Neural Network" }
];

function ModelTrain() {
  const [columns, setColumns] = useState([]);
  const [problemType, setProblemType] = useState("");
  const [modelType, setModelType] = useState("");
  const [targetColumn, setTargetColumn] = useState("");
  const [accuracies, setAccuracies] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch("/get_columns");
        if (!response.ok) throw new Error("Unable to load dataset columns");

        const data = await response.json();
        setColumns(data.columns || []);
      } catch (fetchError) {
        setError(fetchError.message);
      }
    };

    fetchColumns();
  }, []);

  const handleTraining = async () => {
    if (!problemType || !modelType || !targetColumn) {
      setError("Please select a problem type, model type, and target column");
      return;
    }

    setIsTraining(true);
    setError("");
    setAccuracies([]);

    try {
      const response = await fetch("/get_trained_model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_type: problemType,
          model_type: modelType,
          target_column: targetColumn
        })
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Unable to train models");
      }

      setAccuracies(Object.entries(data.accuracies || {}));
    } catch (trainingError) {
      setError(trainingError.message || "Unable to train models");
    } finally {
      setIsTraining(false);
    }
  };

  const metricLabel = problemType === "regression" ? "R2 Score" : "Accuracy";

  return (
    <div className="model-train">
      <h2>Train and Compare Models</h2>
      {error && <div className="error-message">{error}</div>}

      <section className="training-options">
        <h3>Training Configuration</h3>
        <p>Choose how the uploaded dataset should be processed and evaluated.</p>

        <div className="training-control-group">
          <div className="training-form-control">
            <label htmlFor="problem-type">Problem Type</label>
            <select id="problem-type" className="training-form-select" value={problemType} onChange={(event) => setProblemType(event.target.value)}>
              <option value="">Select problem type</option>
              {problemTypes.map((problem) => <option key={problem.value} value={problem.value}>{problem.label}</option>)}
            </select>
          </div>

          <div className="training-form-control">
            <label htmlFor="model-type">Model Type</label>
            <select id="model-type" className="training-form-select" value={modelType} onChange={(event) => setModelType(event.target.value)}>
              <option value="">Select model type</option>
              {modelTypes.map((model) => <option key={model.value} value={model.value}>{model.label}</option>)}
            </select>
          </div>

          <div className="training-form-control">
            <label htmlFor="target-column">Target Column</label>
            <select id="target-column" className="training-form-select" value={targetColumn} onChange={(event) => setTargetColumn(event.target.value)}>
              <option value="">Select target column</option>
              {columns.map((column) => <option key={column} value={column}>{column}</option>)}
            </select>
          </div>

          <button className="train-btn" type="button" onClick={handleTraining} disabled={isTraining || columns.length === 0}>
            {isTraining ? "Training..." : "Train Models"}
          </button>
        </div>

        {isTraining && (
          <div className="training-state">
            <div className="training-spinner" />
            Training and evaluating models...
          </div>
        )}
      </section>

      {accuracies.length > 0 && (
        <section className="training-results">
          <h3>Model Performance</h3>
          <p>{accuracies.length} algorithms evaluated</p>
          <div className="results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr><th>Algorithm Name</th><th>{metricLabel}</th></tr>
              </thead>
              <tbody>
                {accuracies.map(([algorithm, accuracy]) => (
                  <tr key={algorithm}>
                    <td>{algorithm}</td>
                    <td className="metric-value">{problemType === "classification" ? `${accuracy}%` : accuracy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default ModelTrain;

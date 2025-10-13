import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about">
      <div className="about-header">
        <h1>About Data Analytics Suite</h1>
        <p className="about-subtitle">Making Data Analysis Accessible for Everyone</p>
      </div>

      <div className="about-content">
        {/* Objective Section */}
        <section className="about-section">
          <div className="section-header">
            <div className="section-icon">🎯</div>
            <h2>Our Objective</h2>
          </div>
          <div className="section-content">
            <p>
              Making data analysis, data visualization and data preprocessing easy for beginners 
              who struggle to perform data analysis and preprocessing. We provide a platform where 
              users can perform comprehensive data analysis with just a few clicks.
            </p>
          </div>
        </section>

        {/* Key Features */}
        <section className="about-section">
          <div className="section-header">
            <div className="section-icon">🚀</div>
            <h2>Key Features</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Dataset Analysis</h3>
              <ul>
                <li>Column descriptions and statistics</li>
                <li>Null values detection and counting</li>
                <li>Outlier identification with valid ranges</li>
                <li>Value counts for categorical data</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Data Visualization</h3>
              <ul>
                <li>Line plots and bar charts</li>
                <li>Histograms and box plots</li>
                <li>Scatter plots and heatmaps</li>
                <li>Pie charts and pair plots</li>
                <li>Export visualizations as images</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Smart Data Processing</h3>
              <ul>
                <li>Model-specific preprocessing</li>
                <li>Automatic feature scaling</li>
                <li>Categorical encoding</li>
                <li>Outlier handling</li>
                <li>Download ready-to-use datasets</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="about-section">
          <div className="section-header">
            <div className="section-icon">🔄</div>
            <h2>How It Works</h2>
          </div>
          <div className="workflow-steps">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Upload Your Dataset</h3>
                <p>Start by uploading your CSV file through our intuitive interface</p>
              </div>
            </div>

            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Choose Your Analysis</h3>
                <p>Select from three main options: Get Info, Visualize, or Process Data</p>
              </div>
            </div>

            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Get Instant Results</h3>
                <p>Receive comprehensive analysis, beautiful visualizations, or ML-ready data</p>
              </div>
            </div>
          </div>
        </section>

        {/* Processing Capabilities */}
        <section className="about-section">
          <div className="section-header">
            <div className="section-icon">🤖</div>
            <h2>Smart Processing for ML Models</h2>
          </div>
          <div className="processing-grid">
            <div className="model-type">
              <h4>Linear Models</h4>
              <p>Linear/Logistic Regression, SVM, Perceptron</p>
              <ul>
                <li>Feature scaling</li>
                <li>One-Hot Encoding</li>
                <li>Outlier handling</li>
              </ul>
            </div>

            <div className="model-type">
              <h4>Tree-Based Models</h4>
              <p>Random Forest, XGBoost, LightGBM</p>
              <ul>
                <li>Categorical encoding</li>
                <li>Missing value handling</li>
                <li>Optimal preprocessing</li>
              </ul>
            </div>

            <div className="model-type">
              <h4>Neural Networks</h4>
              <p>MLP, CNN, RNN, Transformers</p>
              <ul>
                <li>Input normalization</li>
                <li>Embedding preparation</li>
                <li>Missing value imputation</li>
              </ul>
            </div>

            <div className="model-type">
              <h4>Clustering Models</h4>
              <p>K-Means, DBSCAN</p>
              <ul>
                <li>Distance-based scaling</li>
                <li>Outlier detection</li>
                <li>Dimensionality optimization</li>
              </ul>
            </div>

            <div className="model-type">
              <h4>Distance-Based Models</h4>
              <p>KNN, PCA</p>
              <ul>
                <li>Feature normalization</li>
                <li>Missing value imputation</li>
                <li>Categorical encoding</li>
              </ul>
            </div>

            <div className="model-type">
              <h4>Naïve Bayes</h4>
              <p>Various implementations</p>
              <ul>
                <li>Feature discretization</li>
                <li>Text preprocessing</li>
                <li>Standardization</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Get Started */}
        <section className="about-section get-started">
          <div className="section-header">
            <div className="section-icon">🎉</div>
            <h2>Ready to Get Started?</h2>
          </div>
          <div className="section-content">
            <p>
              Upload your dataset and experience the power of simplified data analysis. 
              No coding required, no complex configurations - just pure data insights.
            </p>
            <div className="cta-buttons">
              <button className="cta-btn primary">
                <span>📁</span>
                Upload Your First Dataset
              </button>
              <button className="cta-btn secondary">
                <span>📚</span>
                View Documentation
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
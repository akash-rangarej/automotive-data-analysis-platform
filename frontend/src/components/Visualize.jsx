import React, { useState, useEffect } from 'react';
import "./Visualize.css";

const Visualize = () => {
  const [plotImage, setPlotImage] = useState('');
  const [plotType, setPlotType] = useState('');
  const [selectedX, setSelectedX] = useState('');
  const [selectedY, setSelectedY] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [datacols, setDatacols] = useState([]);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch(' http://127.0.0.1:5000/get_columns');
        const Data = await response.json();
        setDatacols(Data.columns || []);
      } catch (error) {
        console.error('Error fetching columns');
      }
    };
    
    fetchColumns();
  }, []);

  const handlePlotGeneration = async (plotFunction) => {
    setLoading(true);
    setError('');
    
    try {
      const requestBody = { 
        plot_function: plotFunction,
        title: title
      };
      
      if (['lineplot', 'barplot', 'scatterplot'].includes(plotFunction)) {
        if (!selectedX || !selectedY) {
          setError('Please select both X and Y columns');
          setLoading(false);
          return;
        }
        requestBody.x = selectedX;
        requestBody.y = selectedY;
      } else if (['piechart', 'boxplot', 'histogram'].includes(plotFunction)) {
        if (!selectedColumn) {
          setError('Please select a column');
          setLoading(false);
          return;
        }
        requestBody.column = selectedColumn;
      }
      
      const response = await fetch(' http://127.0.0.1:5000/generate_plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      }
      
      setPlotImage(`data:image/png;base64,${data.image}`);
      setPlotType(plotFunction);
    } 
    
    catch (error) {
      setError(error || 'Failed to generate plot');
    }
    
    finally {
      setLoading(false);
    }
  };

  const downloadPlot = () => {
    if (plotImage) {
      const link = document.createElement('a');
      link.href = plotImage;
      link.download = `${plotType}_plot.png`;
      link.click();
    }
  };

  const plotButtons = [
    { type: 'lineplot', label: 'Line Plot' },
    { type: 'barplot', label: 'Bar Plot' },
    { type: 'scatterplot', label: 'Scatter Plot' },
    { type: 'piechart', label: 'Pie Chart' },
    { type: 'heatmap', label: 'Heatmap' },
    { type: 'boxplot', label: 'Box Plot' },
    { type: 'histogram', label: 'Histogram' },
    { type: 'pairplot', label: 'Pair Plot' }
  ];

  return (
    <div className="visualize">
      <h2>Data Visualization</h2>
      
      {/* Selection Form */}
      <div className="selection-form">
        <div className="form-row">
          <div className="form-group">
            <label>X Column:</label>
            <select 
              className="form-select"
              value={selectedX} 
              onChange={(e) => setSelectedX(e.target.value)}
            >
              <option value="">Select X column</option>
              {datacols?.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Y Column:</label>
            <select 
              className="form-select"
              value={selectedY} 
              onChange={(e) => setSelectedY(e.target.value)}
            >
              <option value="">Select Y column</option>
              {datacols?.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Chart Title:</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="Enter chart title" 
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Single Column (for pie/box/histogram):</label>
            <select 
              className="form-select"
              value={selectedColumn} 
              onChange={(e) => setSelectedColumn(e.target.value)}
            >
              <option value="">Select column</option>
              {datacols?.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* Plot Buttons */}
      <div className="plot-buttons">
        {plotButtons.map((button) => (
          <button
            key={button.type}
            className="plot-button"
            data-type={button.type}
            onClick={() => handlePlotGeneration(button.type)}
            disabled={loading}
          >
            <span className="plot-icon"></span>
            {button.label}
          </button>
        ))}
      </div>
      
      {/* Plot Display */}
      {plotImage ? (
        <div className="plot-display">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              Generating visualization...
            </div>
          ) : (
            <>
              <img 
                src={plotImage} 
                alt="Generated Plot" 
                className="plot-image"
              />
              <br />
              <button className="download-btn" onClick={downloadPlot}>
                <span>💾</span>
                Download Plot
              </button>
            </>
          )}
        </div>
      ) : (
        !loading && (
          <div className="plot-empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Visualization Generated</h3>
            <p>Select your data and choose a plot type to generate visualization</p>
          </div>
        )
      )}
    </div>
  );
};

export default Visualize;
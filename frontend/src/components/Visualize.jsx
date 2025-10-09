import React, { useState,useEffect } from 'react';

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
        const response = await fetch('http://localhost:5000/get_columns');
        const Data = await response.json();
        setDatacols(Data.columns || []);
      } catch (error) {
        console.error('Error fetching columns:', error);
      }
    };
    
    fetchColumns();
  }, []);

  const handlePlotGeneration = async (plotFunction) => {
    setLoading(true);
    setError('');
    
    try {
      const requestBody = { plot_function: plotFunction,
        title:title
       };
      
      // Add required parameters based on plot type
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
      
      const response = await fetch('http://localhost:5000/generate_plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setPlotImage(`data:image/png;base64,${data.image}`);
      setPlotType(plotFunction);
    } catch (error) {
      console.error('Error generating plot:', error);
      setError(error.message || 'Failed to generate plot');
    } finally {
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

  return (
    <div style={{ padding: '20px' }}>
      <h2>Data Visualization</h2>
      
      {/* Column Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>
          X Column:
          <select 
            value={selectedX} 
            onChange={(e) => setSelectedX(e.target.value)}
            style={{ marginLeft: '5px' }}
          >
            <option value="">Select X column</option>
            {datacols?.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </label>
        
        <label style={{ marginRight: '10px', marginLeft: '15px' }}>
          Y Column:
          <select 
            value={selectedY} 
            onChange={(e) => setSelectedY(e.target.value)}
            style={{ marginLeft: '5px' }}
          >
            <option value="">Select Y column</option>
            {datacols?.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </label>
         <label style={{ marginRight: '10px', marginLeft: '15px' }}>
          Title:
        <input type="text" placeholder='Enter the title here' onChange={(e)=>setTitle(e.target.value)}/>
          </label>

        <label style={{ marginRight: '10px', marginLeft: '15px' }}>
          Single Column (for pie chart):
          <select 
            value={selectedColumn} 
            onChange={(e) => setSelectedColumn(e.target.value)}
            style={{ marginLeft: '5px' }}
          >
            <option value="">Select column</option>
            {datacols?.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </label>
      </div>
      
      {/* Error Message */}
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      {/* Plot Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => handlePlotGeneration('lineplot')}
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          Line Plot
        </button>
        
        <button 
          onClick={() => handlePlotGeneration('barplot')}
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          Bar Plot
        </button>
        
        <button 
          onClick={() => handlePlotGeneration('scatterplot')}
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          Scatter Plot
        </button>
        
        <button 
          onClick={() => handlePlotGeneration('piechart')}
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          Pie Chart
        </button>
        
        <button 
          onClick={() => handlePlotGeneration('heatmap')}
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          Heatmap
        </button>

        <button 
          onClick={() => handlePlotGeneration('boxplot')}
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          Box Plot
        </button>

        <button 
          onClick={() => handlePlotGeneration('histogram')}
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          Histogram
        </button>

        <button 
          onClick={() => handlePlotGeneration('pairplot')}
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          Pair Plot
        </button>
        
      </div>
      
      {/* Display Plot */}
      {plotImage && (
        <div>
          {
            loading?
            'Generating'
            :
            <img 
            src={plotImage} 
            alt="Generated Plot" 
            style={{ maxWidth: '100%', border: '1px solid #ccc' }} 
            />
          }
          <br />
          <button onClick={downloadPlot} style={{ marginTop: '10px' }}>
            Download Plot
          </button>
        </div>
      )}
    </div>
  );
};

export default Visualize;
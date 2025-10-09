import React, { useState } from "react";
import FileUpload from "./components/FileUpload.jsx";
import GetInfo from "./components/GetInfo.jsx";
import Visualize from "./components/Visualize.jsx";
import GetProcessedData from "./components/GetProcessedData.jsx";
import "./App.css";

function App() {
  const [currentComponent, setCurrentComponent] = useState("upload");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { key: "upload", label: "Upload File", icon: "📁" },
    { key: "info", label: "Get Info", icon: "ℹ️" },
    { key: "visualize", label: "Visualize", icon: "📊" },
    { key: "processed", label: "Processed Data", icon: "⚡" }
  ];

  const renderComponent = () => {
    switch (currentComponent) {
      case "upload": return <FileUpload />;
      case "info": return <GetInfo />;
      case "visualize": return <Visualize />;
      case "processed": return <GetProcessedData />;
      default: return <FileUpload />;
    }
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">📈</div>
            <h1>Data Analytics Suite</h1>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar Navigation */}
        <nav className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-items">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`nav-btn ${currentComponent === item.key ? 'active' : ''}`}
                onClick={() => {
                  setCurrentComponent(item.key);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                <div className="active-indicator"></div>
              </button>
            ))}
          </div>

          {/* User Profile Section */}
          <div className="user-section">
            <div className="user-avatar">
              <span>👤</span>
            </div>
            <div className="user-info">
              <span className="user-name">Welcome User</span>
              <span className="user-status">Premium</span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-header">
            <h2>
              {navItems.find(item => item.key === currentComponent)?.label}
            </h2>
            <div className="header-actions">
              <button className="action-btn">
                <span>🔔</span>
              </button>
              <button className="action-btn">
                <span>⚙️</span>
              </button>
            </div>
          </div>

          <div className="content-area">
            {renderComponent()}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default App;
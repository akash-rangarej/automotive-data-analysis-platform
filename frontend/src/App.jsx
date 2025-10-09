import React, { useState } from "react";
import FileUpload from "./components/FileUpload.jsx";
import GetInfo from "./components/GetInfo.jsx";
import Visualize from "./components/Visualize.jsx";
import GetProcessedData from "./components/GetProcessedData.jsx";

function App() {
  const [currentComponent, setCurrentComponent] = useState("upload");

  return (
    <div className="App">
      <nav>
        <button onClick={() => setCurrentComponent("upload")}>
          Upload File
        </button>
        <button onClick={() => setCurrentComponent("info")}>Get Info</button>
        <button onClick={() => setCurrentComponent("visualize")}>
          Visualize
        </button>
        <button onClick={() => setCurrentComponent("processed")}>
          Get Processed Data
        </button>
      </nav>

      {currentComponent === "upload" && <FileUpload />}
      {currentComponent === "info" && <GetInfo />}
      {currentComponent === "visualize" && <Visualize />}
      {currentComponent === "processed" && <GetProcessedData />}
    </div>
  );
}

export default App;

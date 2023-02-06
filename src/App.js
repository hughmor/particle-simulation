import React, { useState } from 'react';
import { toggleBoundaryConditions, timeStep } from './particle.js';
import './App.css';


function App() {
  const [ boundaryType, setBoundaryType ] = useState("RIGID");
  const handleClickBC = () => {
    toggleBoundaryConditions();
    setBoundaryType(boundaryType === "PBC" ? "RIGID" : "PBC");
  }

  const [ timeStep, setSpeed ] = useState(1);
  const handleSpeedDecrement = () => {
    if (timeStep > 1) {
      setSpeed(timeStep - 1);
    }
  };
  const handleSpeedIncrement = () => {
    if (timeStep < 5) {
      setSpeed(timeStep + 1);
    }
  };


  return (
    <div className="App">
      <script src="./particle.js"></script>
      <header>
        <div className="menuDiv">
          <div className="lineSpan menuItemSpan" onClick={handleClickBC}>BC: {boundaryType}</div>
          <div className="lineSpan">
            <span className="menuItemSpan" onClick={handleSpeedDecrement}>&lt;</span>
            <span>  {timeStep}x  </span>
            <span className="menuItemSpan" onClick={handleSpeedIncrement}>&gt;</span>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;

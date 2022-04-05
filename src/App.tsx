import React from 'react';
import './App.css';
import { Game } from './features/game/Game';

function App() {
  function onClick() {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Are you sure you want to reset your progress?")) {
      localStorage.removeItem("persist:auto-bosser");
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    }
  }

  return (
    <div className="App">
      <button onClick={() => onClick()}>Reset</button>
      <Game />
    </div>
  );
}

export default App;

import React from 'react';
import './App.css';
import { Game } from './features/game/Game';

function App() {
  function onClick() {
    localStorage.removeItem("persist:auto-bosser");
    // eslint-disable-next-line no-restricted-globals
    location.reload();
  }

  return (
    <div className="App">
      <button onClick={() => onClick()}>Reset</button>
      <Game />
    </div>
  );
}

export default App;

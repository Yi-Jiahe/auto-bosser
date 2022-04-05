import React from 'react';
import './App.css';
import { Game } from './features/game/Game';
import { useAppDispatch } from './app/hooks';
import { reset as resetProgress } from './features/game/progressSlice'
import { reset as resetExpertise } from './features/game/expertiseSlice'

function App() {
  const dispatch = useAppDispatch();

  function onClick() {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Are you sure you want to reset your progress?")) {
      dispatch(resetProgress());
      dispatch(resetExpertise());
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

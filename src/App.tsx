import React from 'react';
import MasterControl from './components/MasterControl';
import PlayerView from './components/PlayerView';

function App() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role'); // ?role=player
  const tableId = params.get('table') || '1'; // ?table=1

  if (role === 'player') {
    return <PlayerView tableId={tableId} />;
  }

  return <MasterControl tableId={tableId} />;
}

export default App;
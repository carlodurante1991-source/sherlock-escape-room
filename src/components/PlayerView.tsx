import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue, update, push, set, onDisconnect } from "firebase/database";

const PlayerView = ({ tableId = "1" }: { tableId?: string }) => {
  const [tableData, setTableData] = useState<any>(null);
  const [lastHint, setLastHint] = useState("");
  const [teamName, setTeamName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!hasJoined) return;

    const tableRef = ref(db, `sessions/tavolo_${tableId}`);
    
    // Aggiungiamo il giocatore alla lista quando si connette
    const playerRef = push(ref(db, `sessions/tavolo_${tableId}/players`));
    set(playerRef, { name: teamName, joinedAt: Date.now() });

    // Rimuoviamo il giocatore quando chiude la pagina o perde la connessione
    onDisconnect(playerRef).remove();

    const unsubscribe = onValue(tableRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTableData(data);
        if (data.hint && data.hint !== lastHint) {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
          audio.play().catch(e => console.log("Audio play blocked"));
          setLastHint(data.hint);
        }
      }
    });

    return () => unsubscribe();
  }, [tableId, lastHint, hasJoined, teamName]);

  // SCHERMATA INIZIALE: INSERIMENTO NOME
  if (!hasJoined) {
    return (
      <div style={{ backgroundColor: '#09090b', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif', padding: '20px' }}>
        <h1 style={{ color: '#22c55e', marginBottom: '20px' }}>SHERLOCK ESCAPE</h1>
        <p style={{ color: '#a1a1aa', marginBottom: '30px' }}>Inserite il nome della vostra squadra per iniziare</p>
        <input 
          type="text" 
          value={teamName} 
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Esempio: I Detective"
          style={{ width: '100%', maxWidth: '300px', padding: '15px', borderRadius: '10px', border: '1px solid #22c55e', background: '#18181b', color: 'white', fontSize: '18px', marginBottom: '20px', textAlign: 'center' }}
        />
        <button 
          onClick={() => teamName.length > 2 && setHasJoined(true)}
          style={{ width: '100%', maxWidth: '300px', padding: '15px', backgroundColor: '#22c55e', color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px' }}
        >
          ENTRA IN PARTITA
        </button>
      </div>
    );
  }

  if (!tableData) return <div style={{backgroundColor: '#000', height: '100vh'}}></div>;

  return (
    <div style={{ backgroundColor: '#09090b', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#22c55e', padding: '20px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '20px', color: '#666', textTransform: 'uppercase' }}>Squadra: {teamName}</h2>
      
      <div style={{ fontSize: '120px', fontWeight: 'bold', margin: '20px 0', fontFamily: 'monospace' }}>
        {Math.floor(tableData.timer / 60).toString().padStart(2, '0')}:{(tableData.timer % 60).toString().padStart(2, '0')}
      </div>

      <div style={{ background: '#18181b', padding: '30px', borderRadius: '15px', border: '1px solid #22c55e', width: '100%', maxWidth: '600px', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '24px', margin: 0 }}>{tableData.hint || "In attesa di indizi..."}</p>
      </div>
    </div>
  );
};

export default PlayerView;
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue, update, push, set, onDisconnect } from "firebase/database";
import { Skull, Trophy, Clock, MessageSquare } from "lucide-react";

const PlayerView = ({ tableId = "1" }) => {
  const [tableData, setTableData] = useState<any>(null);
  const [teamName, setTeamName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [playerId, setPlayerId] = useState("");

  useEffect(() => {
    if (!hasJoined) return;

    const tableRef = ref(db, `sessions/tavolo_${tableId}`);
    
    // Creazione giocatore e gestione disconnessione
    const playerRef = push(ref(db, `sessions/tavolo_${tableId}/players`));
    setPlayerId(playerRef.key || "");
    set(playerRef, { name: teamName, score: 0, joinedAt: Date.now() });
    onDisconnect(playerRef).remove();

    const unsubscribe = onValue(tableRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setTableData(data);
    });

    return () => unsubscribe();
  }, [tableId, hasJoined, teamName]);

  // SCHERMATA DI LOGIN SQUADRA
  if (!hasJoined) {
    return (
      <div style={{ backgroundColor: '#09090b', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif', padding: '20px' }}>
        <h1 style={{ color: '#22c55e', fontSize: '40px', marginBottom: '10px' }}>SHERLOCK SYSTEM</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Inserire nome unità investigativa</p>
        <input 
          type="text" 
          value={teamName} 
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Nome Squadra..."
          style={{ width: '100%', maxWidth: '350px', padding: '20px', borderRadius: '15px', border: '2px solid #22c55e', background: '#18181b', color: 'white', fontSize: '20px', marginBottom: '20px', textAlign: 'center', outline: 'none' }}
        />
        <button 
          onClick={() => teamName.length > 2 && setHasJoined(true)}
          style={{ width: '100%', maxWidth: '350px', padding: '20px', backgroundColor: '#22c55e', color: 'black', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px' }}
        >
          INIZIA INDAGINE
        </button>
      </div>
    );
  }

  if (!tableData) return <div style={{ background: '#000', height: '100vh' }} />;

  // SCHERMATA BLOCCATA (BANG ROULETTE RUSSA)
  if (tableData.locked) {
    return (
      <div style={{ backgroundColor: '#7f1d1d', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: '20px' }}>
        <Skull size={120} style={{ marginBottom: '20px' }} />
        <h1 style={{ fontSize: '50px', fontWeight: 'bold' }}>SISTEMA BLOCCATO</h1>
        <p style={{ fontSize: '24px' }}>L'unita è stata eliminata. Attendere sblocco dalla regia.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#09090b', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', padding: '30px', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER TABLET */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#22c55e' }}>{teamName.toUpperCase()}</h2>
          <div style={{ color: '#666', fontSize: '14px' }}>Tavolo {tableId}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>{tableData.players?.[playerId]?.score || 0}</div>
          <div style={{ fontSize: '10px', color: '#666' }}>PUNTI TOTALI</div>
        </div>
      </div>

      {/* TIMER CENTRALE */}
      <div style={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '150px', fontWeight: 'bold', fontFamily: 'monospace', color: tableData.status === 'playing' ? '#22c55e' : '#3f3f46', lineHeight: '1' }}>
          {Math.floor(tableData.timer / 60).toString().padStart(2, '0')}:{(tableData.timer % 60).toString().padStart(2, '0')}
        </div>
        <p style={{ color: '#666', letterSpacing: '5px' }}>TEMPO RIMANENTE</p>
      </div>

      {/* MESSAGGIO INDIZIO (SE PRESENTE) */}
      <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', border: '2px solid #22c55e', minHeight: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '40px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <MessageSquare size={14} /> COMUNICAZIONE DALLA CENTRALE:
        </h4>
        <p style={{ fontSize: '28px', margin: 0, color: '#fff', fontWeight: '500' }}>
          {tableData.hint || "In attesa di istruzioni..."}
        </p>
      </div>

      {/* BARRA PROGRESSO ENIGMI */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            style={{ 
              width: '50px', height: '10px', borderRadius: '5px', 
              background: tableData.enigmas?.[i] ? '#22c55e' : '#27272a',
              boxShadow: tableData.enigmas?.[i] ? '0 0 10px #22c55e' : 'none'
            }} 
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerView;
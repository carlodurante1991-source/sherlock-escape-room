import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";

const PlayerView = ({ tableId = "1" }: { tableId?: string }) => {
  const [tableData, setTableData] = useState<any>(null);
  const [lastHint, setLastHint] = useState("");

  useEffect(() => {
    const tableRef = ref(db, `sessions/tavolo_${tableId}`);

    const unsubscribe = onValue(tableRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTableData(data);
        
        // Se arriva un nuovo indizio, facciamo un suono
        if (data.hint && data.hint !== lastHint) {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
          audio.play().catch(e => console.log("Audio play blocked"));
          setLastHint(data.hint);
        }
      }
    });

    return () => unsubscribe();
  }, [tableId, lastHint]);

  if (!tableData) return (
    <div style={{ backgroundColor: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#f59e0b', fontSize: '24px', fontFamily: 'serif' }}>🔍 Collegamento al database di Scotland Yard...</p>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: '#09090b', 
      color: 'white', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      fontFamily: "'Courier New', Courier, monospace", // Stile macchina da scrivere
      backgroundImage: 'radial-gradient(circle, #1a1a1a 0%, #000 100%)'
    }}>
      
      {/* NOME STANZA */}
      <div style={{ position: 'absolute', top: 20, color: '#444', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>
        Operational Unit: Table {tableId}
      </div>

      {/* TIMER GIGANTE */}
      <div style={{ 
        fontSize: '18vw', 
        fontWeight: 'bold', 
        color: tableData.timer < 300 ? '#ef4444' : '#f59e0b', // Diventa rosso sotto i 5 minuti
        textShadow: '0 0 30px rgba(245, 158, 11, 0.3)',
        marginBottom: '20px'
      }}>
        {Math.floor(tableData.timer / 60).toString().padStart(2, '0')}:{(tableData.timer % 60).toString().padStart(2, '0')}
      </div>

      {/* ZONA INDIZI */}
      <div style={{ 
        width: '80%', 
        minHeight: '200px', 
        border: '2px solid #27272a', 
        borderRadius: '20px', 
        padding: '30px',
        backgroundColor: 'rgba(24, 24, 27, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
      }}>
        <h3 style={{ color: '#666', fontSize: '18px', marginBottom: '15px', textTransform: 'uppercase' }}>
          Messaggio da Baker Street:
        </h3>
        <p style={{ 
          fontSize: '32px', 
          color: '#22c55e', 
          margin: 0,
          lineHeight: '1.4',
          textShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
        }}>
          {tableData.hint || "In attesa di istruzioni..."}
        </p>
      </div>

      {/* STATO GIOCO */}
      <div style={{ marginTop: '30px', color: '#333' }}>
        {tableData.status === 'paused' && "--- SESSIONE IN PAUSA ---"}
      </div>
    </div>
  );
};

export default PlayerView;
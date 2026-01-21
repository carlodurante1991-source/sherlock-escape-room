import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";

const PlayerView = () => {
  const [tableData, setTableData] = useState<any>(null);

  useEffect(() => {
    const tableRef = ref(db, "sessions/tavolo_1");
    return onValue(tableRef, (snapshot) => {
      setTableData(snapshot.val());
    });
  }, []);

  if (!tableData) return <div style={{backgroundColor: 'black', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Caricamento missione...</div>;

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif', textAlign: 'center', padding: '20px' }}>
      
      {/* HEADER MISSIONE */}
      <div style={{ position: 'absolute', top: '20px', letterSpacing: '3px', color: '#444' }}>
        PROPERTY OF SCOTLAND YARD - CASE #101
      </div>

      {/* TIMER GIGANTE */}
      <div style={{ fontSize: '20vw', fontWeight: 'bold', color: tableData.status === 'playing' ? '#ef4444' : '#555', textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}>
        {Math.floor(tableData.timer / 60)}:{(tableData.timer % 60).toString().padStart(2, '0')}
      </div>

      {/* AREA INDIZI (Appare solo se il Master scrive qualcosa) */}
      {tableData.hint && (
        <div style={{ marginTop: '30px', padding: '20px', border: '2px solid #f59e0b', borderRadius: '10px', maxWidth: '80%', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
          <h2 style={{ color: '#f59e0b', margin: '0 0 10px 0', fontSize: '1.2rem' }}>NUOVO INDIZIO:</h2>
          <p style={{ fontSize: '1.5rem', fontStyle: 'italic', margin: 0 }}>"{tableData.hint}"</p>
        </div>
      )}

      {/* MESSAGGIO DI ATTESA */}
      {tableData.status === 'waiting' && (
        <div style={{ marginTop: '20px', color: '#f59e0b', fontSize: '1.2rem', animate: 'pulse 2s infinite' }}>
          IN ATTESA DI AUTORIZZAZIONE DAL MASTER...
        </div>
      )}
    </div>
  );
};

export default PlayerView;
import React, { useState, useEffect } from "react";
import { db } from "./firebase"; 
import { ref, onValue, update } from "firebase/database";
import { QRCodeSVG } from 'qrcode.react';

const MasterControl = ({ tableId = "1" }: { tableId?: string }) => {
  const [tableData, setTableData] = useState<any>(null);
  const [hintText, setHintText] = useState("");

  useEffect(() => {
    const tableRef = ref(db, `sessions/tavolo_${tableId}`);
    
    const unsubscribe = onValue(tableRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTableData(data);
      } else {
        update(tableRef, {
          status: 'waiting',
          timer: 3600,
          hint: '',
          playersCount: 0
        });
      }
    });

    const timerInterval = setInterval(() => {
      if (tableData?.status === 'playing' && tableData?.timer > 0) {
        const newTime = tableData.timer - 1;
        update(ref(db, `sessions/tavolo_${tableId}`), { timer: newTime });
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timerInterval);
    };
  }, [tableId, tableData?.status, tableData?.timer]);

  const updateTable = (newData: any) => update(ref(db, `sessions/tavolo_${tableId}`), newData);

  if (!tableData) return <div style={{color: '#22c55e', backgroundColor: '#000', height: '100vh', padding: '20px'}}>Connessione al database...</div>;

  return (
    <div style={{ backgroundColor: '#09090b', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#18181b', borderRadius: '10px', border: '1px solid #27272a', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#22c55e' }}>REGIA: TAVOLO {tableId}</h2>
        <div style={{ color: '#666' }}>ID Sessione: {Math.random().toString(36).substr(2, 5).toUpperCase()}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* CONTROLLI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '15px', border: '1px solid #27272a', textAlign: 'center' }}>
            <div style={{ fontSize: '70px', fontWeight: 'bold', fontFamily: 'monospace', color: tableData.status === 'playing' ? '#22c55e' : '#fff', marginBottom: '20px' }}>
              {Math.floor(tableData.timer / 60).toString().padStart(2, '0')}:{(tableData.timer % 60).toString().padStart(2, '0')}
            </div>
            <button 
              onClick={() => updateTable({ status: tableData.status === 'playing' ? 'paused' : 'playing' })}
              style={{ width: '100%', padding: '20px', backgroundColor: '#22c55e', color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px' }}
            >
              {tableData.status === 'playing' ? 'PAUSA' : 'AVVIA PARTITA'}
            </button>
          </div>

          <div style={{ background: '#18181b', padding: '20px', borderRadius: '15px', border: '1px solid #27272a', textAlign: 'center' }}>
            <div style={{ background: 'white', padding: '10px', borderRadius: '8px', display: 'inline-block' }}>
              <QRCodeSVG value={`https://sherlock-escape-room.vercel.app?role=player&table=${tableId}`} size={150} />
            </div>
            <p style={{ color: '#666', marginTop: '10px' }}>QR PER TABLET GIOCATORI</p>
          </div>
        </div>

        {/* INDIZI E GESTIONE */}
        <div style={{ background: '#18181b', padding: '20px', borderRadius: '15px', border: '1px solid #27272a' }}>
          <h3 style={{ color: '#a1a1aa', marginTop: 0 }}>INVIA INDIZIO AI GIOCATORI</h3>
          <textarea 
            value={hintText}
            onChange={(e) => setHintText(e.target.value)}
            style={{ width: '100%', height: '200px', background: '#000', border: '1px solid #333', borderRadius: '10px', color: '#22c55e', padding: '15px', fontSize: '18px', marginBottom: '15px', outline: 'none' }}
            placeholder="Scrivi qui il messaggio..."
          />
          <button 
            onClick={() => { updateTable({ hint: hintText }); setHintText(""); }}
            style={{ width: '100%', padding: '15px', background: '#22c55e', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            INVIA MESSAGGIO
          </button>
          
          <button 
            onClick={() => updateTable({ status: 'waiting', timer: 3600, hint: '' })}
            style={{ width: '100%', marginTop: '50px', padding: '10px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', cursor: 'pointer' }}
          >
            RESETTA TUTTO
          </button>
        </div>

      </div>
    </div>
  );
};

export default MasterControl;
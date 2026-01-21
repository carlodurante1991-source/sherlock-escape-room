import React, { useState, useEffect } from "react";
import { db } from "./firebase"; 
import { ref, onValue, update } from "firebase/database";
import { Play, Pause, Send, RotateCcw } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

// Aggiungiamo tableId tra le parentesi per ricevere il numero del tavolo
const MasterControl = ({ tableId = "1" }: { tableId?: string }) => {
  const [tableData, setTableData] = useState<any>(null);
  const [hintText, setHintText] = useState("");

  useEffect(() => {
    // Il percorso ora dipende da tableId
    const tableRef = ref(db, `sessions/tavolo_${tableId}`);
    
    const unsubscribe = onValue(tableRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTableData(data);
      } else {
        // Se la stanza non esiste, la creiamo
        update(tableRef, {
          status: 'waiting',
          timer: 3600,
          hint: ''
        });
      }
    });

    const timerInterval = setInterval(() => {
      setTableData((current: any) => {
        if (current && current.status === 'playing' && current.timer > 0) {
          const newTime = current.timer - 1;
          // Aggiorna Firebase ogni secondo
          update(ref(db, `sessions/tavolo_${tableId}`), { timer: newTime });
          return { ...current, timer: newTime };
        }
        return current;
      });
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timerInterval);
    };
  }, [tableId]); // Ricarica se cambia il tavolo

  const updateTable = (newData: any) => {
    update(ref(db, `sessions/tavolo_${tableId}`), newData);
  };

  const addTime = (minutes: number) => {
    if (tableData) {
      updateTable({ timer: tableData.timer + (minutes * 60) });
    }
  };

  const resetGame = () => {
    if (window.confirm(`Sei sicuro di voler resettare il Tavolo ${tableId}?`)) {
      updateTable({
        status: 'waiting',
        timer: 3600,
        hint: ''
      });
    }
  };

  if (!tableData) return (
    <div style={{color: 'white', padding: '40px', backgroundColor: '#09090b', minHeight: '100vh'}}>
      <p>🔍 Connessione al Tavolo {tableId}...</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#09090b', color: 'white', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '1px solid #27272a', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#f59e0b', margin: 0, fontSize: '24px' }}>SHERLOCK MASTER CONTROL</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Stanza Attiva: **Tavolo {tableId}**</p>
        </div>
        <button 
          onClick={resetGame}
          style={{ backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RotateCcw size={16} /> RESET PARTITA
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* COLONNA SINISTRA: TIMER E CONTROLLI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '16px', border: '1px solid #27272a', textAlign: 'center' }}>
            <div style={{ fontSize: '84px', fontWeight: 'bold', fontFamily: 'monospace', color: tableData.status === 'playing' ? '#f59e0b' : '#3f3f46', marginBottom: '20px' }}>
              {Math.floor(tableData.timer / 60).toString().padStart(2, '0')}:{(tableData.timer % 60).toString().padStart(2, '0')}
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => updateTable({ status: tableData.status === 'playing' ? 'paused' : 'playing' })}
                style={{ flex: 2, padding: '18px', fontSize: '18px', cursor: 'pointer', backgroundColor: tableData.status === 'playing' ? '#3f3f46' : '#22c55e', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                {tableData.status === 'playing' ? <Pause size={24}/> : <Play size={24}/>}
                {tableData.status === 'playing' ? 'PAUSA' : 'AVVIA GIOCO'}
              </button>
              <button 
                onClick={() => addTime(5)}
                style={{ flex: 1, padding: '18px', backgroundColor: '#27272a', border: '1px solid #3f3f46', color: 'white', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                +5 MIN
              </button>
            </div>
          </div>

          {/* QR CODE DINAMICO */}
          <div style={{ background: '#18181b', padding: '20px', borderRadius: '16px', border: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>
              {/* Il QR ora include automaticamente l'ID del tavolo corretto */}
              <QRCodeSVG value={`https://sherlock-escape-room.vercel.app?role=player&table=${tableId}`} size={120} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#f59e0b' }}>Tablet Tavolo {tableId}</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>Inquadra per collegare il tablet di questa stanza.</p>
            </div>
          </div>
        </div>

        {/* COLONNA DESTRA: INDIZI */}
        <div style={{ background: '#18181b', padding: '30px', borderRadius: '16px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#a1a1aa', textTransform: 'uppercase' }}>Invia Indizio ai Detective</h3>
          <textarea 
            value={hintText}
            onChange={(e) => setHintText(e.target.value)}
            style={{ width: '100%', flexGrow: 1, background: '#09090b', color: '#22c55e', border: '1px solid #27272a', padding: '20px', borderRadius: '10px', outline: 'none', fontFamily: 'monospace', resize: 'none', fontSize: '18px', marginBottom: '20px' }}
            placeholder="Scrivi qui il messaggio..."
          />
          <button 
            onClick={() => { updateTable({ hint: hintText }); setHintText(""); }}
            style={{ width: '100%', padding: '18px', backgroundColor: '#f59e0b', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '16px' }}
          >
            <Send size={20} /> INVIA SUL TABLET
          </button>
        </div>

      </div>
    </div>
  );
};

export default MasterControl;
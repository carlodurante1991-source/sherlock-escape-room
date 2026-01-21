import React, { useState, useEffect } from "react";
import { db } from "./firebase"; 
import { ref, onValue, update } from "firebase/database";
import { Play, Pause, Send, RotateCcw, Users, Trophy, BookOpen, Plus } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

const MasterControl = ({ tableId = "1" }: { tableId?: string }) => {
  const [tableData, setTableData] = useState<any>(null);
  const [hintText, setHintText] = useState("");

  useEffect(() => {
    const tableRef = ref(db, `sessions/tavolo_${tableId}`);
    const unsubscribe = onValue(tableRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setTableData(data);
    });
    // ... (mantenere la logica del timerInterval che abbiamo scritto prima)
    return () => unsubscribe();
  }, [tableId]);

  const updateTable = (newData: any) => update(ref(db, `sessions/tavolo_${tableId}`), newData);

  if (!tableData) return <div style={{color: 'white', padding: '40px'}}>Caricamento Regia...</div>;

  return (
    <div style={{ backgroundColor: '#09090b', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER STATUS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#18181b', padding: '15px', borderRadius: '10px', border: '1px solid #27272a' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#22c55e' }}>GAME CONTROL - TAVOLO {tableId}</h2>
          <span style={{ fontSize: '12px', color: '#666' }}>Sessione attiva</span>
        </div>
        <button style={{ backgroundColor: '#27272a', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '5px' }}>ESCI</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        
        {/* COLONNA SINISTRA: CONTROLLI GIOCO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* BOX AVVIA PARTITA */}
          <div style={{ background: '#18181b', padding: '20px', borderRadius: '15px', border: '1px solid #27272a', textAlign: 'center' }}>
            <h3 style={{ color: '#22c55e', marginTop: 0 }}>INIZIA PARTITA</h3>
            <p style={{ color: '#a1a1aa', fontSize: '13px' }}>Seleziona la durata e avvia il gioco</p>
            <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0', color: tableData.status === 'playing' ? '#22c55e' : '#fff' }}>
              {Math.floor(tableData.timer / 60)} minuti
            </div>
            <button 
              onClick={() => updateTable({ status: tableData.status === 'playing' ? 'paused' : 'playing' })}
              style={{ width: '100%', padding: '15px', backgroundColor: '#22c55e', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              {tableData.status === 'playing' ? <Pause size={20}/> : <Play size={20}/>}
              {tableData.status === 'playing' ? 'PAUSA' : 'AVVIA GIOCO'}
            </button>
          </div>

          {/* QR E GIOCATORI IN ATTESA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#18181b', padding: '15px', borderRadius: '15px', border: '1px solid #27272a', textAlign: 'center' }}>
               <QRCodeSVG value={`https://sherlock-escape-room.vercel.app?role=player&table=${tableId}`} size={100} style={{ background: 'white', padding: '5px', borderRadius: '5px' }} />
               <p style={{ fontSize: '10px', color: '#666', marginTop: '10px' }}>Scansiona per entrare</p>
            </div>
            <div style={{ background: '#18181b', padding: '15px', borderRadius: '15px', border: '1px solid #27272a', textAlign: 'center' }}>
               <Users color="#22c55e" size={30} style={{ margin: '0 auto' }} />
               <h4 style={{ margin: '10px 0 5px 0' }}>GIOCATORI</h4>
               <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>{tableData.playersCount || 0}</span>
            </div>
          </div>

          {/* GESTIONE STANZE (Nuovo come nel video) */}
          <div style={{ background: '#18181b', padding: '20px', borderRadius: '15px', border: '1px solid #27272a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', color: '#a1a1aa' }}><Monitor size={16} /> GESTIONE STANZE</h3>
              <button style={{ background: '#22c55e', border: 'none', borderRadius: '4px', padding: '2px 8px' }}><Plus size={14}/></button>
            </div>
            <div style={{ background: '#09090b', padding: '10px', borderRadius: '8px', border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between' }}>
              <span>Tavolo {tableId}</span>
              <span style={{ color: '#22c55e' }}>Attivo</span>
            </div>
          </div>
        </div>

        {/* COLONNA DESTRA: PROGRESSO E ENIGMI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* CLASSIFICA E PROGRESSO */}
          <div style={{ background: '#18181b', padding: '20px', borderRadius: '15px', border: '1px solid #27272a' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#a1a1aa' }}><Trophy size={16} /> CLASSIFICA & PROGRESSO</h3>
            <div style={{ textAlign: 'center', padding: '20px', color: '#444' }}>
              <Users size={40} />
              <p>Nessun giocatore connesso</p>
            </div>
          </div>

          {/* RISPOSTE ENIGMI */}
          <div style={{ background: '#18181b', padding: '20px', borderRadius: '15px', border: '1px solid #27272a' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#a1a1aa' }}><BookOpen size={16} /> RISPOSTE ENIGMI (SOLO MASTER)</h3>
            <textarea 
              value={hintText}
              onChange={(e) => setHintText(e.target.value)}
              placeholder="Invia un suggerimento..."
              style={{ width: '100%', height: '100px', background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#22c55e', padding: '10px', marginBottom: '10px' }}
            />
            <button 
              onClick={() => { updateTable({ hint: hintText }); setHintText(""); }}
              style={{ width: '100%', padding: '10px', background: '#22c55e', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              INVIA SUGGERIMENTO
            </button>
          </div>

          <button onClick={() => updateTable({ status: 'waiting', timer: 3600, hint: '' })} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #333', color: '#666', borderRadius: '8px' }}>
            NUOVA SESSIONE
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterControl;
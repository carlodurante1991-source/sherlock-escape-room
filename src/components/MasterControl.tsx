import React, { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { ref, onValue, update } from "firebase/database";
import { Play, Pause, Send, Users, Trophy, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

const MasterControl = ({ tableId = "1" }: { tableId?: string }) => {
  const [tableData, setTableData] = useState<any>(null);
  const [hintText, setHintText] = useState("");

  // Lista enigmi standard (puoi cambiare i nomi qui)
  const enigmaList = ["Lucchetto Baule", "Codice Cassaforte", "Mappa Segreta", "Enigma Finale"];

  useEffect(() => {
    const tableRef = ref(db, `sessions/tavolo_${tableId}`);
    const unsubscribe = onValue(tableRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setTableData(data);
    });

    const timerInterval = setInterval(() => {
      if (tableData?.status === 'playing' && tableData?.timer > 0) {
        update(ref(db, `sessions/tavolo_${tableId}`), { timer: tableData.timer - 1 });
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timerInterval);
    };
  }, [tableId, tableData?.status, tableData?.timer]);

  const updateTable = (newData: any) => update(ref(db, `sessions/tavolo_${tableId}`), newData);

  // Funzione per segnare un enigma come fatto
  const toggleEnigma = (index: number) => {
    const currentEnigmas = tableData.enigmas || {};
    const newState = !currentEnigmas[index];
    update(ref(db, `sessions/tavolo_${tableId}/enigmas`), { [index]: newState });
  };

  if (!tableData) return <div style={{color: '#22c55e', padding: '20px', backgroundColor: '#09090b', minHeight: '100vh'}}>Caricamento Centrale Operativa...</div>;

  // Conta quanti giocatori sono davvero connessi
  const connectedPlayers = tableData.players ? Object.values(tableData.players) : [];

  return (
    <div style={{ backgroundColor: '#09090b', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER PROFESSIONALE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: '#18181b', padding: '15px 25px', borderRadius: '12px', border: '1px solid #27272a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 10px #22c55e' }}></div>
          <h2 style={{ margin: 0, fontSize: '18px', letterSpacing: '1px' }}>REGIA OPERATIVA: TAVOLO {tableId}</h2>
        </div>
        <div style={{ display: 'flex', gap: '20px', color: '#a1a1aa', fontSize: '14px' }}>
          <span><Users size={16} /> {connectedPlayers.length} Squadre Online</span>
          <span><Clock size={16} /> v2.5.1</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px' }}>
        
        {/* SINISTRA: CONTROLLI TIMER E QR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '20px', border: '1px solid #27272a', textAlign: 'center' }}>
            <h3 style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '15px', textTransform: 'uppercase' }}>Countdown Sessione</h3>
            <div style={{ fontSize: '80px', fontWeight: 'bold', fontFamily: 'monospace', color: tableData.status === 'playing' ? '#22c55e' : '#3f3f46', marginBottom: '25px' }}>
              {Math.floor(tableData.timer / 60).toString().padStart(2, '0')}:{(tableData.timer % 60).toString().padStart(2, '0')}
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => updateTable({ status: tableData.status === 'playing' ? 'paused' : 'playing' })}
                style={{ flex: 2, padding: '18px', backgroundColor: '#22c55e', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '18px' }}
              >
                {tableData.status === 'playing' ? <Pause size={24}/> : <Play size={24}/>}
                {tableData.status === 'playing' ? 'PAUSA' : 'AVVIA PARTITA'}
              </button>
              <button onClick={() => updateTable({ timer: tableData.timer + 300 })} style={{ flex: 1, backgroundColor: '#27272a', color: 'white', border: '1px solid #3f3f46', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>+5m</button>
            </div>
          </div>

          <div style={{ background: '#18181b', padding: '20px', borderRadius: '20px', border: '1px solid #27272a' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#a1a1aa' }}><Users size={18} /> SQUADRE IN QUESTA STANZA</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {connectedPlayers.length > 0 ? connectedPlayers.map((p: any, i: number) => (
                <div key={i} style={{ padding: '10px 15px', background: '#09090b', borderRadius: '8px', border: '1px solid #22c55e', color: '#22c55e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>{p.name}</span>
                  <span style={{ fontSize: '10px', background: '#22c55e', color: 'black', padding: '2px 6px', borderRadius: '4px' }}>LIVE</span>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '10px', color: '#444', border: '1px dashed #333', borderRadius: '8px' }}>Nessun detective collegato</div>
              )}
            </div>
          </div>
        </div>

        {/* DESTRA: INDIZI E ENIGMI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div style={{ background: '#18181b', padding: '25px', borderRadius: '20px', border: '1px solid #27272a' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#a1a1aa' }}><BookOpen size={18} color="#22c55e" /> TRASMISSIONE INDIZI</h3>
            <textarea 
              value={hintText}
              onChange={(e) => setHintText(e.target.value)}
              placeholder="Scrivi qui il suggerimento per la squadra..."
              style={{ width: '100%', height: '100px', background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', color: '#22c55e', padding: '15px', fontSize: '16px', marginBottom: '15px', resize: 'none', outline: 'none' }}
            />
            <button 
              onClick={() => { updateTable({ hint: hintText }); setHintText(""); }}
              style={{ width: '100%', padding: '15px', background: '#22c55e', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <Send size={20}/> INVIA AL TABLET
            </button>
          </div>

          <div style={{ background: '#18181b', padding: '25px', borderRadius: '20px', border: '1px solid #27272a', flexGrow: 1 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#a1a1aa' }}><Trophy size={18} color="#22c55e" /> PROGRESSO ENIGMI</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {enigmaList.map((name, index) => (
                <button
                  key={index}
                  onClick={() => toggleEnigma(index)}
                  style={{ 
                    padding: '15px 10px', 
                    borderRadius: '10px', 
                    border: '1px solid', 
                    borderColor: tableData.enigmas?.[index] ? '#22c55e' : '#333',
                    background: tableData.enigmas?.[index] ? 'rgba(34, 197, 94, 0.1)' : '#09090b',
                    color: tableData.enigmas?.[index] ? '#22c55e' : '#666',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: '0.2s'
                  }}
                >
                  <CheckCircle2 size={16} />
                  {name}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => updateTable({ status: 'waiting', timer: 3600, hint: '', enigmas: {} })}
            style={{ padding: '12px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '12px', cursor: 'pointer', fontSize: '12px' }}
          >
            RESET COMPLETO PARTITA
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterControl;
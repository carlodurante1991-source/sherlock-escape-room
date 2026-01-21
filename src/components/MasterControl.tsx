import React, { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { ref, onValue, update, set } from "firebase/database";
import { Play, Pause, Send, Users, Trophy, Skull, QrCode, RotateCcw, ChevronRight } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

const MasterControl = () => {
  const [activeTable, setActiveTable] = useState("1");
  const [sessionData, setSessionData] = useState<any>(null);
  const [hintText, setHintText] = useState("");

  // Lista stanze (puoi espanderla a piacere)
  const tables = ["1", "2", "3", "4"];
  const enigmiPredefiniti = ["Lucchetto Iniziale", "Enigma della Mappa", "Combinazione Cassaforte", "Prova Finale"];

  useEffect(() => {
    const sessionRef = ref(db, `sessions`);
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      setSessionData(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, []);

  const currentTable = sessionData?.[`tavolo_${activeTable}`] || {
    timer: 3600, status: 'waiting', hint: '', enigmas: {}, players: {}, locked: false
  };

  const updateTable = (data: any) => update(ref(db, `sessions/tavolo_${activeTable}`), data);

  // LOGICA ROULETTE RUSSA (BANG)
  const triggerBang = () => {
    updateTable({ locked: true, status: 'paused' });
    // Il sistema si blocca per tutti i giocatori di quel tavolo
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#09090b', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* SIDEBAR SELEZIONE STANZE (Come su Tauri) */}
      <div style={{ width: '280px', background: '#18181b', borderRight: '1px solid #27272a', padding: '20px' }}>
        <h2 style={{ fontSize: '14px', color: '#22c55e', letterSpacing: '2px', marginBottom: '30px' }}>COMMAND CENTER</h2>
        {tables.map(id => (
          <div 
            key={id} 
            onClick={() => setActiveTable(id)}
            style={{ 
              padding: '15px', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer',
              border: '1px solid', borderColor: activeTable === id ? '#22c55e' : '#27272a',
              background: activeTable === id ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}
          >
            <span>TAVOLO {id}</span>
            <ChevronRight size={16} color={activeTable === id ? '#22c55e' : '#444'} />
          </div>
        ))}
      </div>

      {/* DASHBOARD PRINCIPALE */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px' }}>Monitoraggio Tavolo {activeTable}</h1>
            <p style={{ color: '#666' }}>Stato attuale: <span style={{ color: '#22c55e' }}>{currentTable.status.toUpperCase()}</span></p>
          </div>
          
          {/* QR CODE DINAMICO */}
          <div style={{ background: 'white', padding: '10px', borderRadius: '10px' }}>
            <QRCodeSVG value={`https://sherlock-escape-room.vercel.app/?role=player&table=${activeTable}`} size={100} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* COLONNA SINISTRA: TIMER E CONTROLLI CRITICI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ background: '#18181b', padding: '40px', borderRadius: '24px', border: '1px solid #27272a', textAlign: 'center' }}>
              <div style={{ fontSize: '100px', fontWeight: 'bold', fontFamily: 'monospace', color: currentTable.locked ? '#ef4444' : '#22c55e' }}>
                {Math.floor(currentTable.timer / 60)}:{String(currentTable.timer % 60).padStart(2, '0')}
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button onClick={() => updateTable({ status: currentTable.status === 'playing' ? 'paused' : 'playing' })} style={{ flex: 2, padding: '20px', borderRadius: '12px', background: '#22c55e', color: 'black', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                  {currentTable.status === 'playing' ? <Pause /> : <Play />}
                </button>
                <button onClick={triggerBang} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
                  <Skull /> BANG
                </button>
              </div>
            </div>

            {/* CLASSIFICA / GIOCATORI */}
            <div style={{ background: '#18181b', padding: '25px', borderRadius: '24px', border: '1px solid #27272a' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={20} color="#22c55e" /> CLASSIFICA SQUADRE</h3>
              {currentTable.players ? Object.entries(currentTable.players).map(([id, p]: any) => (
                <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#09090b', borderRadius: '12px', marginBottom: '10px', border: '1px solid #27272a' }}>
                  <span style={{ fontWeight: 'bold' }}>{p.name}</span>
                  <span style={{ color: '#22c55e', fontFamily: 'monospace' }}>{p.score || 0} PTS</span>
                </div>
              )) : <p style={{ color: '#444' }}>In attesa di squadre...</p>}
            </div>
          </div>

          {/* COLONNA DESTRA: ENIGMI E INDIZI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ background: '#18181b', padding: '25px', borderRadius: '24px', border: '1px solid #27272a' }}>
              <h3><Trophy size={20} color="#22c55e" /> GESTIONE ENIGMI</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {enigmiPredefiniti.map((nome, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      const newEnigmas = { ...(currentTable.enigmas || {}) };
                      newEnigmas[i] = !newEnigmas[i];
                      updateTable({ enigmas: newEnigmas });
                    }}
                    style={{ 
                      padding: '15px', borderRadius: '12px', border: '1px solid',
                      borderColor: currentTable.enigmas?.[i] ? '#22c55e' : '#333',
                      background: currentTable.enigmas?.[i] ? 'rgba(34, 197, 94, 0.2)' : '#09090b',
                      color: currentTable.enigmas?.[i] ? '#22c55e' : '#666',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                    }}
                  >
                    {nome}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#18181b', padding: '25px', borderRadius: '24px', border: '1px solid #27272a' }}>
              <textarea 
                value={hintText} 
                onChange={(e) => setHintText(e.target.value)}
                placeholder="Digita indizio da inviare..."
                style={{ width: '100%', height: '100px', background: '#000', color: '#22c55e', border: '1px solid #27272a', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}
              />
              <button onClick={() => { updateTable({ hint: hintText }); setHintText(""); }} style={{ width: '100%', padding: '15px', background: '#22c55e', color: 'black', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                INVIA MESSAGGIO
              </button>
            </div>
            
            <button onClick={() => updateTable({ status: 'waiting', timer: 3600, hint: '', enigmas: {}, locked: false })} style={{ background: 'transparent', color: '#444', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
              <RotateCcw size={12} /> RESET TOTALE TAVOLO
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MasterControl;
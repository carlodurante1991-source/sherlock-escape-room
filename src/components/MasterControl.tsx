import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Se non funziona metti "./firebase"
import { ref, onValue, update } from "firebase/database";
import { Play, Pause, Send, Users, Trophy, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

const MasterControl = ({ tableId = "1" }: { tableId?: string }) => {
  const [tableData, setTableData] = useState<any>(null);
  const [hintText, setHintText] = useState("");
  const enigmaList = ["Lucchetto Baule", "Codice Cassaforte", "Mappa Segreta", "Enigma Finale"];

  useEffect(() => {
    const tableRef = ref(db, `sessions/tavolo_${tableId}`);
    const unsubscribe = onValue(tableRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setTableData(data);
    });
    return () => unsubscribe();
  }, [tableId]);

  // Gestione timer separata per stabilità
  useEffect(() => {
    const interval = setInterval(() => {
      if (tableData?.status === 'playing' && tableData?.timer > 0) {
        update(ref(db, `sessions/tavolo_${tableId}`), { timer: tableData.timer - 1 });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [tableData?.status, tableData?.timer, tableId]);

  const updateTable = (newData: any) => update(ref(db, `sessions/tavolo_${tableId}`), newData);

  if (!tableData) return <div style={{color: '#22c55e', padding: '20px', background: '#09090b', height: '100vh'}}>Connessione...</div>;

  const connectedPlayers = tableData.players ? Object.values(tableData.players) : [];

  return (
    <div style={{ backgroundColor: '#09090b', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: '#18181b', padding: '15px', borderRadius: '12px', border: '1px solid #27272a' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#22c55e' }}>REGIA OPERATIVA: TAVOLO {tableId}</h2>
        <div style={{ display: 'flex', gap: '20px', color: '#a1a1aa' }}>
          <span><Users size={16} /> {connectedPlayers.length} Online</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '20px', border: '1px solid #27272a', textAlign: 'center' }}>
            <div style={{ fontSize: '80px', fontWeight: 'bold', color: tableData.status === 'playing' ? '#22c55e' : '#3f3f46' }}>
              {Math.floor(tableData.timer / 60).toString().padStart(2, '0')}:{(tableData.timer % 60).toString().padStart(2, '0')}
            </div>
            <button onClick={() => updateTable({ status: tableData.status === 'playing' ? 'paused' : 'playing' })} style={{ width: '100%', padding: '15px', backgroundColor: '#22c55e', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              {tableData.status === 'playing' ? 'PAUSA' : 'AVVIA PARTITA'}
            </button>
          </div>
          <div style={{ background: '#18181b', padding: '20px', borderRadius: '20px', border: '1px solid #27272a' }}>
            <h3 style={{ color: '#a1a1aa', fontSize: '14px' }}>SQUADRE CONNESSE</h3>
            {connectedPlayers.map((p: any, i: number) => (
              <div key={i} style={{ padding: '10px', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '8px', marginTop: '5px' }}>{p.name}</div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ background: '#18181b', padding: '25px', borderRadius: '20px', border: '1px solid #27272a' }}>
            <h3 style={{ color: '#a1a1aa', fontSize: '14px' }}>INVIA INDIZIO</h3>
            <textarea value={hintText} onChange={(e) => setHintText(e.target.value)} style={{ width: '100%', height: '100px', background: '#000', color: '#22c55e', border: '1px solid #27272a', padding: '10px' }} />
            <button onClick={() => { updateTable({ hint: hintText }); setHintText(""); }} style={{ width: '100%', padding: '10px', background: '#22c55e', color: 'black', marginTop: '10px', borderRadius: '8px' }}>INVIA</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterControl;
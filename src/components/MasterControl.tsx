import React, { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { ref, onValue, update } from "firebase/database";
import { Play, Pause, Send, Users, Trophy, BookOpen } from "lucide-react";

const MasterControl = ({ tableId = "1" }) => {
  const [tableData, setTableData] = useState<any>(null);
  const [hintText, setHintText] = useState("");

  useEffect(() => {
    const tableRef = ref(db, `sessions/tavolo_${tableId}`);
    const unsubscribe = onValue(tableRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setTableData(data);
    });
    return () => unsubscribe();
  }, [tableId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (tableData?.status === 'playing' && tableData?.timer > 0) {
        update(ref(db, `sessions/tavolo_${tableId}`), { timer: tableData.timer - 1 });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [tableData?.status, tableData?.timer, tableId]);

  if (!tableData) return <div style={{color: '#22c55e', padding: '20px', background: '#09090b', height: '100vh'}}>CONNESSA...</div>;

  return (
    <div style={{ backgroundColor: '#09090b', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ border: '1px solid #27272a', padding: '15px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#22c55e', margin: 0 }}>REGIA TAVOLO {tableId}</h2>
        <div style={{ color: '#a1a1aa' }}><Users size={16} /> {tableData.players ? Object.keys(tableData.players).length : 0} SQUADRE</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#18181b', padding: '20px', borderRadius: '15px', border: '1px solid #27272a', textAlign: 'center' }}>
          <div style={{ fontSize: '60px', fontWeight: 'bold', marginBottom: '20px', color: tableData.status === 'playing' ? '#22c55e' : 'white' }}>
            {Math.floor(tableData.timer / 60)}:{String(tableData.timer % 60).padStart(2, '0')}
          </div>
          <button onClick={() => update(ref(db, `sessions/tavolo_${tableId}`), { status: tableData.status === 'playing' ? 'paused' : 'playing' })} style={{ width: '100%', padding: '15px', background: '#22c55e', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {tableData.status === 'playing' ? 'PAUSA' : 'AVVIA PARTITA'}
          </button>
        </div>

        <div style={{ background: '#18181b', padding: '20px', borderRadius: '15px', border: '1px solid #27272a' }}>
          <h3 style={{ color: '#a1a1aa', marginTop: 0 }}>SQUADRE ONLINE</h3>
          {tableData.players && Object.values(tableData.players).map((p: any, i) => (
            <div key={i} style={{ padding: '8px', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '5px', marginTop: '5px' }}>{p.name}</div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', background: '#18181b', padding: '20px', borderRadius: '15px', border: '1px solid #27272a' }}>
        <textarea value={hintText} onChange={(e) => setHintText(e.target.value)} placeholder="Invia indizio..." style={{ width: '100%', height: '80px', background: '#000', color: '#22c55e', border: '1px solid #333', padding: '10px', borderRadius: '8px' }} />
        <button onClick={() => { update(ref(db, `sessions/tavolo_${tableId}`), { hint: hintText }); setHintText(""); }} style={{ width: '100%', padding: '10px', background: '#22c55e', color: 'black', border: 'none', marginTop: '10px', borderRadius: '8px', fontWeight: 'bold' }}>INVIA INDIZIO</button>
      </div>
    </div>
  );
};

export default MasterControl;
import { useState } from "react";
import MasterControl from "./components/MasterControl";
import PlayerView from "./components/PlayerView";

function App() {
  const params = new URLSearchParams(window.location.search);
  const isPlayer = params.get("role") === "player";
  
  // Se l'URL ha già un tavolo (es. dal QR code), lo usiamo, altrimenti lo stato è null
  const [selectedTable, setSelectedTable] = useState<string | null>(params.get("table"));

  // --- VISTA GIOCATORE (Smartphone/Tablet) ---
  if (isPlayer) {
    const tableId = params.get("table") || "1";
    return <PlayerView tableId={tableId} />;
  }

  // --- VISTA REGIA (PC Master) ---
  if (!selectedTable) {
    return (
      <div style={{ backgroundColor: '#09090b', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#f59e0b', marginBottom: '30px', letterSpacing: '2px' }}>SHERLOCK REGIA CENTRALE</h1>
        <div style={{ display: 'grid', gap: '20px', width: '350px' }}>
          {["1", "2", "3"].map((num) => (
            <button 
              key={num}
              onClick={() => setSelectedTable(num)}
              style={{ padding: '25px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#18181b', color: 'white', border: '1px solid #f59e0b', borderRadius: '12px', transition: '0.3s' }}
            >
              GESTISCI TAVOLO {num}
            </button>
          ))}
        </div>
        <p style={{ marginTop: '40px', color: '#444' }}>Seleziona la stanza da monitorare</p>
      </div>
    );
  }

  // --- PANNELLO DI CONTROLLO DEL TAVOLO SCELTO ---
  return (
    <div style={{ position: 'relative' }}>
       <button 
        onClick={() => setSelectedTable(null)}
        style={{ position: 'absolute', top: 15, right: 15, padding: '10px 20px', background: '#27272a', color: '#a1a1aa', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', zIndex: 1000, fontWeight: 'bold' }}
      >
        ← TORNA ALLA REGIA
      </button>
      <MasterControl tableId={selectedTable} />
    </div>
  );
}

export default App;
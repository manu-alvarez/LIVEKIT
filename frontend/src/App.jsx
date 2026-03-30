import { useState, useEffect, useCallback } from 'react';
import {
    LiveKitRoom,
    VoiceAssistantControlBar,
    RoomAudioRenderer,
    useVoiceAssistant,
    useRoomContext,
} from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import '@livekit/components-styles';
import './index.css';

// Premium Components
import LuxMenu from './components/LuxMenu';
import SidebarGlass from './components/SidebarGlass';

// ---------------------------------------------------------------------------
// Room Interaction Logic
// ---------------------------------------------------------------------------

const MetadataSync = ({ setMood, setShowMenu }) => {
    const room = useRoomContext();
    
    useEffect(() => {
        if (!room) return;
        const handleData = (payload, participant, kind, topic) => {
            if (topic === 'lk-metadata') {
                try {
                    const data = JSON.parse(new TextDecoder().decode(payload));
                    if (data.mood) setMood(data.mood);
                    if (data.show_menu) setShowMenu(true);
                    if (data.action === 'show_menu') setShowMenu(true);
                } catch (e) {
                    console.error("Metadata error:", e);
                }
            }
        };
        room.on(RoomEvent.DataReceived, handleData);
        return () => room.off(RoomEvent.DataReceived, handleData);
    }, [room, setMood, setShowMenu]);

    return null;
};

// Static version for when no Room context exists
const StaticOrb = () => (
    <div className="orb-portal">
        <div className="orb-ring-outer" style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }} />
        <div className="orb-core" style={{ background: 'radial-gradient(circle at 35% 35%, #555 0%, #111 60%, transparent 90%)', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }} />
        <div className="status-badge" style={{ bottom: '-60px' }}>
            <span className="dot" style={{ background: '#444' }} />
            OFFLINE
        </div>
    </div>
);

// Live version for when Room context is available (Neuralrealistic Upgrade v4.0)
const LuxuryOrbPortal = ({ mood = 'calm' }) => {
    const { state } = useVoiceAssistant();
    const isActive = state !== 'inactive';
    
    return (
        <div className="orb-portal">
            <div className="orb-ring-outer" />
            <div className={`orb-core ${isActive ? 'active' : ''} ${mood}`} />
            <div className="status-badge" style={{ bottom: '-60px' }}>
                <span className={`dot ${isActive ? 'pulse' : ''}`} />
                {state.toUpperCase()}
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Root App Component
// ---------------------------------------------------------------------------
export default function App() {
    const [token, setToken] = useState("");
    const [connecting, setConnecting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [mood, setMood] = useState('calm');
    const [messages, setMessages] = useState([]);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const serverUrl = import.meta.env.VITE_LIVEKIT_URL;

    const handleConnect = useCallback(async () => {
        if (token) {
            setToken("");
            setMessages([]);
            setMood('calm');
            return;
        }

        setConnecting(true);
        try {
            const response = await fetch(`/api/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participant_identity: `Usuario_${Math.floor(Math.random() * 1000)}`,
                    room_name: "msb-restaurante"
                })
            });

            const data = await response.json();
            if (data.accessToken) {
                setToken(data.accessToken);
            }
        } catch (e) {
            console.error("Connection failed", e);
            alert("Error al conectar con el servidor MSB.");
        } finally {
            setConnecting(false);
        }
    }, [token]);

    return (
        <div className="app-container">
            <main className="main-stage">
                <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontFamily: 'Playfair Display', fontSize: '4.5rem', color: 'var(--gold-primary)', letterSpacing: '4px' }}>RESTAURANTE MSB</h1>
                    <p style={{ fontFamily: 'Inter', color: 'var(--text-muted)', letterSpacing: '8px', fontSize: '0.9rem', opacity: 0.6 }}>MALASOMBRABROSS LUXURY</p>
                </header>

                {!token ? (
                    <div style={{ 
                        flex: 1,
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        animation: 'fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        width: '100%'
                    }}>
                        <StaticOrb />
                        <div style={{ marginTop: '5rem', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.2rem', color: 'var(--gold-bright)', marginBottom: '1.5rem', letterSpacing: '4px', textTransform: 'uppercase' }}>NIKOLINA IS WAITING...</h2>
                            <button className="btn-luxury" onClick={handleConnect} disabled={connecting}>
                                {connecting ? 'INICIANDO PROTOCOLO...' : 'ESTABLECER CONEXIÓN'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <LiveKitRoom
                        serverUrl={serverUrl}
                        token={token}
                        connect={true}
                        audio={true}
                        style={{ display: 'contents' }}
                    >
                        <MetadataSync setMood={setMood} setShowMenu={setShowMenu} />
                        
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <LuxuryOrbPortal mood={mood} />

                            <div style={{ display: 'flex', gap: '2rem', margin: '8rem 0 4rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                                <button className="btn-luxury" style={{ background: 'transparent', border: '1px solid var(--gold-primary)', color: 'var(--gold-primary)', minWidth: '220px' }} onClick={() => setShowMenu(true)}>
                                    VER MENÚ
                                </button>
                                <button className="btn-luxury" style={{ padding: '0.8rem 1.5rem', fontSize: '0.8rem', background: 'var(--accent-rose)', boxShadow: 'none', minWidth: '220px' }} onClick={handleConnect}>
                                    DESCONECTAR
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <VoiceAssistantControlBar controls={{ leave: false }} />
                                <button 
                                    className={`btn-toggle-sidebar ${sidebarVisible ? 'active' : ''}`}
                                    onClick={() => setSidebarVisible(!sidebarVisible)}
                                    title="Historial de Transcripción"
                                >
                                    {sidebarVisible ? 'OCULTAR HISTORIAL' : 'VER HISTORIAL MSB'}
                                </button>
                            </div>
                        </div>

                        {showMenu && <LuxMenu onClose={() => setShowMenu(false)} />}
                        
                        <RoomAudioRenderer />
                        <SidebarGlass 
                            messages={messages} 
                            setMessages={setMessages} 
                            visible={sidebarVisible} 
                            onClose={() => setSidebarVisible(false)} 
                        />
                    </LiveKitRoom>
                )}
            </main>

            <footer style={{ position: 'fixed', bottom: '2rem', left: '2rem', opacity: 0.3 }}>
                <p style={{ fontSize: '0.65rem', letterSpacing: '4px' }}>POWERED BY MSB AI NETWORKS</p>
            </footer>
        </div>
    );
}

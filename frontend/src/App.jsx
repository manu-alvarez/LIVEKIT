import { useState } from 'react';
import {
    LiveKitRoom,
    VoiceAssistantControlBar,
    RoomAudioRenderer,
    useVoiceAssistant,
    useLocalParticipant,
    useRoomContext,
    VideoTrack,
    useParticipants,
    useRemoteParticipants
} from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import '@livekit/components-styles';
import './index.css';

// State mapping for Spanish labels and CSS classes
const STATE_CONFIG = {
    listening: { label: 'ESCUCHANDO', cssClass: 'orb-listening', statusClass: 'status-listening' },
    speaking: { label: 'HABLANDO', cssClass: 'orb-speaking', statusClass: 'status-speaking' },
    thinking: { label: 'PENSANDO', cssClass: 'orb-thinking', statusClass: 'status-thinking' },
    initializing: { label: 'INICIANDO', cssClass: 'orb-inactive', statusClass: 'status-initializing' },
    connecting: { label: 'CONECTANDO', cssClass: 'orb-inactive', statusClass: 'status-initializing' },
};

// Premium Orb Visualizer Component
const OrbVisualizer = () => {
    const { state } = useVoiceAssistant();
    const config = STATE_CONFIG[state] || { label: 'INACTIVO', cssClass: 'orb-inactive', statusClass: 'status-inactive' };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '32px',
            animation: 'fadeInUp 0.8s ease-out',
        }}>
            {/* Orb */}
            <div className={`orb-container ${config.cssClass}`}>
                <div className="orb" />
                <div className="orb-ring orb-ring-1" />
                <div className="orb-ring orb-ring-2" />
            </div>

            {/* Status Badge */}
            <div className={`status-badge ${config.statusClass}`}>
                <span className="dot" />
                {config.label}
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Chat & Transcription Visualizer
// ---------------------------------------------------------------------------
const ChatLog = () => {
    const room = useRoomContext();
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!room) return;
        
        // Listen to native DataChannels (from agent.py)
        const handleData = (payload, participant, kind, topic) => {
            if (topic === 'chat' || topic === 'lk-chat') {
                const text = new TextDecoder().decode(payload);
                try {
                    const data = JSON.parse(text);
                    setMessages(prev => [...prev, { id: data.id || Date.now(), text: data.message, isUser: false, name: 'Nikolina' }]);
                } catch (e) {
                    setMessages(prev => [...prev, { id: Date.now(), text: text, isUser: false, name: 'Nikolina' }]);
                }
            }
        };

        // Listen to STT Transcriptions
        const handleTranscription = (segments, participant) => {
            const text = segments.map(s => s.text).join(' ');
            if (text.trim().length === 0) return;
            
            const isUser = participant?.identity !== 'msb-assistant';
            const name = isUser ? 'Tú' : 'Nikolina';
            
            setMessages(prev => {
                const newMsgs = [...prev];
                const last = newMsgs[newMsgs.length - 1];
                if (last && last.isUser === isUser && (Date.now() - last.timestamp < 3000)) {
                    last.text = text; // Update in place if still speaking
                    return newMsgs;
                }
                return [...prev, { id: Date.now(), text, isUser, name, timestamp: Date.now() }];
            });
        };

        room.on(RoomEvent.DataReceived, handleData);
        room.on(RoomEvent.TranscriptionReceived, handleTranscription);

        return () => {
             room.off(RoomEvent.DataReceived, handleData);
             room.off(RoomEvent.TranscriptionReceived, handleTranscription);
        };
    }, [room]);

    return (
        <div style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '16px',
            padding: '16px',
            marginTop: '24px',
            maxHeight: '300px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            {messages.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>
                    Las transcripciones y mensajes aparecerán aquí...
                </p>
            )}
            {messages.map(msg => (
                <div key={msg.id} style={{
                    alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.isUser ? 'var(--primary-dark)' : 'rgba(255,255,255,0.1)',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    borderBottomRightRadius: msg.isUser ? '4px' : '16px',
                    borderBottomLeftRadius: msg.isUser ? '16px' : '4px',
                    maxWidth: '85%'
                }}>
                    <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        {msg.name}
                    </strong>
                    <span style={{ fontSize: '0.95rem' }}>{msg.text}</span>
                </div>
            ))}
        </div>
    );
};

// ---------------------------------------------------------------------------
// Camera Controls
// ---------------------------------------------------------------------------
const CameraControls = () => {
    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const assistant = remoteParticipants.find(p => p.identity === 'msb-assistant');
    const [cameraEnabled, setCameraEnabled] = useState(false);

    const toggleCamera = async () => {
        if (!localParticipant) return;
        try {
            await localParticipant.setCameraEnabled(!cameraEnabled);
            setCameraEnabled(!cameraEnabled);
        } catch (e) {
            console.error("No se pudo acceder a la cámara:", e);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
            
            {/* Show local camera if enabled */}
            {cameraEnabled && localParticipant.videoTrackPublications.size > 0 && (
                <div style={{ width: '200px', height: '150px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--primary-main)' }}>
                    {Array.from(localParticipant.videoTrackPublications.values()).map(pub => {
                        if (pub.track) {
                            return <VideoTrack key={pub.trackSid} trackRef={{ participant: localParticipant, source: 'camera', publication: pub }} />;
                        }
                        return null;
                    })}
                </div>
            )}

            <button
                onClick={toggleCamera}
                style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: cameraEnabled ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0,0,0,0.5)',
                    color: cameraEnabled ? '#ef4444' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {cameraEnabled ? '🎥 Apagar Cámara (Visión)' : '📷 Activar Cámara (Visión)'}
            </button>
        </div>
    );
};

export default function App() {
    const [token, setToken] = useState("");
    const [roomName] = useState("voice-assistant-room");
    const [connecting, setConnecting] = useState(false);

    const serverUrl = import.meta.env.VITE_LIVEKIT_URL;

    const handleConnect = async () => {
        if (token) {
            setToken(""); // Disconnect
            return;
        }

        setConnecting(true);
        try {
            const response = await fetch(`/api/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participant_identity: `Invitado_${Math.floor(Math.random() * 1000)}`,
                    room_name: roomName
                })
            });

            const data = await response.json();
            if (data.accessToken) {
                setToken(data.accessToken);
            } else {
                throw new Error(data.detail || "Error desconocido");
            }
        } catch (e) {
            console.error("Error al obtener token", e);
            alert("No se pudo conectar al servidor. Verifica que el backend esté activo.");
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '40px 24px',
            position: 'relative',
            zIndex: 1,
        }}>
            {/* Header */}
            <div style={{
                textAlign: 'center',
                marginBottom: token ? '24px' : '48px',
                animation: 'fadeInUp 0.6s ease-out',
            }}>
                <h1 style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    marginBottom: '8px',
                    lineHeight: 1.1,
                }} className="gradient-text">
                    Restaurante MSB
                </h1>
                <p style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                    fontStyle: 'italic',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.5px',
                    marginBottom: '6px',
                }}>
                    MalaSombraBross Restaurant
                </p>
                <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-dim)',
                    letterSpacing: '1px',
                }}>
                    La mejor cocina Mediterránea te espera
                </p>
            </div>

            {!token ? (
                /* Landing State — Call to Action */
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '40px',
                    animation: 'fadeInUp 0.8s ease-out 0.2s both',
                }}>
                    {/* Idle Orb */}
                    <div className="orb-container orb-inactive">
                        <div className="orb" />
                        <div className="orb-ring orb-ring-1" />
                        <div className="orb-ring orb-ring-2" />
                    </div>

                    {/* Hero Text */}
                    <div style={{ textAlign: 'center', maxWidth: '360px' }}>
                        <h2 style={{
                            fontSize: '1.3rem',
                            fontWeight: 600,
                            marginBottom: '8px',
                            color: 'var(--text-primary)',
                        }}>
                            Nikolina
                        </h2>
                        <p style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.6,
                        }}>
                            Tu asistente virtual de reservas.<br />
                            Conecta y habla para gestionar tu mesa.
                        </p>
                    </div>

                    {/* Connect Button */}
                    <button
                        className="btn-premium"
                        onClick={handleConnect}
                        disabled={connecting}
                        style={{ opacity: connecting ? 0.7 : 1 }}
                    >
                        {connecting ? '⏳ Conectando...' : '📞  Llamar y Reservar'}
                    </button>
                </div>
            ) : (
                /* Connected State — Voice Session */
                <LiveKitRoom
                    serverUrl={serverUrl}
                    token={token}
                    connect={true}
                    audio={true}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '24px',
                        width: '100%',
                        maxWidth: '480px',
                    }}
                >
                    <OrbVisualizer />

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        animation: 'fadeInUp 1s ease-out 0.4s both',
                    }}>
                        <VoiceAssistantControlBar controls={{ leave: false }} />
                        <button className="btn-disconnect" onClick={handleConnect}>
                            Desconectar
                        </button>
                    </div>

                    <CameraControls />
                    <ChatLog />
                    
                    <RoomAudioRenderer />
                </LiveKitRoom>
            )}

            {/* Footer */}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                left: 0,
                right: 0,
                textAlign: 'center',
                animation: 'fadeInUp 1s ease-out 0.6s both',
            }}>
                <p style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-dim)',
                    letterSpacing: '1px',
                }}>
                    POWERED BY AI · MSB SOLUTIONS
                </p>
            </div>
        </div>
    );
}

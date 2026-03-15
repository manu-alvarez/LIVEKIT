import { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip,
} from '@mui/material';
import {
    PhoneInTalk as CallsIcon,
    Timer as TimerIcon,
    PhoneDisabled as EmptyIcon,
} from '@mui/icons-material';
import { getCalls } from '../api';

const resultConfig: Record<string, { label: string; color: string; bg: string }> = {
    reservation_created: { label: 'Reserva Creada', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    reservation_cancelled: { label: 'Reserva Cancelada', color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
    info_request: { label: 'Info', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    no_action: { label: 'Sin Acción', color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
    unknown: { label: 'Desconocido', color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
};

export default function Calls() {
    const [calls, setCalls] = useState<any[]>([]);

    useEffect(() => {
        getCalls(100).then((res) => setCalls(res.data)).catch(console.error);
    }, []);

    const formatDuration = (seconds: number) => {
        if (!seconds) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <Box sx={{ animation: 'fadeInUp 0.4s ease-out' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                <Box sx={{
                    width: 42, height: 42, borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(244,63,94,0.15) 100%)',
                    border: '1px solid rgba(124,58,237,0.2)',
                }}>
                    <CallsIcon sx={{ color: '#a78bfa', fontSize: 22 }} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>Llamadas IA</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Historial de conversaciones con Nikolina
                    </Typography>
                </Box>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} sx={{
                borderRadius: '20px',
                animation: 'fadeInUp 0.5s ease-out 0.1s both',
            }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha / Hora</TableCell>
                            <TableCell>Sala</TableCell>
                            <TableCell>Duración</TableCell>
                            <TableCell>Resultado</TableCell>
                            <TableCell>Resumen</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {calls.map((c, idx) => {
                            const res = resultConfig[c.result] || resultConfig.unknown;
                            return (
                                <TableRow key={c.id} sx={{
                                    animation: `fadeInUp 0.3s ease-out ${idx * 40}ms both`,
                                }}>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                            {new Date(c.started_at).toLocaleDateString('es-ES')}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {new Date(c.started_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                        {c.room_name || c.caller_id || '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <TimerIcon sx={{ fontSize: 14, color: '#64748b' }} />
                                            <Typography sx={{
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                fontFamily: '"JetBrains Mono", monospace',
                                                color: c.duration_seconds > 60 ? '#f59e0b' : '#94a3b8',
                                            }}>
                                                {formatDuration(c.duration_seconds)}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={res.label}
                                            size="small"
                                            sx={{
                                                bgcolor: res.bg,
                                                color: res.color,
                                                border: `1px solid ${res.color}30`,
                                                fontWeight: 600,
                                                fontSize: '0.7rem',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{
                                            color: '#94a3b8',
                                            fontSize: '0.8rem',
                                            maxWidth: 300,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {c.summary || c.transcription || '—'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {calls.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Box py={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                        <EmptyIcon sx={{ fontSize: 48, color: '#334155' }} />
                                        <Typography sx={{ color: '#64748b' }}>No hay llamadas registradas</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

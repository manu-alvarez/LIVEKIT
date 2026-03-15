import { createTheme } from '@mui/material/styles';

// Premium MSB Restaurant Dashboard Theme
export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#7c3aed',
            light: '#a78bfa',
            dark: '#5b21b6',
        },
        secondary: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
        },
        success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
        },
        error: {
            main: '#f43f5e',
            light: '#fb7185',
            dark: '#e11d48',
        },
        info: {
            main: '#06b6d4',
            light: '#22d3ee',
            dark: '#0891b2',
        },
        background: {
            default: '#06060a',
            paper: '#0d0d14',
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
        },
        divider: 'rgba(255, 255, 255, 0.06)',
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
        h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.01em' },
        h3: { fontSize: '1.75rem', fontWeight: 600 },
        h4: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' },
        h5: { fontSize: '1.25rem', fontWeight: 600 },
        h6: { fontSize: '1rem', fontWeight: 600 },
        overline: { letterSpacing: '0.1em', fontWeight: 600, fontSize: '0.7rem' },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
                
                body {
                    background: #06060a;
                    background-image:
                        radial-gradient(ellipse at 15% 0%, rgba(124, 58, 237, 0.06) 0%, transparent 50%),
                        radial-gradient(ellipse at 85% 100%, rgba(59, 130, 246, 0.04) 0%, transparent 50%);
                }
                
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `,
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 20,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 12,
                    fontWeight: 600,
                    padding: '10px 24px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                contained: {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
                    '&:hover': {
                        boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)',
                        transform: 'translateY(-1px)',
                    },
                },
                outlined: {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                        borderColor: 'rgba(124, 58, 237, 0.5)',
                        backgroundColor: 'rgba(124, 58, 237, 0.08)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: 'rgba(10, 10, 18, 0.85)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(6, 6, 10, 0.7)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    boxShadow: 'none',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(124, 58, 237, 0.04) !important',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    fontSize: '0.75rem',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(124, 58, 237, 0.4)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7c3aed',
                            boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)',
                        },
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#0d0d14',
                    backgroundImage: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 20,
                    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
                },
            },
        },
    },
});

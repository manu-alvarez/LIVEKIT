import { createTheme } from '@mui/material/styles'

// Premium Dev Dashboard Theme — Unified with MSB Design System
export const darkNeonTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#7c3aed',
            light: '#a78bfa',
            dark: '#5b21b6',
        },
        secondary: {
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
        error: { main: '#f43f5e' },
        warning: { main: '#f59e0b' },
        success: { main: '#10b981' },
        info: { main: '#3b82f6' },
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        h1: { fontWeight: 700, letterSpacing: '-0.02em' },
        h2: { fontWeight: 700, letterSpacing: '-0.01em' },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        overline: { letterSpacing: '0.1em', fontWeight: 600, fontSize: '0.7rem' },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
                body {
                    background: #06060a;
                    background-image:
                        radial-gradient(ellipse at 15% 0%, rgba(124, 58, 237, 0.06) 0%, transparent 50%),
                        radial-gradient(ellipse at 85% 100%, rgba(6, 182, 212, 0.04) 0%, transparent 50%);
                }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
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
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: { textTransform: 'none', fontWeight: 600 },
                contained: {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
                    '&:hover': {
                        boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)',
                        transform: 'translateY(-1px)',
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
                    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(6, 6, 10, 0.7)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    boxShadow: 'none',
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    '&.Mui-checked': { color: '#7c3aed' },
                    '&.Mui-checked + .MuiSwitch-track': { backgroundColor: '#7c3aed' },
                },
            },
        },
        MuiSlider: {
            styleOverrides: {
                thumb: { '&:hover': { boxShadow: '0 0 0 8px rgba(124, 58, 237, 0.16)' } },
                track: { opacity: 0.7 },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7c3aed',
                            boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)',
                        },
                    },
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    backgroundColor: 'rgba(18, 18, 30, 0.97)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(124, 58, 237, 0.2)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
                },
                list: {
                    padding: '4px',
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '2px 4px',
                    '&:hover': {
                        backgroundColor: 'rgba(124, 58, 237, 0.15)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(124, 58, 237, 0.25)',
                        '&:hover': {
                            backgroundColor: 'rgba(124, 58, 237, 0.3)',
                        },
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                icon: { color: '#94a3b8' },
            },
        },
        MuiPopover: {
            styleOverrides: {
                paper: {
                    backgroundColor: 'rgba(18, 18, 30, 0.97)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(124, 58, 237, 0.2)',
                },
            },
        },
    },
})

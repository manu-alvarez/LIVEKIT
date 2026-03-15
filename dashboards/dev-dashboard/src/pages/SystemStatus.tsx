import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material'
import { devApi } from '../api'
import {
  Circle as CircleIcon,
  Refresh as RefreshIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'

interface SystemMetric {
  label: string
  value: number
  unit: string
  max: number
  color: 'primary' | 'secondary' | 'warning' | 'error' | 'success'
}

interface LogEntry {
  timestamp: string
  level: 'INFO' | 'WARNING' | 'ERROR'
  message: string
}

const mockMetrics: SystemMetric[] = [
  { label: 'CPU Usage', value: 45, unit: '%', max: 100, color: 'primary' },
  { label: 'Memory Usage', value: 2.4, unit: 'GB', max: 8, color: 'secondary' },
  { label: 'Active Sessions', value: 12, unit: '', max: 50, color: 'success' },
  { label: 'API Latency', value: 120, unit: 'ms', max: 500, color: 'warning' },
]

const mockLogs: LogEntry[] = []

export default function SystemStatus() {
  const [metrics, setMetrics] = useState<SystemMetric[]>(mockMetrics)
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs)
  const [agentStatus, setAgentStatus] = useState<string>('ready')
  const [dailySessions, setDailySessions] = useState<number>(0)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  const fetchStatus = async () => {
    setIsLoading(true)
    try {
      const statusRes = await devApi.getStatus()
      if (statusRes.data) {
        setAgentStatus(statusRes.data.status || 'ready')
        setDailySessions(statusRes.data.sessions_today || 0)
      }

      const logsRes = await devApi.getLogs()
      if (logsRes.data) {
        setLogs(logsRes.data)
      }
      // Use real metrics from API if available
      if (statusRes.data && statusRes.data.metrics) {
        const m = statusRes.data.metrics;
        setMetrics([
          { label: 'CPU Usage', value: m.cpu, unit: '%', max: 100, color: m.cpu > 80 ? 'error' : m.cpu > 60 ? 'warning' : 'primary' },
          { label: 'Memory Usage', value: m.memory.used, unit: 'GB', max: m.memory.total || 8, color: (m.memory.used / m.memory.total) > 0.8 ? 'error' : 'secondary' },
          { label: 'Active Sessions', value: m.active_sessions, unit: '', max: 50, color: 'success' },
          { label: 'API Latency', value: m.latency, unit: 'ms', max: 500, color: m.latency > 200 ? 'warning' : 'success' },
        ]);
      }
    } catch {
      console.log('Error fetching system status')
    }

    setLastUpdate(new Date())
    setTimeout(() => setIsLoading(false), 500)
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'error':
        return 'error'
      case 'inactive':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getLogIcon = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return <ErrorIcon fontSize="small" color="error" />
      case 'WARNING':
      case 'WARN':
        return <WarningIcon fontSize="small" color="warning" />
      default:
        return <CheckCircleIcon fontSize="small" color="success" />
    }
  }

  const getProgressValue = (metric: SystemMetric) => {
    return (metric.value / metric.max) * 100
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            System Status
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor agent health and system metrics
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchStatus} disabled={isLoading}>
            <RefreshIcon sx={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: '100%',
              border: '1px solid',
              borderColor: `${getStatusColor(agentStatus)}.main`,
              boxShadow: `0 0 20px rgba(${agentStatus === 'active' ? '0, 255, 136' : agentStatus === 'inactive' ? '255, 165, 0' : '255, 71, 87'}, 0.2)`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Agent Status
                </Typography>
                <CircleIcon
                  fontSize="small"
                  sx={{
                    color: `${getStatusColor(agentStatus)}.main`,
                    animation: agentStatus === 'active' ? 'pulse 2s infinite' : 'none',
                  }}
                />
              </Box>

              <Chip
                label={agentStatus.toUpperCase()}
                color={getStatusColor(agentStatus)}
                sx={{ mb: 2, fontWeight: 600 }}
              />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Sessions Today: <strong>{dailySessions}</strong>
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <ScheduleIcon fontSize="small" color="disabled" />
                <Typography variant="body2" color="text.secondary">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              System Metrics
            </Typography>

            <Grid container spacing={2}>
              {metrics.map((metric) => (
                <Grid size={{ xs: 6 }} key={metric.label}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {metric.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {typeof metric.value === 'number' && metric.value % 1 !== 0
                          ? metric.value.toFixed(1)
                          : Math.round(metric.value)}
                        {metric.unit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getProgressValue(metric)}
                      color={metric.color}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Logs
              </Typography>
              <Chip label={`${logs.length} entries`} size="small" variant="outlined" />
            </Box>

            <Box
              sx={{
                backgroundColor: 'background.default',
                borderRadius: 1,
                p: 2,
                maxHeight: 300,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              }}
            >
              {logs.map((log, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    py: 0.5,
                    borderBottom: index < logs.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.disabled', minWidth: 70 }}
                  >
                    {log.timestamp}
                  </Typography>
                  {getLogIcon(log.level)}
                  <Typography
                    variant="body2"
                    sx={{
                      color: log.level === 'ERROR' ? 'error.main' : log.level === 'WARNING' ? 'warning.main' : 'text.primary',
                    }}
                  >
                    {log.message}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <SpeedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Performance
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Avg Response Time</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{metrics.find(m => m.label === 'API Latency')?.value}ms</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Uptime</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>100%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Sessions Today</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{metrics.find(m => m.label === 'Active Sessions')?.value}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <MemoryIcon color="secondary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Resources
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">CPU Load</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{metrics.find(m => m.label === 'CPU Usage')?.value}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Memory Used</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{metrics.find(m => m.label === 'Memory Usage')?.value} GB</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">WebSocket Connections</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{metrics.find(m => m.label === 'Active Sessions')?.value}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
  Alert,
  Button,
} from '@mui/material'
import { Save as SaveIcon } from '@mui/icons-material'
import { devApi } from '../api'

type TurnDetectionMode = 'normal' | 'aggressive' | 'passive'

interface VADConfig {
  turn_detection_mode: TurnDetectionMode
  vad_sensitivity: number
  max_call_duration_minutes: number
}

const vadModes = [
  {
    value: 'normal',
    label: 'Normal',
    description: 'Balanced turn detection with natural conversation flow',
  },
  {
    value: 'aggressive',
    label: 'Aggressive',
    description: 'Quick turn detection, may interrupt short pauses',
  },
  {
    value: 'passive',
    label: 'Passive',
    description: 'Waits longer before detecting end of turn',
  },
]

export default function VADSettings() {
  const [config, setConfig] = useState<VADConfig>({
    turn_detection_mode: 'normal',
    vad_sensitivity: 0.5,
    max_call_duration_minutes: 30,
  })
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await devApi.getConfig()
        const data = response.data
        setConfig({
          turn_detection_mode: (data.turn_detection_mode as TurnDetectionMode) || 'normal',
          vad_sensitivity: data.vad_sensitivity ?? 0.5,
          max_call_duration_minutes: data.max_call_duration_minutes ?? 30,
        })
      } catch {
        console.log('Using default VAD configuration')
      }
    }
    loadConfig()
  }, [])

  const handleModeChange = (event: { target: { value: unknown } }) => {
    setConfig((prev) => ({
      ...prev,
      turn_detection_mode: event.target.value as TurnDetectionMode,
    }))
  }

  const handleSensitivityChange = (_event: Event, value: number | number[]) => {
    setConfig((prev) => ({
      ...prev,
      vad_sensitivity: value as number,
    }))
  }

  const handleDurationChange = (_event: Event, value: number | number[]) => {
    setConfig((prev) => ({
      ...prev,
      max_call_duration_minutes: value as number,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await devApi.updateConfig({
        turn_detection_mode: config.turn_detection_mode,
        vad_sensitivity: config.vad_sensitivity,
        max_call_duration_minutes: config.max_call_duration_minutes,
      })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const selectedMode = vadModes.find((m) => m.value === config.turn_detection_mode)

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          VAD Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure Voice Activity Detection parameters
        </Typography>
      </Box>

      {saveStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          VAD configuration saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Turn Detection Mode
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Detection Mode</InputLabel>
              <Select
                value={config.turn_detection_mode}
                label="Detection Mode"
                onChange={handleModeChange}
              >
                {vadModes.map((mode) => (
                  <MenuItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedMode && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {selectedMode.label} Mode
                </Typography>
                <Typography variant="body2">{selectedMode.description}</Typography>
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Sensitivity
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography gutterBottom sx={{ fontWeight: 500 }}>
                VAD Sensitivity: {config.vad_sensitivity.toFixed(2)}
              </Typography>
              <Slider
                value={config.vad_sensitivity}
                onChange={handleSensitivityChange}
                min={0}
                max={1}
                step={0.01}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: 'Low' },
                  { value: 0.5, label: 'Medium' },
                  { value: 1, label: 'High' },
                ]}
                sx={{
                  color: 'secondary.main',
                  '& .MuiSlider-valueLabel': {
                    backgroundColor: 'secondary.main',
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Higher sensitivity detects speech more easily but may pick up background noise
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Call Duration Limit
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom sx={{ fontWeight: 500 }}>
                Max Duration: {config.max_call_duration_minutes} minutes
              </Typography>
              <Slider
                value={config.max_call_duration_minutes}
                onChange={handleDurationChange}
                min={5}
                max={60}
                step={5}
                valueLabelDisplay="auto"
                marks={[
                  { value: 5, label: '5m' },
                  { value: 15, label: '15m' },
                  { value: 30, label: '30m' },
                  { value: 45, label: '45m' },
                  { value: 60, label: '60m' },
                ]}
                sx={{
                  color: 'primary.main',
                  '& .MuiSlider-valueLabel': {
                    backgroundColor: 'primary.main',
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Maximum duration for each voice call session
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Current Configuration
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Turn Detection Mode
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {selectedMode?.label || config.turn_detection_mode}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  VAD Sensitivity
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                  {config.vad_sensitivity.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Max Call Duration
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {config.max_call_duration_minutes} minutes
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Save your changes to apply the new VAD configuration
              </Typography>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00cc6a 0%, #00ff88 100%)',
                  },
                }}
              >
                {saving ? 'Saving...' : 'Save VAD Settings'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

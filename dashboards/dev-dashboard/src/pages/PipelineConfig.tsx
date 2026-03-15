import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Card,
  CardContent,
} from '@mui/material'
import {
  Save as SaveIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  SettingsSuggest as SettingsSuggestIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material'
import { devApi } from '../api'
import type { PipelineConfig, PipelineCatalogResponse } from '../api'

interface ProviderStatus {
  name: string
  status: 'online' | 'offline' | 'error'
  latency?: number
}

export default function PipelineConfig() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [architecture, setArchitecture] = useState<'realtime' | 'modular'>('realtime')
  const [activeConfigId, setActiveConfigId] = useState<number | null>(null)
  const [providersStatus, setProvidersStatus] = useState<ProviderStatus[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Dynamic catalogs
  const [catalog, setCatalog] = useState<PipelineCatalogResponse | null>(null)
  const [availableVoices, setAvailableVoices] = useState<string[]>([])

  const [realtimeProvider, setRealtimeProvider] = useState('gemini')
  const [realtimeModel, setRealtimeModel] = useState('')
  const [realtimeVoice, setRealtimeVoice] = useState('')

  const [llmProvider, setLlmProvider] = useState('ollama')
  const [llmModel, setLlmModel] = useState('')
  const [llmBaseUrl, setLlmBaseUrl] = useState('http://localhost:11434')
  const [llmTemperature, setLlmTemperature] = useState(0.7)

  const [sttProvider, setSttProvider] = useState('faster-whisper')
  const [sttModel, setSttModel] = useState('base')
  const [sttLanguage, setSttLanguage] = useState('auto')

  const [ttsProvider, setTtsProvider] = useState('kokoro')
  const [ttsVoice, setTtsVoice] = useState('')
  const [ttsSpeed, setTtsSpeed] = useState(1.0)
  const [ttsServerUrl, setTtsServerUrl] = useState('http://localhost:8001')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [configRes, statusRes, catalogRes, voicesRes] = await Promise.all([
          devApi.getPipelineConfig(),
          devApi.getProvidersStatus(),
          devApi.getPipelineCatalog(),
          devApi.getVoices(),
        ])

        const catalogData = catalogRes.data
        const voicesData = voicesRes.data.voices
        setCatalog(catalogData)
        setAvailableVoices(voicesData)

        const config = configRes.data
        setActiveConfigId(config.id)
        setArchitecture(config.architecture || 'realtime')

        setRealtimeProvider(config.realtime_provider || 'gemini')
        setRealtimeModel(config.realtime_model || '')
        setRealtimeVoice(config.realtime_voice || voicesData[0] || '')

        setLlmProvider(config.llm_provider || 'ollama')
        setLlmModel(config.llm_model || '')
        setLlmBaseUrl(config.llm_base_url || 'http://localhost:11434')
        setLlmTemperature(config.llm_temperature || 0.7)

        setSttProvider(config.stt_provider || 'faster-whisper')
        setSttModel(config.stt_model || 'base')
        setSttLanguage(config.stt_language || 'auto')

        setTtsProvider(config.tts_provider || 'kokoro')
        setTtsVoice(config.tts_voice || voicesData[0] || '')
        setTtsSpeed(config.tts_speed || 1.0)
        setTtsServerUrl(config.tts_server_url || 'http://localhost:8001')

        // Convert API response to ProviderStatus dynamically
        const providersData = statusRes.data as Record<string, any>
        const providersArray: ProviderStatus[] = []

        for (const [key, pData] of Object.entries(providersData)) {
          if (pData && typeof pData === 'object' && 'available' in pData) {
            providersArray.push({
              name: key.replace(/_/g, ' '),
              status: pData.available ? 'online' : 'offline',
            })
          }
        }

        setProvidersStatus(providersArray)
      } catch (err) {
        console.error("Failed to load pipeline config:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (catalog) {
      const rModels = catalog.realtime.models || []
      if (rModels.length > 0 && !rModels.includes(realtimeModel)) {
        setRealtimeModel(rModels.find(m => m.includes(realtimeProvider)) || rModels[0])
      }
    }
  }, [realtimeProvider, realtimeModel, catalog])

  useEffect(() => {
    if (catalog && catalog.llm) {
      let lModels: string[] = []
      // Use Ollama models dynamically if active
      if (llmProvider === "ollama") {
        lModels = catalog.llm.models // Server now consolidates them, or we could fetch from ollama API
      } else {
        lModels = catalog.llm.models
      }

      if (lModels.length > 0 && !lModels.includes(llmModel)) {
        setLlmModel(lModels.find(m => m.includes(llmProvider)) || lModels[0])
      }
    }
  }, [llmProvider, llmModel, catalog, providersStatus])

  const handleSave = async () => {
    if (!activeConfigId) return
    setSaving(true)
    try {
      const config: Partial<PipelineConfig> = {
        architecture,
        realtime_provider: realtimeProvider,
        realtime_model: realtimeModel,
        realtime_voice: realtimeVoice,
        llm_provider: llmProvider,
        llm_model: llmModel,
        llm_base_url: llmProvider === 'ollama' ? llmBaseUrl : null,
        llm_temperature: llmTemperature,
        stt_provider: sttProvider,
        stt_model: sttModel,
        stt_language: sttLanguage,
        tts_provider: ttsProvider,
        tts_voice: ttsVoice,
        tts_speed: ttsSpeed,
        tts_server_url: ttsProvider === 'kokoro' ? ttsServerUrl : null,
      }

      await devApi.updatePipelineConfig(activeConfigId, config)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !catalog) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Pipeline Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure the voice assistant pipeline architecture and providers dynamically
        </Typography>
      </Box>

      {saveStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Configuration saved successfully!
        </Alert>
      )}
      {saveStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to save configuration
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Architecture Type
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={architecture}
            onChange={(e) => setArchitecture(e.target.value as 'realtime' | 'modular')}
          >
            <FormControlLabel
              value="realtime"
              control={<Radio />}
              label={
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsSuggestIcon color="primary" />
                    <Typography sx={{ fontWeight: 600 }}>Native Realtime (Recommended)</Typography>
                    <Chip label="Low Latency" size="small" color="success" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 4 }}>
                    Uses native realtime APIs with built-in voice I/O. Best for conversational AI.
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="modular"
              control={<Radio />}
              label={
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountTreeIcon color="secondary" />
                    <Typography sx={{ fontWeight: 600 }}>Pipeline Modular (STT + LLM + TTS)</Typography>
                    <Chip label="Flexible" size="small" color="info" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 4 }}>
                    Separate components for speech-to-text, LLM, and text-to-speech. More control, higher latency.
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
      </Paper>

      {architecture === 'realtime' ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Realtime Configuration
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Provider</InputLabel>
                <Select
                  value={realtimeProvider}
                  label="Provider"
                  onChange={(e) => setRealtimeProvider(e.target.value)}
                >
                  {catalog.realtime.providers.map((p) => (
                    <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Model</InputLabel>
                <Select
                  value={realtimeModel}
                  label="Model"
                  onChange={(e) => setRealtimeModel(e.target.value)}
                >
                  {(catalog.realtime.models || []).map((model) => (
                    <MenuItem key={model} value={model}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {model}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Voice</InputLabel>
                <Select
                  value={realtimeVoice}
                  label="Voice"
                  onChange={(e) => setRealtimeVoice(e.target.value)}
                >
                  {(availableVoices || []).map((v) => (
                    <MenuItem key={v} value={v}>{v}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                  LLM Configuration
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel size="small">Provider</InputLabel>
                  <Select
                    size="small"
                    value={llmProvider}
                    label="Provider"
                    onChange={(e) => setLlmProvider(e.target.value)}
                  >
                    {catalog.llm.providers.map((p) => (
                      <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>{p}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel size="small">Model</InputLabel>
                  <Select
                    size="small"
                    value={llmModel}
                    label="Model"
                    onChange={(e) => setLlmModel(e.target.value)}
                  >
                    {(catalog.llm.models || []).map((model) => (
                      <MenuItem key={model} value={model}>
                        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {model}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {llmProvider === 'ollama' && (
                  <TextField
                    size="small"
                    fullWidth
                    label="Base URL"
                    value={llmBaseUrl}
                    onChange={(e) => setLlmBaseUrl(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Temperature: {llmTemperature.toFixed(2)}
                  </Typography>
                  <Slider
                    size="small"
                    value={llmTemperature}
                    onChange={(_, v) => setLlmTemperature(v as number)}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'secondary.main' }}>
                  STT Configuration
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel size="small">Provider</InputLabel>
                  <Select
                    size="small"
                    value={sttProvider}
                    label="Provider"
                    onChange={(e) => setSttProvider(e.target.value)}
                  >
                    {catalog.stt.providers.map((p) => (
                      <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>{p}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel size="small">Model</InputLabel>
                  <Select
                    size="small"
                    value={sttModel}
                    label="Model"
                    onChange={(e) => setSttModel(e.target.value)}
                  >
                    {['tiny', 'base', 'small', 'medium', 'large'].map((model) => (
                      <MenuItem key={model} value={model}>
                        <Typography sx={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>
                          {model}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel size="small">Language</InputLabel>
                  <Select
                    size="small"
                    value={sttLanguage}
                    label="Language"
                    onChange={(e) => setSttLanguage(e.target.value)}
                  >
                    {[
                      { value: 'auto', label: 'Auto Detect' },
                      { value: 'es', label: 'Spanish (es)' },
                      { value: 'en', label: 'English (en)' }
                    ].map((lang) => (
                      <MenuItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'warning.main' }}>
                  TTS Configuration
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel size="small">Provider</InputLabel>
                  <Select
                    size="small"
                    value={ttsProvider}
                    label="Provider"
                    onChange={(e) => setTtsProvider(e.target.value)}
                  >
                    {catalog.tts.providers.map((p) => (
                      <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>{p}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel size="small">Voice</InputLabel>
                  <Select
                    size="small"
                    value={ttsVoice}
                    label="Voice"
                    onChange={(e) => setTtsVoice(e.target.value)}
                  >
                    {(availableVoices || []).map((v) => (
                      <MenuItem key={v} value={v}>{v}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {ttsProvider === 'kokoro' && (
                  <TextField
                    size="small"
                    fullWidth
                    label="Server URL"
                    value={ttsServerUrl}
                    onChange={(e) => setTtsServerUrl(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Speed: {ttsSpeed.toFixed(1)}x
                  </Typography>
                  <Slider
                    size="small"
                    value={ttsSpeed}
                    onChange={(_, v) => setTtsSpeed(v as number)}
                    min={0.5}
                    max={2}
                    step={0.1}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Providers Status
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {providersStatus.map((provider) => {
            const isLocalOnly = ['ollama', 'kokoro', 'faster whisper'].some(n => provider.name.toLowerCase().includes(n))
            const isIrrelevant = architecture === 'realtime' && isLocalOnly

            return (
              <Box
                key={provider.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid',
                  borderColor: 'divider',
                  opacity: isIrrelevant ? 0.5 : 1,
                }}
              >
                {isIrrelevant ? (
                  <Chip label="N/A" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                ) : provider.status === 'online' ? (
                  <CheckIcon color="success" fontSize="small" />
                ) : (
                  <ErrorIcon color="error" fontSize="small" />
                )}
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{provider.name}</Typography>
                {isIrrelevant && (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                    Solo Modular
                  </Typography>
                )}
                {!isIrrelevant && provider.latency && (
                  <Chip label={`${provider.latency}ms`} size="small" variant="outlined" />
                )}
              </Box>
            )
          })}
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00cc6a 0%, #00ff88 100%)',
            },
          }}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </Box>
    </Box>
  )
}


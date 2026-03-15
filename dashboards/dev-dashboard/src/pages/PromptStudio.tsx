import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
} from '@mui/material'
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
} from '@mui/icons-material'
import Editor from '@monaco-editor/react'
import { devApi } from '../api'

const defaultVariables = [
  '{restaurant_name}',
  '{date}',
  '{current_time}',
  '{customer_name}',
  '{reservation_id}',
  '{party_size}',
  '{special_requests}',
]

const defaultPrompt = `You are an AI voice assistant for {restaurant_name}. 

Current date and time: {date} {current_time}

Your role is to help customers with:
- Making reservations
- Answering questions about the menu
- Providing information about the restaurant
- Handling special requests

Always be polite, professional, and helpful. If you don't know something, offer to connect the customer with a staff member.

Current customer: {customer_name}
Party size: {party_size}
Special requests: {special_requests}`

export default function PromptStudio() {
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [savedPrompt, setSavedPrompt] = useState(defaultPrompt)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const loadPrompt = async () => {
      try {
        const response = await devApi.getPrompt()
        if (response.data.system_prompt) {
          setPrompt(response.data.system_prompt)
          setSavedPrompt(response.data.system_prompt)
        }
      } catch {
        console.log('Using default prompt')
      }
    }
    loadPrompt()
  }, [])

  const handlePromptChange = (value: string | undefined) => {
    if (value !== undefined) {
      setPrompt(value)
      setIsDirty(value !== savedPrompt)
      setSaveStatus('idle')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await devApi.updatePrompt(prompt)
      setSavedPrompt(prompt)
      setIsDirty(false)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setPrompt(savedPrompt)
    setIsDirty(false)
    setSaveStatus('idle')
  }

  const handleVariableClick = (variable: string) => {
    setPrompt((prev) => prev + variable)
    setIsDirty(true)
  }

  const detectedVariables = defaultVariables.filter((v) => prompt.includes(v))

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Prompt Studio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Edit and test your AI assistant system prompt
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={!isDirty}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!isDirty}
            sx={{
              background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00cc6a 0%, #00ff88 100%)',
              },
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>

      {saveStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Prompt saved successfully!
        </Alert>
      )}
      {saveStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to save prompt. Please try again.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <Paper sx={{ p: 2, height: 600 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                System Prompt
              </Typography>
              {isDirty && (
                <Chip
                  label="Unsaved changes"
                  size="small"
                  color="warning"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>

            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Editor
                height={520}
                defaultLanguage="markdown"
                value={prompt}
                onChange={handlePromptChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  padding: { top: 16 },
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Available Variables
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {defaultVariables.map((variable) => (
                <Chip
                  key={variable}
                  label={variable}
                  size="small"
                  onClick={() => handleVariableClick(variable)}
                  color={prompt.includes(variable) ? 'primary' : 'default'}
                  variant={prompt.includes(variable) ? 'filled' : 'outlined'}
                  sx={{
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Used Variables
            </Typography>
            {detectedVariables.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {detectedVariables.map((variable) => (
                  <Chip
                    key={variable}
                    label={variable}
                    size="small"
                    color="success"
                    sx={{ fontFamily: 'monospace' }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No variables detected
              </Typography>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Prompt Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Characters
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {prompt.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Words
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {prompt.split(/\s+/).filter(Boolean).length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Lines
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {prompt.split('\n').length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Variables
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {detectedVariables.length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

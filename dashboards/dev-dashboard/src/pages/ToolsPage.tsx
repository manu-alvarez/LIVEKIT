import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
  Chip,
  Alert,
  Divider,
  Tooltip,
} from '@mui/material'
import {
  Public as PublicIcon,
  Storage as StorageIcon,
  Event as EventIcon,
  Lock as LockIcon,
} from '@mui/icons-material'
import { devApi } from '../api'

interface ToolConfig {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  locked: boolean
  status: 'active' | 'inactive' | 'error'
}

const defaultTools: ToolConfig[] = [
  {
    id: 'enable_internet_search',
    name: 'Search Internet',
    description: 'Allow the AI to search the internet using Tavily for real-time information',
    icon: <PublicIcon />,
    enabled: false,
    locked: false,
    status: 'inactive',
  },
  {
    id: 'get_local_context',
    name: 'Get Local Context',
    description: 'Enable RAG to search local knowledge base for restaurant-specific information',
    icon: <StorageIcon />,
    enabled: true,
    locked: false,
    status: 'active',
  },
  {
    id: 'reservation_tools',
    name: 'Reservation Tools',
    description: 'Core tools for creating, modifying, and canceling reservations',
    icon: <EventIcon />,
    enabled: true,
    locked: true,
    status: 'active',
  },
]

export default function ToolsPage() {
  const [tools, setTools] = useState<ToolConfig[]>(defaultTools)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await devApi.getConfig()
        const config = response.data
        setTools((prev) =>
          prev.map((tool) => {
            if (tool.locked) {
              return { ...tool, enabled: true, status: 'active' }
            }
            // Map API fields to tool states
            if (tool.id === 'enable_internet_search') {
              const enabled = Boolean(config.enable_internet_search)
              return { ...tool, enabled, status: enabled ? 'active' : 'inactive' }
            }
            return tool
          })
        )
      } catch {
        console.log('Using default tool configuration')
      }
    }
    loadConfig()
  }, [])

  const handleToggle = async (toolId: string) => {
    const tool = tools.find((t) => t.id === toolId)
    if (tool?.locked) return

    const newTools = tools.map((t) =>
      t.id === toolId ? { ...t, enabled: !t.enabled, status: (!t.enabled ? 'active' : 'inactive') as 'active' | 'inactive' | 'error' } : t
    )
    setTools(newTools)

    try {
      // Update enable_internet_search field (0 = disabled, 1 = enabled)
      const searchTool = newTools.find((t) => t.id === 'enable_internet_search')
      await devApi.updateConfig({
        enable_internet_search: searchTool?.enabled ? 1 : 0,
      })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'error':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Tools Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enable or disable AI tools and capabilities
        </Typography>
      </Box>

      {saveStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Tool configuration updated!
        </Alert>
      )}
      {saveStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to update configuration
        </Alert>
      )}

      <Grid container spacing={3}>
        {tools.map((tool) => (
          <Grid size={{ xs: 12, md: 6 }} key={tool.id}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                opacity: tool.locked ? 0.8 : 1,
                border: tool.enabled ? '1px solid' : '1px solid',
                borderColor: tool.enabled ? 'primary.main' : 'divider',
                boxShadow: tool.enabled ? '0 0 20px rgba(0, 255, 136, 0.1)' : 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: tool.enabled ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255,255,255,0.05)',
                      color: tool.enabled ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {tool.icon}
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {tool.name}
                      </Typography>
                      {tool.locked && (
                        <Tooltip title="This tool is always active">
                          <LockIcon fontSize="small" color="disabled" />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {tool.description}
                    </Typography>
                  </Box>
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={tool.enabled}
                      onChange={() => handleToggle(tool.id)}
                      disabled={tool.locked}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'primary.main',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: 'primary.main',
                        },
                      }}
                    />
                  }
                  label=""
                  sx={{ ml: 2 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={tool.enabled ? 'Active' : 'Inactive'}
                  size="small"
                  color={getStatusColor(tool.status)}
                  variant="outlined"
                />
                {tool.locked && (
                  <Chip
                    label="Core Tool"
                    size="small"
                    color="primary"
                    variant="filled"
                    sx={{ backgroundColor: 'rgba(0, 255, 136, 0.2)' }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Tool Status Summary
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
              {tools.filter((t) => t.enabled).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Tools
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {tools.filter((t) => !t.enabled).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inactive Tools
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 700 }}>
              {tools.filter((t) => t.locked).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Core Tools
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

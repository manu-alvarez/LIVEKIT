import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PromptStudio from './pages/PromptStudio'
import PipelineConfig from './pages/PipelineConfig'
import ToolsPage from './pages/ToolsPage'
import VADSettings from './pages/VADSettings'
import SystemStatus from './pages/SystemStatus'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<PromptStudio />} />
        <Route path="pipeline" element={<PipelineConfig />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="vad" element={<VADSettings />} />
        <Route path="status" element={<SystemStatus />} />
      </Route>
    </Routes>
  )
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ContentCreator from './pages/ContentCreator'
import VoiceStudio from './pages/VoiceStudio'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Auth from './pages/Auth'
import ProtectedRoute from './components/ProtectedRoute'
import { ContentProvider } from './contexts/ContentContext'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <Router>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route element={<ProtectedRoute />}>
                <Route path="create" element={<ContentCreator />} />
                <Route path="voice" element={<VoiceStudio />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </ContentProvider>
    </AuthProvider>
  )
}

export default App
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useConfig } from '@/hooks/useConfig'
import { App } from './App'
import { Loading } from '@/components/Loading/Loading'
import { InvalidConfig } from '@/components/InvalidConfig/InvalidConfig'
import '@/styles/global.css'

function AppShell() {
  const configState = useConfig()

  if (configState.status === 'loading') {
    return <Loading loading />
  }
  if (configState.status === 'invalid') {
    return <InvalidConfig show />
  }
  return <App config={configState.config} />
}

const root = document.getElementById('app')
if (!root) throw new Error('#app element not found')

createRoot(root).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
)

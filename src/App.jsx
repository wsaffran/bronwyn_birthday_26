import BronwynGate from './components/BronwynGate'
import Layout from './components/Layout'
import { ProgressProvider, useProgress } from './progress'
import Home from './pages/Home'
import Day from './pages/Day'
import './App.css'

function Stage() {
  const { isHome, selected, isUnlocked } = useProgress()
  const dayKey = `${selected}-${isUnlocked(selected) ? 'open' : 'locked'}`
  return <Layout>{isHome ? <Home /> : <Day key={dayKey} />}</Layout>
}

function App() {
  return (
    <ProgressProvider>
      <BronwynGate>
        <Stage />
      </BronwynGate>
    </ProgressProvider>
  )
}

export default App

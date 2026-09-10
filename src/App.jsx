import Layout from './components/Layout'
import { ProgressProvider, useProgress } from './progress'
import Home from './pages/Home'
import Day from './pages/Day'
import './App.css'

function Stage() {
  const { isHome, selected } = useProgress()
  return <Layout>{isHome ? <Home /> : <Day key={selected} />}</Layout>
}

function App() {
  return (
    <ProgressProvider>
      <Stage />
    </ProgressProvider>
  )
}

export default App

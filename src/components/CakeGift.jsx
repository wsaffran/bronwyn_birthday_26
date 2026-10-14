import { useEffect, useRef, useState } from 'react'

const CALIBRATE_MS = 400
const HOT_FRAMES = 6

function readRms(analyser, samples) {
  analyser.getByteTimeDomainData(samples)
  let sum = 0
  for (let index = 0; index < samples.length; index += 1) {
    const sample = (samples[index] - 128) / 128
    sum += sample * sample
  }
  return Math.sqrt(sum / samples.length)
}

export default function CakeGift() {
  const [phase, setPhase] = useState('idle')
  const phaseRef = useRef('idle')
  const pendingRef = useRef(false)
  const streamRef = useRef(null)
  const audioRef = useRef(null)
  const frameRef = useRef(0)

  function stopListening() {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    const audio = audioRef.current
    audioRef.current = null
    audio?.close()
  }

  function blowOut() {
    stopListening()
    pendingRef.current = false
    phaseRef.current = 'out'
    setPhase('out')
  }

  useEffect(() => stopListening, [])

  function listen(analyser) {
    const samples = new Uint8Array(analyser.fftSize)
    const started = performance.now()
    let baseline = null
    let hotFrames = 0

    function tick() {
      if (phaseRef.current === 'out') return
      const rms = readRms(analyser, samples)
      const elapsed = performance.now() - started
      if (elapsed < CALIBRATE_MS && rms < 0.2) {
        baseline = baseline == null ? rms : baseline * 0.7 + rms * 0.3
        frameRef.current = requestAnimationFrame(tick)
        return
      }
      if (baseline == null) baseline = 0.02
      const threshold = Math.max(0.08, baseline * 4)
      if (rms > threshold) hotFrames += 1
      else {
        hotFrames = 0
        baseline = baseline * 0.98 + rms * 0.02
      }
      if (hotFrames >= HOT_FRAMES) {
        blowOut()
        return
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
  }

  function onWish() {
    if (phaseRef.current === 'out' || phaseRef.current === 'listening' || pendingRef.current) return
    if (phaseRef.current === 'denied') {
      blowOut()
      return
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!navigator.mediaDevices?.getUserMedia || !AudioContext) {
      phaseRef.current = 'denied'
      setPhase('denied')
      return
    }

    pendingRef.current = true
    let audio
    try {
      audio = new AudioContext()
      audioRef.current = audio
      audio.resume()
    } catch {
      pendingRef.current = false
      phaseRef.current = 'denied'
      setPhase('denied')
      return
    }
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      .then((stream) => {
        pendingRef.current = false
        if (phaseRef.current === 'out' || audioRef.current !== audio) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        const source = audio.createMediaStreamSource(stream)
        const analyser = audio.createAnalyser()
        analyser.fftSize = 1024
        source.connect(analyser)
        phaseRef.current = 'listening'
        setPhase('listening')
        listen(analyser)
      })
      .catch(() => {
        pendingRef.current = false
        if (audioRef.current === audio) {
          audio.close()
          audioRef.current = null
        }
        if (phaseRef.current === 'out') return
        phaseRef.current = 'denied'
        setPhase('denied')
      })
  }

  return (
    <div className={phase === 'out' ? 'cake-gift is-out' : 'cake-gift'}>
      <div className="cake-stage">
        <img className="cake-roll" src="/cake/roll.png" alt="Strawberry roll" />
        <img className="cake-candle" src="/cake/candle.png" alt="" />
        <img className="cake-smoke" src="/cake/smoke.png" alt="" />
      </div>
      {phase === 'out' ? null : phase === 'listening' ? (
        <p className="cake-prompt" aria-live="polite">
          Blow
        </p>
      ) : (
        <button type="button" className="cake-wish" onClick={onWish}>
          {phase === 'denied' ? 'Blow it out' : 'Make a wish'}
        </button>
      )}
    </div>
  )
}

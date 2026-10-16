import { useCallback, useEffect, useRef, useState } from 'react'
import ConfettiExplosion from 'react-confetti-explosion'

const CALIBRATE_MS = 280
const HOT_FRAMES = 2
const SILENCE_RMS = 0.0008
const IOS_RECOVER_MS = 1500
const BURST_COLORS = ['#ffd36a', '#ff4d6d', '#fff6e8', '#ff8c42', '#7ad7ff']

function isIos() {
  const ua = navigator.userAgent
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function enableMicSession() {
  if (!isIos()) return
  const session = navigator.audioSession
  if (!session) return
  try {
    // A silent Web Audio graph never starts the recorder, so blows read as silence.
    session.type = 'play-and-record'
  } catch {
    // Older Safari exposes the object and then rejects the mode.
  }
}

function readRms(analyser, samples) {
  analyser.getByteTimeDomainData(samples)
  let sum = 0
  for (let index = 0; index < samples.length; index += 1) {
    const sample = (samples[index] - 128) / 128
    sum += sample * sample
  }
  return Math.sqrt(sum / samples.length)
}

function requestMic() {
  // iPhone routes a processed mic when the constraints stay simple. Forcing
  // the raw path leaves the analyser on exact silence.
  const preferred = isIos()
    ? { audio: true }
    : {
        audio: {
          echoCancellation: { ideal: false },
          noiseSuppression: { ideal: false },
          autoGainControl: { ideal: false },
        },
      }
  return navigator.mediaDevices.getUserMedia(preferred).catch((error) => {
    const name = error?.name
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
      throw error
    }
    return navigator.mediaDevices.getUserMedia({ audio: true })
  })
}

function unlock(audio) {
  const buffer = audio.createBuffer(1, 1, audio.sampleRate)
  const source = audio.createBufferSource()
  source.buffer = buffer
  source.connect(audio.destination)
  source.start()
  return audio.resume()
}

function wireMic(audio, stream) {
  const source = audio.createMediaStreamSource(stream)
  const analyser = audio.createAnalyser()
  const mute = audio.createGain()
  analyser.fftSize = 1024
  analyser.smoothingTimeConstant = 0
  // Exact zero lets iOS skip the graph. A tiny gain stays inaudible.
  mute.gain.value = isIos() ? 0.0001 : 0
  source.connect(analyser)
  // Safari does not run the meter unless the graph reaches the speakers.
  analyser.connect(mute)
  mute.connect(audio.destination)
  return { source, analyser, mute }
}

function readFreq(analyser, samples) {
  analyser.getByteFrequencyData(samples)
  let sum = 0
  for (let index = 2; index < samples.length; index += 1) sum += samples[index]
  return sum / (samples.length - 2) / 255
}

export default function CakeGift() {
  const [phase, setPhase] = useState('idle')
  const [burst, setBurst] = useState(false)
  const phaseRef = useRef('idle')
  const pendingRef = useRef(false)
  const streamRef = useRef(null)
  const audioRef = useRef(null)
  const graphRef = useRef(null)
  const frameRef = useRef(0)

  function releaseGraph() {
    const graph = graphRef.current
    graphRef.current = null
    if (!graph) return
    try {
      graph.source.disconnect()
    } catch {
      // Already disconnected.
    }
    try {
      graph.mute.disconnect()
    } catch {
      // Already disconnected.
    }
  }

  function stopListening() {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    releaseGraph()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    const audio = audioRef.current
    audioRef.current = null
    audio?.close()
  }

  const finishBurst = useCallback(() => setBurst(false), [])

  function blowOut() {
    stopListening()
    pendingRef.current = false
    phaseRef.current = 'out'
    setPhase('out')
    setBurst(true)
  }

  useEffect(() => stopListening, [])

  function rearm() {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    releaseGraph()
    if (phaseRef.current === 'out') return
    phaseRef.current = 'armed'
    setPhase('armed')
  }

  function listen(analyser, audio) {
    const samples = new Uint8Array(analyser.fftSize)
    const freqSamples = isIos() ? new Uint8Array(analyser.frequencyBinCount) : null
    const started = performance.now()
    let baseline = null
    let hotFrames = 0
    let heard = false

    function tick() {
      if (phaseRef.current === 'out') return
      if (audio.state === 'suspended' || audio.state === 'interrupted') audio.resume()
      const rms = readRms(analyser, samples)
      const freq = freqSamples ? readFreq(analyser, freqSamples) : 0
      // iOS sometimes leaves the waveform stuck at silence while frequency bins move.
      const level = rms > SILENCE_RMS ? rms : Math.max(rms, freq)
      if (rms > SILENCE_RMS || freq > SILENCE_RMS) heard = true
      const elapsed = performance.now() - started
      if (!heard && freqSamples && elapsed > IOS_RECOVER_MS) {
        rearm()
        return
      }
      if (elapsed < CALIBRATE_MS && level < 0.12) {
        baseline = baseline == null ? level : baseline * 0.7 + level * 0.3
        frameRef.current = requestAnimationFrame(tick)
        return
      }
      if (baseline == null) baseline = 0.01
      const threshold = Math.max(0.02, baseline * 1.8)
      if (level > threshold) hotFrames += 1
      else {
        hotFrames = 0
        baseline = baseline * 0.98 + level * 0.02
      }
      if (hotFrames >= HOT_FRAMES) {
        blowOut()
        return
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
  }

  function startMeter() {
    const audio = audioRef.current
    const stream = streamRef.current
    if (!audio || !stream || phaseRef.current === 'out' || phaseRef.current === 'listening') return
    releaseGraph()
    const graph = wireMic(audio, stream)
    // Safari drops the mic if these nodes are left for garbage collection.
    graphRef.current = graph
    phaseRef.current = 'listening'
    setPhase('listening')
    listen(graph.analyser, audio)
  }

  function onWish() {
    if (phaseRef.current === 'out' || phaseRef.current === 'listening' || pendingRef.current) return
    if (phaseRef.current === 'armed') {
      enableMicSession()
      const audio = audioRef.current
      if (audio && audio.state !== 'running') audio.resume()
      startMeter()
      return
    }
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
    enableMicSession()
    let audio
    try {
      audio = new AudioContext()
      audioRef.current = audio
      unlock(audio)
    } catch {
      pendingRef.current = false
      phaseRef.current = 'denied'
      setPhase('denied')
      return
    }
    requestMic()
      .then(async (stream) => {
        pendingRef.current = false
        if (phaseRef.current === 'out' || audioRef.current !== audio) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        try {
          await audio.resume()
        } catch {
          // A later tap can resume the context on iOS.
        }
        if (audioRef.current !== audio || phaseRef.current === 'out') {
          stream.getTracks().forEach((track) => track.stop())
          streamRef.current = null
          return
        }
        const gestureAlive = !navigator.userActivation || navigator.userActivation.isActive
        if (audio.state === 'running' && (gestureAlive || !isIos())) {
          startMeter()
          return
        }
        // The permission sheet ends the tap on iPhone, and a meter started
        // after that stays silent. The next tap is a fresh gesture.
        phaseRef.current = 'armed'
        setPhase('armed')
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
        <div className="cake-burst" aria-hidden="true">
          {burst ? (
            <ConfettiExplosion
              particleCount={120}
              particleSize={12}
              duration={2500}
              force={0.6}
              width={900}
              colors={BURST_COLORS}
              zIndex={4}
              onComplete={finishBurst}
            />
          ) : null}
        </div>
        <div className="cake-controls">
          {phase === 'out' ? null : phase === 'listening' ? (
            <p className="cake-prompt" aria-live="polite">
              Blow
            </p>
          ) : (
            <button type="button" className="cake-wish" onClick={onWish}>
              {phase === 'denied' ? 'Blow it out' : phase === 'armed' ? 'Blow' : 'Make a wish'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

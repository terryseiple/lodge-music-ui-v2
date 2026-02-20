import { useState } from 'react'
import { useDevices } from '../hooks'

export default function AmazonMusic() {
  const { devices, loading } = useDevices()
  const [selectedDevice, setSelectedDevice] = useState('')
  const [query, setQuery] = useState('')
  const [commandLog, setCommandLog] = useState([])
  const [sending, setSending] = useState(false)

  // Filter to only Alexa devices
  const alexaDevices = devices.filter(d => 
    d.protocol === 'ha_media_player' && 
    (d.name.toLowerCase().includes('echo') || 
     d.name.toLowerCase().includes('alexa') ||
     d.name.toLowerCase().includes('show') ||
     d.name.toLowerCase().includes('fire tv'))
  )

  const addLog = (msg, type = 'info') => {
    setCommandLog(prev => [...prev, { 
      msg, 
      type, 
      time: new Date().toLocaleTimeString() 
    }])
  }

  const handlePlay = async (e) => {
    e.preventDefault()
    if (!query.trim() || !selectedDevice) {
      addLog('❌ Enter search query and select device', 'err')
      return
    }

    setSending(true)
    const deviceName = alexaDevices.find(d => d.id === selectedDevice)?.name || selectedDevice

    // Build voice command
    const command = `play ${query} on Amazon Music`
    addLog(`🎵 Sending: "${command}" to ${deviceName}`, 'info')

    try {
      // Send via orchestrator which will call HA alexa service
      const response = await fetch('/api/orchestrator/alexa/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device: selectedDevice,
          command: command
        })
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      addLog(`✅ Command sent successfully!`, 'ok')
    } catch (err) {
      addLog(`❌ Error: ${err.message}`, 'err')
    } finally {
      setSending(false)
    }
  }

  const quickCommands = [
    { label: '90s Rock', query: '90s rock' },
    { label: 'Jazz', query: 'jazz music' },
    { label: 'Classical', query: 'classical music' },
    { label: 'Chill Vibes', query: 'chill music' },
  ]

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-900/20 border border-blue-500 rounded-xl p-4 text-blue-300 text-sm">
        <strong>ℹ️ Amazon Music Voice Control (PATH 2)</strong>
        <p className="mt-1 text-xs">
          Uses programmatic voice commands. No queue control or metadata, but works with full Amazon Music catalog!
        </p>
      </div>

      {/* Device Selection */}
      <div className="bg-music-card border border-music-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-music-accent-light mb-4">Select Alexa Device</h3>
        
        {loading ? (
          <p className="text-gray-400">Loading devices...</p>
        ) : alexaDevices.length === 0 ? (
          <p className="text-yellow-400">No Alexa devices found</p>
        ) : (
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full bg-gray-900 border border-music-border rounded-lg px-4 py-2 text-gray-200"
          >
            <option value="">Choose Alexa device...</option>
            {alexaDevices.map(device => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Search Form */}
      <div className="bg-music-card border border-music-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-music-accent-light mb-4">What to Play</h3>
        
        <form onSubmit={handlePlay} className="space-y-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Artist, song, genre, playlist... (e.g., 'Metallica' or 'Nothing Else Matters')"
            className="w-full bg-gray-900 border border-music-border rounded-lg px-4 py-2 text-gray-200"
          />
          
          <button
            type="submit"
            disabled={!selectedDevice || !query.trim() || sending}
            className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {sending ? 'Sending...' : '🎵 Play on Amazon Music'}
          </button>
        </form>

        {/* Quick Commands */}
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">Quick Picks:</p>
          <div className="flex gap-2 flex-wrap">
            {quickCommands.map(cmd => (
              <button
                key={cmd.label}
                onClick={() => setQuery(cmd.query)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-music-border rounded-lg text-sm"
              >
                {cmd.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Command Log */}
      <div className="bg-gray-950 border border-music-border rounded-xl p-4 max-h-48 overflow-y-auto font-mono text-xs">
        {commandLog.length === 0 && (
          <div className="text-gray-500">Command history will appear here...</div>
        )}
        {commandLog.map((entry, i) => (
          <div 
            key={i} 
            className={
              entry.type === 'err' ? 'text-red-400' : 
              entry.type === 'ok' ? 'text-green-400' : 
              'text-gray-400'
            }
          >
            [{entry.time}] {entry.msg}
          </div>
        ))}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useDevices, useOrchestrator } from '../hooks'

export default function QuickPlay() {
  const { rooms, loading: devicesLoading, error: devicesError } = useDevices()
  const { play, stop, loading: playLoading } = useOrchestrator()
  const [selectedRoom, setSelectedRoom] = useState('')
  const [log, setLog] = useState([])

  useEffect(() => {
    if (devicesError) {
      addLog(`❌ Devices API error: ${devicesError}`, 'err')
    }
  }, [devicesError])

  useEffect(() => {
    if (rooms.length > 0) {
      addLog(`✅ Loaded ${rooms.length} rooms`, 'ok')
    }
  }, [rooms])

  const addLog = (msg, type = 'info') => {
    setLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }])
  }

  const handleQuickPlay = async (source, preset) => {
    if (!selectedRoom) {
      addLog('❌ Select a room first', 'err')
      return
    }

    addLog(`▶️ Playing ${preset.label || preset.channel} via ${source}...`, 'info')
    
    try {
      await play({ source, room: selectedRoom, ...preset })
      addLog(`✅ Success!`, 'ok')
    } catch (err) {
      addLog(`❌ ${err.message}`, 'err')
    }
  }

  const handleStop = async () => {
    if (!selectedRoom) return
    addLog(`⏹️ Stopping ${selectedRoom}...`, 'info')
    
    try {
      await stop(selectedRoom)
      addLog(`✅ Stopped`, 'ok')
    } catch (err) {
      addLog(`❌ ${err.message}`, 'err')
    }
  }

  const presets = {
    spotify: [
      { label: 'Daily Mix', uri: 'spotify:playlist:37i9dQZF1EQqZlCxLOykhS', shuffle: true },
      { label: 'Liked Songs', uri: 'spotify:collection:tracks', shuffle: true },
    ],
    calm: [
      { label: 'SPA', channel: 'spa' },
      { label: 'Classical', channel: 'classical' },
    ]
  }

  return (
    <div className="space-y-4">
      {/* Room Selection */}
      <div className="bg-music-card border border-music-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-music-accent-light mb-4">Target Room</h3>
        
        {devicesLoading && (
          <p className="text-gray-400 mb-4">Loading rooms...</p>
        )}

        {devicesError && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-4 text-red-400 text-sm">
            <strong>API Error:</strong> {devicesError}
            <br />
            <span className="text-xs">Check browser console (F12) for details</span>
          </div>
        )}

        {!devicesLoading && rooms.length === 0 && !devicesError && (
          <p className="text-yellow-400 mb-4">No rooms found. API might be down.</p>
        )}
        
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="w-full bg-gray-900 border border-music-border rounded-lg px-4 py-2 text-gray-200"
          disabled={devicesLoading || rooms.length === 0}
        >
          <option value="">Select room...</option>
          {rooms.map(room => (
            <option key={room.name} value={room.name}>
              {room.name} ({room.count} devices)
            </option>
          ))}
        </select>
      </div>

      {/* Quick Actions */}
      <div className="bg-music-card border border-music-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-music-accent-light mb-4">Quick Actions</h3>
        
        <div className="space-y-3">
          {/* Spotify */}
          <div>
            <p className="text-sm text-gray-400 mb-2">🟢 Spotify</p>
            <div className="flex gap-2 flex-wrap">
              {presets.spotify.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleQuickPlay('spotify', preset)}
                  disabled={!selectedRoom || playLoading}
                  className="px-4 py-2 bg-music-accent hover:bg-music-accent-light text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calm Radio */}
          <div>
            <p className="text-sm text-gray-400 mb-2">🧘 Calm Radio</p>
            <div className="flex gap-2 flex-wrap">
              {presets.calm.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleQuickPlay('calm', preset)}
                  disabled={!selectedRoom || playLoading}
                  className="px-4 py-2 bg-music-accent hover:bg-music-accent-light text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stop */}
          <button
            onClick={handleStop}
            disabled={!selectedRoom || playLoading}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
          >
            ⏹ Stop
          </button>
        </div>
      </div>

      {/* Log */}
      <div className="bg-gray-950 border border-music-border rounded-xl p-4 max-h-48 overflow-y-auto font-mono text-xs">
        {log.length === 0 && <div className="text-gray-500">Logs will appear here...</div>}
        {log.map((entry, i) => (
          <div key={i} className={entry.type === 'err' ? 'text-red-400' : entry.type === 'ok' ? 'text-green-400' : 'text-gray-400'}>
            [{entry.time}] {entry.msg}
          </div>
        ))}
      </div>
    </div>
  )
}

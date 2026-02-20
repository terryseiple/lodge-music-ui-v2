import { useState } from 'react'
import { useMusicAssistant } from '../hooks/useMusicAssistant'
import { useDevices } from '../hooks'

export default function MusicAssistant() {
  const { playMedia, search, loading } = useMusicAssistant()
  const { devices } = useDevices()
  const [selectedDevice, setSelectedDevice] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [mediaType, setMediaType] = useState('track')
  const [log, setLog] = useState([])

  // Filter to MA-compatible devices (Echo devices via MA)
  const maDevices = devices.filter(d => 
    d.name.toLowerCase().includes('echo') ||
    d.id.startsWith('media_player.echo_') ||
    d.id.startsWith('media_player.music_assistant')
  )

  const addLog = (msg, type = 'info') => {
    setLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }])
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    addLog(`🔍 Searching MA library for: "${query}"`, 'info')

    try {
      const searchResults = await search(query, mediaType, 25)
      setResults(searchResults?.items || [])
      addLog(`✅ Found ${searchResults?.items?.length || 0} results`, 'ok')
    } catch (err) {
      addLog(`❌ Search error: ${err.message}`, 'err')
    }
  }

  const handlePlay = async (item) => {
    if (!selectedDevice) {
      addLog('❌ Select a device first', 'err')
      return
    }

    const deviceName = maDevices.find(d => d.id === selectedDevice)?.name || selectedDevice
    addLog(`▶️ Playing "${item.name}" on ${deviceName}`, 'info')

    try {
      await playMedia(selectedDevice, item.uri, mediaType)
      addLog(`✅ Now playing!`, 'ok')
    } catch (err) {
      addLog(`❌ ${err.message}`, 'err')
    }
  }

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-purple-900/20 border border-purple-500 rounded-xl p-4 text-purple-300 text-sm">
        <strong>🎵 Music Assistant (PATH 1 - Full Control)</strong>
        <p className="mt-1 text-xs">
          Full queue control via MA's Alexa skill. Supports Spotify, Qobuz, YouTube, local files & more!
        </p>
        <p className="mt-1 text-xs text-purple-400">
          36 Alexa players available • All MA providers • Queue management • Metadata
        </p>
      </div>

      {/* Device Selection */}
      <div className="bg-music-card border border-music-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-music-accent-light mb-4">Select Alexa Player</h3>
        
        {loading && <p className="text-gray-400 mb-4">Loading...</p>}
        
        {maDevices.length === 0 ? (
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-3 text-yellow-400 text-sm">
            <strong>⚠️ No MA players found</strong>
            <p className="text-xs mt-1">Make sure Music Assistant Alexa integration is configured</p>
          </div>
        ) : (
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full bg-gray-900 border border-music-border rounded-lg px-4 py-2 text-gray-200"
          >
            <option value="">Choose Alexa player...</option>
            {maDevices.map(device => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Search */}
      <div className="bg-music-card border border-music-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-music-accent-light mb-4">Search Music</h3>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="bg-gray-900 border border-music-border rounded-lg px-3 py-2 text-gray-200"
            >
              <option value="track">Tracks</option>
              <option value="album">Albums</option>
              <option value="artist">Artists</option>
              <option value="playlist">Playlists</option>
            </select>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search MA library..."
              className="flex-1 bg-gray-900 border border-music-border rounded-lg px-4 py-2 text-gray-200"
            />

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Quick Searches */}
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">Quick Searches:</p>
          <div className="flex gap-2 flex-wrap">
            {['rock', 'jazz', 'classical', 'electronic'].map(genre => (
              <button
                key={genre}
                onClick={() => { setQuery(genre); setMediaType('track'); }}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-music-border rounded-lg text-sm capitalize"
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-music-card border border-music-border rounded-xl p-6">
          <h3 className="text-lg font-medium text-music-accent-light mb-4">
            Results ({results.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg border border-transparent hover:border-music-border"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-400">
                    {item.artist?.name || item.artists?.[0]?.name || 'Unknown Artist'}
                  </div>
                  {item.album?.name && (
                    <div className="text-xs text-gray-500">{item.album.name}</div>
                  )}
                </div>
                <button
                  onClick={() => handlePlay(item)}
                  disabled={!selectedDevice}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  ▶ Play
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log */}
      <div className="bg-gray-950 border border-music-border rounded-xl p-4 max-h-48 overflow-y-auto font-mono text-xs">
        {log.length === 0 && (
          <div className="text-gray-500">Activity log will appear here...</div>
        )}
        {log.map((entry, i) => (
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

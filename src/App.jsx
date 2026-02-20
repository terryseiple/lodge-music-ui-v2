import { useState, useEffect } from 'react'
import './App.css'

const MA_BASE_URL = '/api'
const MA_TOKEN = '5DQ9XdXwjnnPUyDTk1ewSJ1gptO0dkvk4UiRzqkFEy8LWANpZ3h7zPdweR__Th-P'

function App() {
  const [activeTab, setActiveTab] = useState('play')
  const [players, setPlayers] = useState([])
  const [providers, setProviders] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [nowPlaying, setNowPlaying] = useState(null)
  const [queue, setQueue] = useState(null)

  useEffect(() => {
    fetchPlayers()
    fetchProviders()
  }, [])

  useEffect(() => {
    if (!selectedPlayer) return
    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 2000)
    return () => clearInterval(interval)
  }, [selectedPlayer])

  const callMACommand = async (command, args = {}) => {
    try {
      const response = await fetch(`${MA_BASE_URL}/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MA_TOKEN}`
        },
        body: JSON.stringify({
          message_id: `cmd_${Date.now()}`,
          command,
          args
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (e) {
      console.error('MA API Error:', e)
      setError(`API Error: ${e.message}`)
      throw e
    }
  }

  const fetchPlayers = async () => {
    try {
      setError(null)
      const data = await callMACommand('players/all')
      const available = data.filter(p => p.available && p.enabled)
      setPlayers(available)
      console.log(`✅ Loaded ${available.length} players`)
    } catch (e) {
      console.error('Failed to fetch players:', e)
    }
  }

  const fetchProviders = async () => {
    try {
      const data = await callMACommand('providers')
      const musicProviders = data.filter(p => 
        p.type === 'music' && p.available && p.instance_id !== 'builtin'
      )
      setProviders(musicProviders)
      console.log(`✅ Loaded ${musicProviders.length} music providers`)
    } catch (e) {
      console.error('Failed to fetch providers:', e)
    }
  }

  const fetchNowPlaying = async () => {
    if (!selectedPlayer) return
    try {
      const playerData = await callMACommand('players/get', { player_id: selectedPlayer })
      setNowPlaying(playerData)
      console.log('Player data:', playerData)
      
      const queueData = await callMACommand('player_queues/get', { queue_id: selectedPlayer })
      setQueue(queueData)
      console.log('Queue data:', queueData)
    } catch (e) {
      console.error('Fetch now playing failed:', e)
    }
  }

  const search = async () => {
    if (!searchQuery) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await callMACommand('music/search', {
        search_query: searchQuery,
        media_types: ['track'],
        limit: 20
      })
      
      let results = data.tracks || []
      
      if (selectedProvider !== 'all') {
        results = results.filter(track => track.provider === selectedProvider)
        console.log(`✅ Filtered to ${results.length} tracks from ${selectedProvider}`)
      } else {
        console.log(`✅ Found ${results.length} tracks from all providers`)
      }
      
      setSearchResults(results)
    } catch (e) {
      console.error('Search failed:', e)
    }
    setLoading(false)
  }

  const playTrack = async (track) => {
    if (!selectedPlayer) {
      alert('Please select a device first!')
      return
    }
    
    setError(null)
    setSuccess(null)
    
    try {
      await callMACommand('player_queues/play_media', {
        queue_id: selectedPlayer,
        media: [track.uri]
      })
      
      setSuccess(`✅ Now playing: ${track.name}`)
      setTimeout(() => setSuccess(null), 3000)
      setTimeout(fetchNowPlaying, 500)
    } catch (e) {
      console.error('Play failed:', e)
      setError(`Play failed: ${e.message}`)
    }
  }

  const controlPlayback = async (action) => {
    if (!selectedPlayer) return
    try {
      await callMACommand(`player_queues/${action}`, { queue_id: selectedPlayer })
      setTimeout(fetchNowPlaying, 300)
    } catch (e) {
      console.error(`${action} failed:`, e)
    }
  }

  const setVolume = async (volume) => {
    if (!selectedPlayer) return
    try {
      // MA volume is 0-100, not 0-1
      await callMACommand('players/cmd/volume_set', { 
        player_id: selectedPlayer,
        volume_level: parseInt(volume)
      })
      setTimeout(fetchNowPlaying, 300)
    } catch (e) {
      console.error('Volume set failed:', e)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>🎵 Lodge Music</h1>
        <div className="tabs">
          <button 
            className={activeTab === 'play' ? 'active' : ''} 
            onClick={() => setActiveTab('play')}
          >
            🎵 Play Music
          </button>
          <button 
            className={activeTab === 'nowplaying' ? 'active' : ''} 
            onClick={() => setActiveTab('nowplaying')}
          >
            🎮 Now Playing
          </button>
          <button 
            className={activeTab === 'status' ? 'active' : ''} 
            onClick={() => setActiveTab('status')}
          >
            ⚙️ Status
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}
      
      {success && (
        <div className="success-banner">
          {success}
        </div>
      )}

      <main>
        {activeTab === 'play' && (
          <div className="play-tab">
            <div className="controls-row">
              <div className="device-selector">
                <label>🔊 Device:</label>
                <select 
                  value={selectedPlayer || ''} 
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                >
                  <option value="">-- Choose Device --</option>
                  {players.map(p => (
                    <option key={p.player_id} value={p.player_id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="provider-selector">
                <label>🎵 Provider:</label>
                <select 
                  value={selectedProvider} 
                  onChange={(e) => setSelectedProvider(e.target.value)}
                >
                  <option value="all">All Providers</option>
                  {providers.map(p => (
                    <option key={p.instance_id} value={p.domain}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search for music..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && search()}
              />
              <button onClick={search} disabled={loading}>
                {loading ? '⏳' : '🔍'} Search
              </button>
            </div>

            <div className="search-results">
              {searchResults.map((track, i) => (
                <div key={i} className="track-item">
                  <div className="track-info">
                    <div className="track-title">{track.name}</div>
                    <div className="track-artist">{track.artists?.map(a => a.name).join(', ')}</div>
                    {track.album && <div className="track-album">{track.album.name}</div>}
                    <div className="track-provider">📦 {track.provider}</div>
                  </div>
                  <button onClick={() => playTrack(track)}>▶️ Play</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'nowplaying' && (
          <div className="nowplaying-tab">
            {nowPlaying && nowPlaying.current_media ? (
              <>
                <div className="now-playing-card">
                  {nowPlaying.current_media.image_url && (
                    <img 
                      src={nowPlaying.current_media.image_url} 
                      alt="Album art"
                      className="album-art-large"
                    />
                  )}
                  <h2>{nowPlaying.current_media.title}</h2>
                  <p className="artist">{nowPlaying.current_media.artist}</p>
                  {nowPlaying.current_media.album && (
                    <p className="album">{nowPlaying.current_media.album}</p>
                  )}
                  <div className="playback-state">State: {nowPlaying.state}</div>
                </div>

                <div className="playback-controls">
                  <div className="main-controls">
                    <button onClick={() => controlPlayback('previous')} className="control-btn">
                      ⏮️
                    </button>
                    <button 
                      onClick={() => controlPlayback(nowPlaying.state === 'playing' ? 'pause' : 'play')} 
                      className="control-btn play-pause"
                    >
                      {nowPlaying.state === 'playing' ? '⏸️' : '▶️'}
                    </button>
                    <button onClick={() => controlPlayback('next')} className="control-btn">
                      ⏭️
                    </button>
                  </div>

                  <div className="volume-control">
                    <span className="volume-icon">🔊</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={nowPlaying.volume_level || 0}
                      onChange={(e) => setVolume(e.target.value)}
                      className="volume-slider"
                    />
                    <span className="volume-value">
                      {nowPlaying.volume_level || 0}%
                    </span>
                  </div>
                </div>

                {queue && queue.items && queue.items.length > 0 && (
                  <div className="queue-section">
                    <h3>Queue ({queue.items.length} tracks)</h3>
                    <div className="queue-list">
                      {queue.items.map((item, i) => (
                        <div key={i} className={`queue-item ${i === queue.current_index ? 'current' : ''}`}>
                          <span className="queue-number">{i + 1}</span>
                          <div className="queue-info">
                            <div className="queue-title">{item.name}</div>
                            <div className="queue-artist">{item.artists?.map(a => a.name).join(', ') || 'Unknown'}</div>
                          </div>
                          {i === queue.current_index && <span className="now-playing-indicator">▶️</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>Nothing playing right now</p>
                <p>Select a device and search for music to get started!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'status' && (
          <div className="status-tab">
            <h2>System Status</h2>
            <div className="status-info">
              <div className="stat">
                <label>Music Assistant</label>
                <span className="value">{players.length > 0 ? '✅ Connected' : '⚠️ Loading...'}</span>
              </div>
              <div className="stat">
                <label>Available Devices</label>
                <span className="value">{players.length}</span>
              </div>
              <div className="stat">
                <label>Music Providers</label>
                <span className="value">{providers.length}</span>
              </div>
              <div className="stat">
                <label>Selected Device</label>
                <span className="value">{selectedPlayer ? players.find(p => p.player_id === selectedPlayer)?.name : 'None'}</span>
              </div>
              {nowPlaying && (
                <>
                  <div className="stat">
                    <label>Playback State</label>
                    <span className="value">{nowPlaying.state || 'unknown'}</span>
                  </div>
                  <div className="stat">
                    <label>Volume</label>
                    <span className="value">{nowPlaying.volume_level || 0}%</span>
                  </div>
                  <div className="stat">
                    <label>Current Media</label>
                    <span className="value">{nowPlaying.current_media?.title || 'None'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

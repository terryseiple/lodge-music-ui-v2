import { useState } from 'react'
import { useCast, useOrchestrator, useDevices } from '../hooks'

export default function YouTubeMusic() {
  const { searchYouTubeMusic, loading } = useCast()
  const { play } = useOrchestrator()
  const { rooms } = useDevices()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedRoom, setSelectedRoom] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    const data = await searchYouTubeMusic(query)
    setResults(data || [])
  }

  const handlePlay = async (videoId, title) => {
    if (!selectedRoom) {
      alert('Select a room first')
      return
    }

    try {
      await play({
        source: 'ytmusic',
        room: selectedRoom,
        video_id: videoId,
      })
      alert(`Playing: ${title}`)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-music-card border border-music-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-music-accent-light mb-4">YouTube Music Search</h3>
        
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="w-full bg-gray-900 border border-music-border rounded-lg px-4 py-2 text-gray-200 mb-4"
        >
          <option value="">Select room...</option>
          {rooms.map(room => (
            <option key={room.name} value={room.name}>{room.name}</option>
          ))}
        </select>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for songs, artists, albums..."
            className="flex-1 bg-gray-900 border border-music-border rounded-lg px-4 py-2 text-gray-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-music-accent hover:bg-music-accent-light text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-music-card border border-music-border rounded-xl p-6">
          <h3 className="text-lg font-medium text-music-accent-light mb-4">Results</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg border border-transparent hover:border-music-border"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-400">{item.artist}</div>
                </div>
                <button
                  onClick={() => handlePlay(item.videoId, item.title)}
                  className="px-4 py-2 bg-music-accent hover:bg-music-accent-light text-white rounded-lg text-sm"
                >
                  ▶ Play
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useSpotify, useOrchestrator, useDevices } from '../hooks'

export default function Spotify() {
  const { search, searching, results } = useSpotify()
  const { play } = useOrchestrator()
  const { rooms } = useDevices()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedRoom, setSelectedRoom] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    const data = await search(query)
    if (data?.tracks?.items) {
      setSearchResults(data.tracks.items)
    }
  }

  const handlePlay = async (uri, name) => {
    if (!selectedRoom) {
      alert('Select a room first')
      return
    }

    try {
      await play({
        source: 'spotify',
        room: selectedRoom,
        uri,
      })
      alert(`Playing: ${name}`)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-music-card border border-music-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-music-accent-light mb-4">🟢 Spotify Search</h3>
        
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
            placeholder="Search Spotify..."
            className="flex-1 bg-gray-900 border border-music-border rounded-lg px-4 py-2 text-gray-200"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="bg-music-card border border-music-border rounded-xl p-6">
          <h3 className="text-lg font-medium text-music-accent-light mb-4">Results</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg border border-transparent hover:border-music-border"
              >
                <div className="flex-1">
                  <div className="font-medium">{track.name}</div>
                  <div className="text-sm text-gray-400">
                    {track.artists.map(a => a.name).join(', ')}
                  </div>
                </div>
                <button
                  onClick={() => handlePlay(track.uri, track.name)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
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

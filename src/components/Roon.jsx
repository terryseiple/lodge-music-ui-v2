import { useState, useEffect } from 'react'
import { useRoon } from '../hooks'

export default function Roon() {
  const { getZones, play, pause, next, prev, stop, zones, loading } = useRoon()
  const [selectedZone, setSelectedZone] = useState('')

  useEffect(() => {
    getZones()
  }, [])

  const handleControl = async (action) => {
    if (!selectedZone) {
      alert('Select a zone first')
      return
    }

    try {
      await action(selectedZone)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-music-card border border-music-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-music-accent-light mb-4">🎶 Roon Control</h3>
        
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="w-full bg-gray-900 border border-music-border rounded-lg px-4 py-2 text-gray-200 mb-4"
        >
          <option value="">Select zone...</option>
          {zones.map(zone => (
            <option key={zone.zone_id} value={zone.zone_id}>
              {zone.display_name}
            </option>
          ))}
        </select>

        {loading && <p className="text-gray-400 text-sm">Loading zones...</p>}
      </div>

      {/* Transport Controls */}
      <div className="bg-music-card border border-music-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-music-accent-light mb-4">Transport</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={() => handleControl(play)}
            disabled={!selectedZone}
            className="px-4 py-3 bg-music-accent hover:bg-music-accent-light text-white rounded-lg disabled:opacity-50"
          >
            ▶ Play
          </button>
          <button
            onClick={() => handleControl(pause)}
            disabled={!selectedZone}
            className="px-4 py-3 bg-music-accent hover:bg-music-accent-light text-white rounded-lg disabled:opacity-50"
          >
            ⏸ Pause
          </button>
          <button
            onClick={() => handleControl(prev)}
            disabled={!selectedZone}
            className="px-4 py-3 bg-music-accent hover:bg-music-accent-light text-white rounded-lg disabled:opacity-50"
          >
            ⏮ Prev
          </button>
          <button
            onClick={() => handleControl(next)}
            disabled={!selectedZone}
            className="px-4 py-3 bg-music-accent hover:bg-music-accent-light text-white rounded-lg disabled:opacity-50"
          >
            ⏭ Next
          </button>
          <button
            onClick={() => handleControl(stop)}
            disabled={!selectedZone}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
          >
            ⏹ Stop
          </button>
        </div>
      </div>
    </div>
  )
}

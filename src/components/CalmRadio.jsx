import { useState, useEffect } from 'react'
import { useCast, useOrchestrator, useDevices } from '../hooks'

export default function CalmRadio() {
  const { getCalmCategories, getCalmChannels, loading } = useCast()
  const { play } = useOrchestrator()
  const { rooms } = useDevices()
  const [categories, setCategories] = useState([])
  const [channels, setChannels] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      loadChannels(selectedCategory)
    } else {
      loadChannels()
    }
  }, [selectedCategory])

  const loadCategories = async () => {
    const cats = await getCalmCategories()
    setCategories(cats || [])
  }

  const loadChannels = async (category = '') => {
    const chans = await getCalmChannels(category)
    setChannels(chans || [])
  }

  const handlePlay = async (channel) => {
    if (!selectedRoom) {
      alert('Select a room first')
      return
    }

    try {
      await play({
        source: 'calm',
        room: selectedRoom,
        channel: channel.name || channel.id,
      })
      alert(`Playing: ${channel.title}`)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-music-card border border-music-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-music-accent-light mb-4">🧘 Calm Radio</h3>
        
        <div className="space-y-3">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="w-full bg-gray-900 border border-music-border rounded-lg px-4 py-2 text-gray-200"
          >
            <option value="">Select room...</option>
            {rooms.map(room => (
              <option key={room.name} value={room.name}>{room.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-gray-900 border border-music-border rounded-lg px-4 py-2 text-gray-200"
          >
            <option value="">All Categories ({channels.length} channels)</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>
                {cat.name} ({cat.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Channels Grid */}
      {loading ? (
        <div className="bg-music-card border border-music-border rounded-xl p-6 text-center text-gray-400">
          Loading channels...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {channels.map((channel, i) => (
            <button
              key={i}
              onClick={() => handlePlay(channel)}
              className="bg-music-card border border-music-border hover:border-music-accent rounded-lg p-3 text-left transition-colors"
            >
              <div className="font-medium text-sm">{channel.title}</div>
              {channel.category && (
                <div className="text-xs text-gray-400 mt-1">{channel.category}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

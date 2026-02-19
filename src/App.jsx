import { useState } from 'react'
import QuickPlay from './components/QuickPlay'
import YouTubeMusic from './components/YouTubeMusic'
import Spotify from './components/Spotify'
import CalmRadio from './components/CalmRadio'
import Roon from './components/Roon'
import Status from './components/Status'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('play')

  const tabs = [
    { id: 'play', label: '▶ Quick Play', component: QuickPlay },
    { id: 'ytmusic', label: '🎵 YouTube Music', component: YouTubeMusic },
    { id: 'spotify', label: '🟢 Spotify', component: Spotify },
    { id: 'calm', label: '🧘 Calm Radio', component: CalmRadio },
    { id: 'roon', label: '🎶 Roon', component: Roon },
    { id: 'status', label: '⚙ Status', component: Status },
  ]

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component

  return (
    <div className="min-h-screen bg-music-bg text-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-semibold">🎵 Lodge Music</h1>
          <span className="text-sm text-gray-500">Test Console</span>
          <div className="w-2 h-2 rounded-full bg-green-500 ml-auto"></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-music-border mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-music-accent-light border-b-2 border-music-accent'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  )
}

export default App

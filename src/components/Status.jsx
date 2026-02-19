import { useState, useEffect } from 'react'
import { useOrchestrator, API_ENDPOINTS } from '../hooks'

export default function Status() {
  const { getStatus } = useOrchestrator()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 10000) // Every 10s
    return () => clearInterval(interval)
  }, [])

  const checkStatus = async () => {
    setLoading(true)
    
    const checks = [
      { name: 'Orchestrator', url: `${API_ENDPOINTS.ORCHESTRATOR}/status` },
      { name: 'Spotify', url: `${API_ENDPOINTS.SPOTIFY}/health` },
      { name: 'Roon', url: `${API_ENDPOINTS.ROON}/health` },
      { name: 'Cast/YTM/Calm', url: `${API_ENDPOINTS.CAST}/health` },
      { name: 'Volume', url: `${API_ENDPOINTS.VOLUME}/health` },
    ]

    const results = await Promise.all(
      checks.map(async (check) => {
        try {
          const response = await fetch(check.url)
          const ok = response.ok
          return { ...check, status: ok ? 'online' : 'offline' }
        } catch (err) {
          return { ...check, status: 'offline' }
        }
      })
    )

    setServices(results)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-music-card border border-music-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-music-accent-light">System Status</h3>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="px-4 py-2 bg-music-accent hover:bg-music-accent-light text-white rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Refresh'}
          </button>
        </div>

        <div className="space-y-3">
          {services.map((service, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  service.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">{service.name}</span>
              </div>
              <div className="text-sm">
                <span className={service.status === 'online' ? 'text-green-400' : 'text-red-400'}>
                  {service.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="bg-music-card border border-music-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-music-accent-light mb-4">API Endpoints</h3>
        <div className="space-y-2 font-mono text-xs text-gray-400">
          <div>Orchestrator: {API_ENDPOINTS.ORCHESTRATOR}</div>
          <div>Spotify: {API_ENDPOINTS.SPOTIFY}</div>
          <div>Roon: {API_ENDPOINTS.ROON}</div>
          <div>Cast: {API_ENDPOINTS.CAST}</div>
          <div>Volume: {API_ENDPOINTS.VOLUME}</div>
        </div>
      </div>
    </div>
  )
}

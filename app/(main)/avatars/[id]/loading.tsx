import { preconnect } from 'react-dom'

export default function AvatarsLoading() {
  preconnect('https://cdn.azron.net', { crossOrigin: 'anonymous' })
  return (
    <div className="avatars-wrap st-wrap">
      <div className="container">
        <div className="st-header avatars-loading-header">
          <div className="st-header-top">
            <div className="st-header-left">
              <span className="av-user-icon av-skeleton-circle" aria-hidden />
              <span className="av-skeleton-title" aria-hidden />
            </div>
            <span className="av-skeleton-subtitle" aria-hidden />
          </div>
          <div className="st-header-stats">
            <div className="st-hstat-col av-skeleton-stat-col" aria-hidden />
            <div className="st-hstat-col av-skeleton-stat-col" aria-hidden />
          </div>
        </div>
        <div className="avatars-grid" aria-busy="true" aria-label="Loading avatars">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="avatar-card avatar-card--skeleton" aria-hidden>
              <div className="avatar-card-media av-skeleton-media" />
              <div className="avatar-card-foot">
                <span className="av-skeleton-line av-skeleton-line--date" />
                <span className="av-skeleton-line av-skeleton-line--meta" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/RootStore'

const PeakSeasonBanner = observer(function PeakSeasonBanner() {
  const { settings } = useRootStore()
  const active = settings.getBool('peak_season_mode', false)
  const text = settings.get('peak_season_banner_text', '')

  if (!active || !text) return null

  return (
    <div style={{
      background: '#f59e0b',
      color: '#fff',
      textAlign: 'center',
      padding: '8px 16px',
      fontSize: 13,
      fontWeight: 500,
    }}>
      {text}
    </div>
  )
})

export default PeakSeasonBanner

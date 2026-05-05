import { Drawer, Input, Switch } from 'antd'
import './BadgeNamesDrawer.css'

const { TextArea } = Input

export interface BadgeNamesData {
  names: string            // newline-separated
  textPosition: 'top' | 'bottom'
}

export const EMPTY_BADGE_NAMES: BadgeNamesData = {
  names: '',
  textPosition: 'top',
}

export function countBadgeNames(data: BadgeNamesData): number {
  return data.names.split('\n').filter(l => l.trim() !== '').length
}

export function getBadgeNamesList(data: BadgeNamesData): string[] {
  return data.names.split('\n').map(l => l.trim()).filter(l => l.length > 0)
}

interface Props {
  open: boolean
  onClose: () => void
  data: BadgeNamesData
  onChange: (data: BadgeNamesData) => void
}

export default function BadgeNamesDrawer({ open, onClose, data, onChange }: Props) {
  const count = countBadgeNames(data)

  return (
    <Drawer
      title="Іменні значки"
      placement="right"
      open={open}
      onClose={onClose}
      width={440}
    >
      <div className="bnd">
        <div className="bnd__field">
          <label className="bnd__label">Позиція імені на значку</label>
          <div className="bnd__position-row">
            <span className={`bnd__pos-label${data.textPosition === 'top' ? ' bnd__pos-label--active' : ''}`}>
              Верхній напис
            </span>
            <Switch
              checked={data.textPosition === 'bottom'}
              onChange={checked => onChange({ ...data, textPosition: checked ? 'bottom' : 'top' })}
            />
            <span className={`bnd__pos-label${data.textPosition === 'bottom' ? ' bnd__pos-label--active' : ''}`}>
              Нижній напис
            </span>
          </div>
          <p className="bnd__pos-hint">
            {data.textPosition === 'top'
              ? "Ім'я замінить верхній напис і відображатиметься по дузі зверху"
              : "Ім'я замінить нижній напис і відображатиметься по дузі знизу"}
          </p>
        </div>

        <div className="bnd__divider" />

        <div className="bnd__field">
          <label className="bnd__label">
            Імена
            <span className="bnd__label-hint"> — кожне з нового рядка</span>
          </label>
          <TextArea
            value={data.names}
            onChange={e => onChange({ ...data, names: e.target.value })}
            placeholder={'Іваненко Марія\nПетренко Олена\nКоваленко Андрій'}
            autoSize={{ minRows: 6, maxRows: 16 }}
          />
          {count > 0 && (
            <p className="bnd__count">
              {count} {count === 1 ? 'значок' : count < 5 ? 'значки' : 'значків'}
            </p>
          )}
        </div>
      </div>
    </Drawer>
  )
}

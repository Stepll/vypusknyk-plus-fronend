import { Drawer, Input, Button } from 'antd'
import './NamesDrawer.css'

const { TextArea } = Input

export interface ClassGroup {
  className: string
  names: string
}

export interface NamesData {
  school: string
  groups: ClassGroup[]
}

export function countNames(groups: ClassGroup[]): number {
  return groups.reduce((total, g) => {
    return total + g.names.split('\n').filter(l => l.trim() !== '').length
  }, 0)
}

interface NamesDrawerProps {
  open: boolean
  onClose: () => void
  data: NamesData
  onChange: (data: NamesData) => void
  hideSchool?: boolean
}

export default function NamesDrawer({ open, onClose, data, onChange, hideSchool = false }: NamesDrawerProps) {
  const canAddGroup = data.groups.every(
    g => g.className.trim() !== '' && g.names.trim() !== ''
  )

  const updateSchool = (value: string) =>
    onChange({ ...data, school: value })

  const updateGroup = (index: number, field: keyof ClassGroup, value: string) => {
    const groups = data.groups.map((g, i) =>
      i === index ? { ...g, [field]: value } : g
    )
    onChange({ ...data, groups })
  }

  const addGroup = () => {
    if (!canAddGroup) return
    onChange({ ...data, groups: [...data.groups, { className: '', names: '' }] })
  }

  return (
    <Drawer
      title="Налаштування іменних стрічок"
      placement="right"
      open={open}
      onClose={onClose}
      width={440}
    >
      <div className="names-drawer">
        {!hideSchool && (
          <>
            <div className="names-drawer__field">
              <label className="names-drawer__label">Навчальний заклад</label>
              <Input
                value={data.school}
                onChange={e => updateSchool(e.target.value)}
                placeholder="необов'язково"
                size="large"
              />
            </div>
            <div className="names-drawer__divider" />
          </>
        )}

        <div className="names-drawer__groups">
          {data.groups.map((group, i) => (
            <div key={i} className="names-drawer__group">
              {data.groups.length > 1 && (
                <p className="names-drawer__group-title">Група {i + 1}</p>
              )}

              <div className="names-drawer__field">
                <label className="names-drawer__label">Клас</label>
                <Input
                  value={group.className}
                  onChange={e => updateGroup(i, 'className', e.target.value)}
                  placeholder="необов'язково"
                />
              </div>

              <div className="names-drawer__field">
                <label className="names-drawer__label">
                  Імена
                  <span className="names-drawer__label-hint"> — кожне з нового рядка</span>
                </label>
                <TextArea
                  value={group.names}
                  onChange={e => updateGroup(i, 'names', e.target.value)}
                  placeholder={'Іваненко Марія\nПетренко Олена\nКоваленко Андрій'}
                  autoSize={{ minRows: 5, maxRows: 14 }}
                />
                {group.names.trim() !== '' && (
                  <p className="names-drawer__names-count">
                    {group.names.split('\n').filter(l => l.trim() !== '').length} імен у групі
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="dashed"
          block
          disabled={!canAddGroup}
          onClick={addGroup}
          className="names-drawer__add-group-btn"
        >
          + Додати клас
        </Button>
      </div>
    </Drawer>
  )
}

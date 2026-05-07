import { Drawer, Input } from 'antd'

const { TextArea } = Input

export interface CertificateNamesData {
  names: string   // newline-separated
}

export const EMPTY_CERTIFICATE_NAMES: CertificateNamesData = { names: '' }

export function countCertificateNames(data: CertificateNamesData): number {
  return data.names.split('\n').filter(l => l.trim() !== '').length
}

export function getCertificateNamesList(data: CertificateNamesData): string[] {
  return data.names.split('\n').map(l => l.trim()).filter(l => l.length > 0)
}

interface Props {
  open: boolean
  onClose: () => void
  data: CertificateNamesData
  onChange: (data: CertificateNamesData) => void
}

export default function CertificateNamesDrawer({ open, onClose, data, onChange }: Props) {
  const count = countCertificateNames(data)

  return (
    <Drawer
      title="Іменні грамоти"
      placement="right"
      open={open}
      onClose={onClose}
      width={440}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
          Вкажіть імена отримувачів — кожне з нового рядка. Ім'я відображатиметься у центрі грамоти.
          Кількість грамот дорівнюватиме кількості імен.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
            Імена
            <span style={{ fontWeight: 400, color: '#9ca3af' }}> — кожне з нового рядка</span>
          </label>
          <TextArea
            value={data.names}
            onChange={e => onChange({ names: e.target.value })}
            placeholder={'Іваненко Марія\nПетренко Олена\nКоваленко Андрій'}
            autoSize={{ minRows: 8, maxRows: 20 }}
          />
          {count > 0 && (
            <p style={{ margin: 0, fontSize: 13, color: '#e91e8c', fontWeight: 600 }}>
              {count} {count === 1 ? 'грамота' : count < 5 ? 'грамоти' : 'грамот'}
            </p>
          )}
        </div>
      </div>
    </Drawer>
  )
}

export type OrderStatus = 'accepted' | 'production' | 'shipped' | 'delivered'

export interface MockOrderItem {
  name: string
  qty: number
  price: number
}

export interface MockOrder {
  id: string
  date: string
  status: OrderStatus
  items: MockOrderItem[]
  total: number
  delivery: {
    method: 'nova-poshta' | 'ukrposhta'
    city?: string
    warehouse?: string
    postalCode?: string
  }
  recipient: {
    fullName: string
    phone: string
  }
  payment: 'cod' | 'online'
  comment?: string
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  accepted:   'Прийнято',
  production: 'У виробництві',
  shipped:    'Відправлено',
  delivered:  'Доставлено',
}

export const STATUS_COLOR: Record<OrderStatus, string> = {
  accepted:   '#f59e0b',
  production: '#3b82f6',
  shipped:    '#7c3aed',
  delivered:  '#10b981',
}

export const STATUS_STEPS: OrderStatus[] = ['accepted', 'production', 'shipped', 'delivered']

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'VIP-A3K9F',
    date: '07 квітня 2026',
    status: 'production',
    items: [
      { name: 'Стрічка: Мій дизайн стрічки', qty: 25, price: 50 },
      { name: 'Медаль "Найкращий випускник"', qty: 25, price: 35 },
    ],
    total: 2125,
    delivery: { method: 'nova-poshta', city: 'Київ', warehouse: 'Відділення №12' },
    recipient: { fullName: 'Коваленко Олена Петрівна', phone: '+380 67 123 45 67' },
    payment: 'cod',
  },
  {
    id: 'VIP-TZ2WQ',
    date: '01 квітня 2026',
    status: 'shipped',
    items: [
      { name: 'Стрічка: Клас 11-А', qty: 30, price: 70 },
    ],
    total: 2100,
    delivery: { method: 'nova-poshta', city: 'Харків', warehouse: 'Поштомат №3841' },
    recipient: { fullName: 'Мельник Андрій Васильович', phone: '+380 50 987 65 43' },
    payment: 'cod',
    comment: 'Саша, Женя — жіночого роду',
  },
  {
    id: 'VIP-BM7YR',
    date: '14 березня 2026',
    status: 'delivered',
    items: [
      { name: 'Стрічка: Випускниця 2026', qty: 15, price: 60 },
      { name: 'Обкладинка для атестату', qty: 15, price: 45 },
    ],
    total: 1575,
    delivery: { method: 'ukrposhta', postalCode: '01001' },
    recipient: { fullName: 'Бондаренко Ірина Сергіївна', phone: '+380 93 456 78 90' },
    payment: 'online',
  },
]

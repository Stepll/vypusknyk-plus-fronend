export type RibbonColor = 'coral' | 'blue-yellow' | 'white' | 'gold' | 'red' | 'green' | 'purple' | 'black'
export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'name-asc'

export interface Product {
  id: number
  name: string
  categoryId: number
  categoryName: string
  subcategoryId: number | null
  subcategoryName: string | null
  color?: RibbonColor
  price: number
  minOrder: number
  popular: boolean
  isNew: boolean
  description: string
  tags: string[]
  imageUrl?: string
}

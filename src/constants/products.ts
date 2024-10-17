import type { Product } from '@/types/productsTypes'

export const products: Product[] = [
  {
    id: 'premium',
    name: 'Wolfmed Premium',
    price: 49.99,
    description: 'Tutaj możesz nas wesprzeć. Twoja pomoc pozwoli dalej budować i rozwijać naszą aplikację.',
  },
  {
    id: 'basic',
    name: 'Wolfmed Basic',
    price: 14.99,
    description: 'Wspieraj nas w mniejszym zakresie. Każda pomoc jest cenna dla rozwoju naszej aplikacji.',
  },
]

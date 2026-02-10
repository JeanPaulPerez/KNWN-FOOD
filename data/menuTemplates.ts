
import { MenuItem, MenuCategory, DayMenu } from '../types';

const BASE_ITEMS: Record<string, MenuItem[]> = {
  bowls: [
    { id: 'b1', name: 'Miso-Ginger Tofu Bowl', description: 'Silken tofu, edamame, shredded carrots, forbidden rice, miso dressing.', price: 18, tags: ['Vegan', 'Protein'], image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800' },
    { id: 'b2', name: 'Harissa Cauliflower', description: 'Roasted cauliflower, pomegranate, minted yogurt, warm farro.', price: 17, tags: ['Vegetarian'], image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800' },
    { id: 'b3', name: 'Atlantic Salmon Poké', description: 'Sustainably sourced salmon, avocado, cucumber, spicy mayo.', price: 24, tags: ['High Protein'], image: 'https://images.unsplash.com/photo-1546069901-e7d669255653?auto=format&fit=crop&q=80&w=800' }
  ],
  plates: [
    { id: 'p1', name: 'Braised Short Rib', description: '12-hour red wine reduction, truffle parsnip purée, crispy shallots.', price: 28, popular: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800' },
    { id: 'p2', name: 'Lemon Thyme Chicken', description: 'Free-range chicken, heirloom carrots, salsa verde.', price: 22, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800' },
    { id: 'p3', name: 'Wild Mushroom Risotto', description: 'Foraged mushrooms, parmesan reggiano, white truffle oil.', price: 21, tags: ['Signature'], image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=800' }
  ],
  sides: [
    { id: 's1', name: 'Truffle Fries', description: 'Hand-cut, double-fried, rosemary salt.', price: 9, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800' },
    { id: 's2', name: 'Charred Broccolini', description: 'Chili flakes, lemon zest, toasted almonds.', price: 8, image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=800' }
  ]
};

export function getMenuForDate(date: Date): DayMenu | null {
  const day = date.getDay();
  if (day === 0 || day === 6) return null; // Weekend closed

  // Deterministic seed based on YYYYMMDD
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const rng = (i: number) => (seed * (i + 1)) % 3; // Simple deterministic index

  const categories: MenuCategory[] = [
    {
      categoryName: 'Daily Selection',
      items: [
        BASE_ITEMS.bowls[rng(0)],
        BASE_ITEMS.plates[rng(2)]
      ]
    }
  ];

  return { categories };
}

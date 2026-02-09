
import { DayMenu, Weekday } from '../types';

export const MENUS: Record<Weekday, DayMenu> = {
  monday: {
    categories: [
      {
        categoryName: "Signature Bowls",
        items: [
          {
            id: "m1",
            name: "Harissa Roasted Cauliflower Bowl",
            description: "Spiced cauliflower, black lentils, wild arugula, minted yogurt, and pomegranate seeds.",
            price: 18,
            tags: ["Vegan Option", "Gluten-Free"],
            calories: 520,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
            popular: true
          },
          {
            id: "m2",
            name: "Miso Glazed Salmon",
            description: "Sustainable Atlantic salmon, charred baby bok choy, forbidden rice, ginger-scallion oil.",
            price: 24,
            tags: ["High-Protein"],
            calories: 680,
            image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800"
          }
        ]
      },
      {
        categoryName: "Small Plates",
        items: [
          {
            id: "m3",
            name: "Whipped Feta & Honey",
            description: "Creamy Greek feta, local wildflower honey, toasted sourdough, cracked black pepper.",
            price: 12,
            tags: ["Vegetarian"],
            image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=800"
          }
        ]
      }
    ]
  },
  tuesday: {
    categories: [
      {
        categoryName: "Chef's Plates",
        items: [
          {
            id: "t1",
            name: "Braised Short Rib Rigatoni",
            description: "12-hour red wine braised beef, hand-cut pasta, pecorino romano, fresh basil.",
            price: 26,
            tags: ["Signature"],
            calories: 840,
            image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800",
            popular: true
          },
          {
            id: "t2",
            name: "Lemon Thyme Chicken",
            description: "Free-range breast, heirloom carrots, smashed fingerling potatoes, salsa verde.",
            price: 22,
            tags: ["Gluten-Free"],
            calories: 610,
            image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800"
          }
        ]
      }
    ]
  },
  wednesday: {
    categories: [
      {
        categoryName: "Pacific Rim",
        items: [
          {
            id: "w1",
            name: "Spicy Ahi Tuna Poke",
            description: "Sashimi-grade tuna, edamame, pickled radish, spicy mayo, furikake seasoning.",
            price: 20,
            tags: ["Healthy", "High-Protein"],
            calories: 490,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
            popular: true
          }
        ]
      }
    ]
  },
  thursday: {
    categories: [
      {
        categoryName: "Garden & Soil",
        items: [
          {
            id: "th1",
            name: "Wild Mushroom Risotto",
            description: "Arborio rice, seasonal foraged mushrooms, truffle oil, parmesan reggiano.",
            price: 21,
            tags: ["Vegetarian", "Gluten-Free"],
            calories: 580,
            image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=800"
          }
        ]
      }
    ]
  },
  friday: {
    categories: [
      {
        categoryName: "Weekend Warmup",
        items: [
          {
            id: "f1",
            name: "Double Wagyu Burger",
            description: "Wagyu beef patties, aged cheddar, caramelized onions, truffle aioli, brioche bun.",
            price: 24,
            tags: ["Indulgent"],
            calories: 980,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
            popular: true
          },
          {
            id: "f2",
            name: "Hand-Cut Truffle Fries",
            description: "Double fried russet potatoes, truffle salt, parsley, garlic dip.",
            price: 10,
            tags: ["Vegetarian"],
            image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800"
          }
        ]
      }
    ]
  }
};

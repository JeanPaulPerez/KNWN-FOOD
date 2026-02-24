
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  tags?: string[];
  calories?: number;
  image: string;
  popular?: boolean;
  wooProductId?: number;
  customizationOptions?: {
    bases?: string[];
    sauces?: string[];
    dislikes?: string[];
    hasVegetarianOption?: {
      label: string;
      instructions?: string;
    };
    swaps?: string[];
  };
}

export interface MenuCategory {
  categoryName: string;
  items: MenuItem[];
}

export interface DayMenu {
  dateLabel?: string;
  categories: MenuCategory[];
}

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface CartItem extends MenuItem {
  quantity: number;
  serviceDate: string;
  customizations?: {
    base?: string;
    protein?: string;
    sauce?: string;
    avoid?: string;
    isVegetarian?: boolean;
    vegInstructions?: string;
    swap?: string;
  };
}

export interface OrderPayload {
  name: string;
  email: string;
  phone: string;
  type: 'delivery';
  address: {
    street: string;
    city: string;
    zip: string;
  };
  notes?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  serviceDay: string;
}

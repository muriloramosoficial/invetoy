export interface Plan {
  id: string;
  name: string;
  description: string;
  price_brl: number;
  features: string[];
  limits: {
    products: number;
    users: number;
    locations: number;
  };
}

export interface PopulatedCategories {
    category: string;
    value: string;
    count: number;
  }
  
  export interface CategoryPageProps {
    params:Promise<{ value: string }>;
  }
  
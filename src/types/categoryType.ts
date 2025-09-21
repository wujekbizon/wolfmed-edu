export interface Categories {
    category: string;
    value: string;
  }
  
  export interface CategoryPageProps {
    params:Promise<{ value: string }>;
  }
  
interface Item {
  label: string;
  value: string;
}

interface Category {
  title: string;
  children?: string[];
}

export default interface Filters {
  brands: Item[];
  others: Item[];
  colors: string[];
  categories: Category[];
}

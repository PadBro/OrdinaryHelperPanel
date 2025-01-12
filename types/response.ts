export type PaginationLink = {
  active: boolean;
  label: string;
  url: string;
};

export type Links = {
  first: string;
  last: string;
  prev: string;
  next: string;
};

export type Meta = {
  current_page: number;
  from: number;
  last_page: number;
  links: PaginationLink[];
  path: string;
  per_page: number;
  to: number;
  total: number;
};

export type PaginatedResponse<T> = {
  data: T;
  links: Links;
  meta: Meta;
};

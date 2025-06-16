export interface Template {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  fileUrl?: string;
  fileName?: string;
  createdAt?: string;
  updatedAt?: string;
  delFlag?: boolean;
}

export interface TemplateFormData {
  code: string;
  name: string;
  description?: string;
  type: string;
  file?: File;
}

export interface TemplateResponse {
  data: Template[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

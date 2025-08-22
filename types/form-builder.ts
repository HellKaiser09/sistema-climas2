export interface BaseField {
  id: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea' | 'file' | 'image';
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
}

export interface TextField extends BaseField {
  type: 'text' | 'email';
  minLength?: number;
  maxLength?: number;
}

export interface NumberField extends BaseField {
  type: 'number';
  min?: number;
  max?: number;
}

export interface SelectField extends BaseField {
  type: 'select';
  options: Array<{
    value: string;
    label: string;
  }>;
  multiple?: boolean;
}

export interface CheckboxField extends BaseField {
  type: 'checkbox';
  defaultValue?: boolean;
}

export interface TextareaField extends BaseField {
  type: 'textarea';
  rows?: number;
  maxLength?: number;
}

export interface FileField extends BaseField {
  type: 'file' | 'image';
  acceptedTypes?: string[];
  maxSize?: number; // in MB
}

export type FormField = TextField | NumberField | SelectField | CheckboxField | TextareaField | FileField;

export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  submitButtonText?: string;
  createdAt: string;
  updatedAt: string;
  shareToken?: string;
}

export interface FormResponse {
  id: string;
  formConfigId: string;
  responses: Record<string, any>;
  submittedAt: string;
}
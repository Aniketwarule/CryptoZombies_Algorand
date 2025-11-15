import { z } from 'zod';

// Common validation schemas
export const ValidationSchemas = {
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  algorandAddress: z.string().length(58, 'Invalid Algorand address').regex(/^[A-Z2-7]+$/, 'Invalid Algorand address format'),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonEmptyString: z.string().min(1, 'This field is required'),
  url: z.string().url('Please enter a valid URL'),
  phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
};

// Form validation utility
export class FormValidator {
  private errors: Record<string, string> = {};
  private schema: z.ZodSchema | null = null;

  constructor(schema?: z.ZodSchema) {
    this.schema = schema;
  }

  // Validate a single field
  validateField(name: string, value: any, schema: z.ZodSchema): boolean {
    try {
      schema.parse(value);
      this.clearFieldError(name);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.setFieldError(name, error.errors[0]?.message || 'Validation failed');
      }
      return false;
    }
  }

  // Validate entire form
  validateForm(data: Record<string, any>): boolean {
    if (!this.schema) {
      throw new Error('No schema provided for form validation');
    }

    try {
      this.schema.parse(data);
      this.clearAllErrors();
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.setErrors(error);
      }
      return false;
    }
  }

  // Validate specific fields
  validateFields(data: Record<string, any>, fieldSchemas: Record<string, z.ZodSchema>): boolean {
    let isValid = true;
    
    Object.entries(fieldSchemas).forEach(([fieldName, schema]) => {
      const fieldValue = data[fieldName];
      if (!this.validateField(fieldName, fieldValue, schema)) {
        isValid = false;
      }
    });

    return isValid;
  }

  private setErrors(zodError: z.ZodError): void {
    this.errors = {};
    zodError.errors.forEach(error => {
      const path = error.path.join('.');
      this.errors[path] = error.message;
    });
  }

  private setFieldError(name: string, message: string): void {
    this.errors[name] = message;
  }

  private clearFieldError(name: string): void {
    delete this.errors[name];
  }

  private clearAllErrors(): void {
    this.errors = {};
  }

  getErrors(): Record<string, string> {
    return { ...this.errors };
  }

  getFieldError(name: string): string | undefined {
    return this.errors[name];
  }

  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  hasFieldError(name: string): boolean {
    return !!this.errors[name];
  }
}

// Specific validation functions
export const validateAlgorandAddress = (address: string): boolean => {
  if (!address || address.length !== 58) return false;
  
  // Basic Algorand address validation
  const addressRegex = /^[A-Z2-7]+$/;
  return addressRegex.test(address);
};

export const validateAlgoAmount = (amount: string | number): { isValid: boolean; error?: string } => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (numAmount > 1000000) {
    return { isValid: false, error: 'Amount is too large' };
  }
  
  // Check for too many decimal places (Algorand supports up to 6 decimal places)
  const decimalPlaces = (numAmount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 6) {
    return { isValid: false, error: 'Maximum 6 decimal places allowed' };
  }
  
  return { isValid: true };
};

export const validateCodeInput = (code: string, language: 'pyteal' | 'teal'): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!code.trim()) {
    errors.push('Code cannot be empty');
    return { isValid: false, errors };
  }
  
  if (language === 'pyteal') {
    // Basic PyTeal validation
    if (!code.includes('from pyteal import') && !code.includes('import pyteal')) {
      errors.push('PyTeal code should import the pyteal library');
    }
    
    // Check for common PyTeal patterns
    const hasReturn = code.includes('Return(') || code.includes('.Return()');
    const hasApprove = code.includes('Approve()') || code.includes('Int(1)');
    const hasReject = code.includes('Reject()') || code.includes('Int(0)');
    
    if (!hasReturn && !hasApprove && !hasReject) {
      errors.push('PyTeal program should have a return value (Approve(), Reject(), or Return())');
    }
  } else if (language === 'teal') {
    // Basic TEAL validation
    const lines = code.split('\n').filter(line => line.trim());
    const firstLine = lines[0]?.trim();
    
    if (!firstLine?.startsWith('#pragma version')) {
      errors.push('TEAL program should start with a pragma version directive');
    }
    
    const hasReturn = code.includes('return') || code.includes('int 1') || code.includes('int 0');
    if (!hasReturn) {
      errors.push('TEAL program should have a return statement');
    }
  }
  
  // Check for potential security issues
  if (code.includes('eval(') || code.includes('exec(')) {
    errors.push('Code contains potentially dangerous functions');
  }
  
  // Check code length
  if (code.length > 10000) {
    errors.push('Code is too long (maximum 10,000 characters)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Real-time validation hook
export const useValidation = (schema?: z.ZodSchema) => {
  const validator = new FormValidator(schema);
  
  const validateField = (name: string, value: any, fieldSchema: z.ZodSchema) => {
    return validator.validateField(name, value, fieldSchema);
  };
  
  const validateForm = (data: Record<string, any>) => {
    return validator.validateForm(data);
  };
  
  const getFieldError = (name: string) => {
    return validator.getFieldError(name);
  };
  
  const hasFieldError = (name: string) => {
    return validator.hasFieldError(name);
  };
  
  const getErrors = () => {
    return validator.getErrors();
  };
  
  const hasErrors = () => {
    return validator.hasErrors();
  };
  
  return {
    validateField,
    validateForm,
    getFieldError,
    hasFieldError,
    getErrors,
    hasErrors,
  };
};

// Form schemas for common forms
export const FormSchemas = {
  login: z.object({
    email: ValidationSchemas.email,
    password: ValidationSchemas.nonEmptyString,
  }),
  
  register: z.object({
    username: ValidationSchemas.username,
    email: ValidationSchemas.email,
    password: ValidationSchemas.password,
    confirmPassword: ValidationSchemas.password,
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
  
  walletConnect: z.object({
    address: ValidationSchemas.algorandAddress,
  }),
  
  sendTransaction: z.object({
    recipient: ValidationSchemas.algorandAddress,
    amount: ValidationSchemas.positiveNumber,
    note: z.string().max(1000, 'Note must be less than 1000 characters').optional(),
  }),
  
  profile: z.object({
    username: ValidationSchemas.username,
    email: ValidationSchemas.email,
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    website: ValidationSchemas.url.optional(),
    location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  }),
  
  codeSubmission: z.object({
    code: ValidationSchemas.nonEmptyString,
    language: z.enum(['pyteal', 'teal']),
    lessonId: z.string().min(1, 'Lesson ID is required'),
  }),
};

// Utility functions for common validations
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const validateFileUpload = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
} = {}): { isValid: boolean; error?: string } => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
  } = options;
  
  if (file.size > maxSize) {
    return { isValid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type ${file.type} is not allowed` };
  }
  
  return { isValid: true };
};
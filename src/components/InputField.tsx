import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface InputFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: string) => string | null;
  };
  showValidation?: boolean;
  autoComplete?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  validation,
  showValidation = true,
  autoComplete,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasBeenBlurred, setHasBeenBlurred] = useState(false);

  const validateInput = useCallback((inputValue: string): { isValid: boolean; message: string } => {
    if (required && !inputValue.trim()) {
      return { isValid: false, message: `${label} is required` };
    }

    if (validation?.minLength && inputValue.length < validation.minLength) {
      return { isValid: false, message: `Minimum ${validation.minLength} characters required` };
    }

    if (validation?.maxLength && inputValue.length > validation.maxLength) {
      return { isValid: false, message: `Maximum ${validation.maxLength} characters allowed` };
    }

    if (validation?.pattern && !validation.pattern.test(inputValue)) {
      if (type === 'email') {
        return { isValid: false, message: 'Please enter a valid email address' };
      }
      return { isValid: false, message: 'Invalid format' };
    }

    if (validation?.custom) {
      const customError = validation.custom(inputValue);
      if (customError) {
        return { isValid: false, message: customError };
      }
    }

    return { isValid: true, message: '' };
  }, [label, required, validation, type]);

  const validationResult = validateInput(value);
  const shouldShowValidation = showValidation && hasBeenBlurred && value.length > 0;
  const inputType = type === 'password' && showPassword ? 'text' : type;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasBeenBlurred(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const getInputClasses = () => {
    const baseClasses = `
      w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 
      bg-dark-800 text-white placeholder-gray-400 focus:outline-none
      ${className}
    `;

    if (disabled) {
      return `${baseClasses} border-gray-600 bg-gray-700 cursor-not-allowed opacity-60`;
    }

    if (shouldShowValidation) {
      if (validationResult.isValid) {
        return `${baseClasses} border-green-500 focus:border-green-400 focus:ring-2 focus:ring-green-500/20`;
      } else {
        return `${baseClasses} border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20`;
      }
    }

    if (isFocused) {
      return `${baseClasses} border-primary-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20`;
    }

    return `${baseClasses} border-dark-600 hover:border-dark-500`;
  };

  return (
    <div className="space-y-2">
      <motion.label
        className={`block text-sm font-medium transition-colors duration-200 ${
          isFocused ? 'text-primary-400' : 'text-gray-300'
        }`}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: isFocused ? 1 : 0.8 }}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </motion.label>

      <div className="relative">
        <motion.input
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={getInputClasses()}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />

        {type === 'password' && value && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}

        {shouldShowValidation && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {validationResult.isValid ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <AlertCircle className="h-4 w-4 text-red-500" />
              </motion.div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {shouldShowValidation && !validationResult.isValid && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-2"
          >
            <AlertCircle className="h-3 w-3 text-red-400 flex-shrink-0" />
            <span className="text-xs text-red-400">{validationResult.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character count for inputs with maxLength */}
      {validation?.maxLength && value.length > 0 && (
        <div className="flex justify-end">
          <span className={`text-xs ${
            value.length > validation.maxLength * 0.8 
              ? value.length >= validation.maxLength ? 'text-red-400' : 'text-yellow-400'
              : 'text-gray-500'
          }`}>
            {value.length} / {validation.maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

// Preset validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phoneNumber: /^\+?\d{10,15}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s]+$/,
};

// Custom validation functions
export const CustomValidations = {
  confirmPassword: (password: string) => (value: string) => {
    if (value !== password) {
      return 'Passwords do not match';
    }
    return null;
  },
  
  uniqueUsername: (existingUsernames: string[]) => (value: string) => {
    if (existingUsernames.includes(value.toLowerCase())) {
      return 'Username is already taken';
    }
    return null;
  },
  
  walletAddress: (value: string) => {
    if (value.length !== 58) {
      return 'Algorand address must be 58 characters long';
    }
    if (!/^[A-Z2-7]+$/.test(value)) {
      return 'Invalid Algorand address format';
    }
    return null;
  },
};

export default InputField;
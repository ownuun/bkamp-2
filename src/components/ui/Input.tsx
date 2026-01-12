'use client';

import { TextField, Label, Input as AriaInput, FieldError, Text } from 'react-aria-components';
import type { TextFieldProps } from 'react-aria-components';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<TextFieldProps, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string;
  placeholder?: string;
}

export function Input({
  label,
  description,
  errorMessage,
  placeholder,
  className,
  ...props
}: InputProps) {
  return (
    <TextField className={cn('flex flex-col gap-1.5', className)} {...props}>
      {label && (
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      )}
      <AriaInput
        placeholder={placeholder}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-lg border text-gray-900 placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          'disabled:bg-gray-50 disabled:text-gray-500',
          errorMessage
            ? 'border-error-300 focus:ring-error-500 focus:border-error-500'
            : 'border-gray-300'
        )}
      />
      {description && !errorMessage && (
        <Text slot="description" className="text-sm text-gray-500">
          {description}
        </Text>
      )}
      {errorMessage && (
        <FieldError className="text-sm text-error-600">{errorMessage}</FieldError>
      )}
    </TextField>
  );
}

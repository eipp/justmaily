import { useState, useCallback } from 'react';
import { z } from 'zod';
import { useToast } from '@/components/Toast/useToast';

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema: z.ZodType<T>;
  onSubmit: (values: T) => Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  const { addToast } = useToast();

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setState((prev) => ({
        ...prev,
        values: { ...prev.values, [field]: value },
        touched: { ...prev.touched, [field]: true },
      }));
    },
    []
  );

  const setFieldTouched = useCallback(
    (field: keyof T, isTouched: boolean = true) => {
      setState((prev) => ({
        ...prev,
        touched: { ...prev.touched, [field]: isTouched },
      }));
    },
    []
  );

  const validateField = useCallback(
    (field: keyof T) => {
      try {
        const schema = z.object({ [field]: validationSchema.shape[field] });
        schema.parse({ [field]: state.values[field] });
        setState((prev) => ({
          ...prev,
          errors: { ...prev.errors, [field]: undefined },
        }));
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors.find((e) => e.path[0] === field);
          setState((prev) => ({
            ...prev,
            errors: { ...prev.errors, [field]: fieldError?.message },
          }));
          return false;
        }
        return true;
      }
    },
    [state.values, validationSchema]
  );

  const validateForm = useCallback(async () => {
    try {
      const validatedData = await validationSchema.parseAsync(state.values);
      setState((prev) => ({ ...prev, errors: {} }));
      return { isValid: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.path[0]]: curr.message,
          }),
          {}
        );
        setState((prev) => ({ ...prev, errors }));
      }
      return { isValid: false, data: null };
    }
  }, [state.values, validationSchema]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      setState((prev) => ({ ...prev, isSubmitting: true }));

      try {
        const { isValid, data } = await validateForm();
        if (isValid && data) {
          await onSubmit(data);
          addToast({
            type: 'success',
            message: 'Form submitted successfully',
          });
        }
      } catch (error) {
        addToast({
          type: 'error',
          message: error instanceof Error ? error.message : 'Form submission failed',
        });
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [validateForm, onSubmit, addToast]
  );

  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
    });
  }, [initialValues]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    handleSubmit,
    resetForm,
  };
} 
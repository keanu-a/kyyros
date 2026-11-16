'use client';

// This form is for CHANGING password for logged-in users

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormProps {
  disabled?: boolean;
}

export default function ChangePasswordForm({
  disabled = false,
}: ChangePasswordFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: ChangePasswordValues) {
    if (disabled) return;

    setSubmitError(null);
    setSubmitSuccess(false);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: values.newPassword,
      current_password: values.currentPassword,
    });

    if (error) {
      console.log(error);
      setSubmitError(
        'Could not update password. Check your current password and/or create new stronger password then try again.',
      );
      return;
    }

    setSubmitSuccess(true);
    form.reset();
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          {disabled
            ? 'You signed in with Google, so your password is managed by Google.'
            : 'Update your account password'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={disabled}>
          <FieldGroup className='pb-4'>
            <Controller
              name='currentPassword'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='current-password'>
                    Current Password
                  </FieldLabel>
                  <Input
                    {...field}
                    onChangeCapture={(e) => {
                      field.onChange(e);
                      setSubmitSuccess(false);
                      setSubmitError(null);
                    }}
                    type='password'
                    id='current-password'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <p className='text-xs text-muted-foreground'>
              At least 8 characters, with uppercase, lowercase, a number, and a
              special character
            </p>

            <Controller
              name='newPassword'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='new-password'>New Password</FieldLabel>
                  <Input
                    {...field}
                    onChangeCapture={(e) => {
                      field.onChange(e);
                      setSubmitSuccess(false);
                      setSubmitError(null);
                    }}
                    type='password'
                    id='new-password'
                    autoComplete='new-password'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name='confirmPassword'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='confirm-password'>
                    Confirm Password
                  </FieldLabel>
                  <Input
                    {...field}
                    onChangeCapture={(e) => {
                      field.onChange(e);
                      setSubmitSuccess(false);
                      setSubmitError(null);
                    }}
                    type='password'
                    id='confirm-password'
                    autoComplete='new-password'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {submitError && <p className='text-destructive'>{submitError}</p>}
          {submitSuccess && <p className='text-blue-600'>Password updated</p>}

          <Button
            type='submit'
            disabled={form.formState.isSubmitting}
            className='mt-4 cursor-pointer'
          >
            {form.formState.isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}

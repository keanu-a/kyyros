'use client';

// This form is for non-logged in users that clicked forget password

import { useState } from 'react';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { createClient } from '@/lib/supabase/client';

const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setSubmitError(null);
    setIsSubmitted(false);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setSubmitError('Error submitting request');
      return;
    }

    setIsSubmitted(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl font-semibold'>Forgot Password</CardTitle>
        <CardDescription>Enter your email for instructions</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FieldGroup className='pt-4'>
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='forgot-password-email'>Email</FieldLabel>
                  <Input
                    {...field}
                    type='email'
                    id='forgot-password-email'
                    placeholder='you@example.com'
                    autoComplete='email'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {submitError && (
            <p className='text-sm text-destructive'>{submitError}</p>
          )}

          {!submitError && isSubmitted && (
            <p className='text-sm text-blue-600'>
              If an account exists for that email, you&apos;ll receive password
              reset instructions shortly.
            </p>
          )}

          <div>
            <Button
              type='submit'
              disabled={form.formState.isSubmitting}
              className='w-full cursor-pointer'
            >
              {form.formState.isSubmitting
                ? 'Sending email...'
                : 'Reset password'}
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className='flex flex-col space-y-2'>
        <p className='text-sm text-muted-foreground mx-auto'>
          Don&apos;t have an account?{' '}
          <Link href='/signup' className='text-primary hover:underline'>
            Sign up
          </Link>
        </p>
        <p className='text-sm text-muted-foreground mx-auto'>
          Know your login info?{' '}
          <Link href='/login' className='text-primary hover:underline'>
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

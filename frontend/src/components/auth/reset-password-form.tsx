'use client';

// This form is for resetting password after redirected from instruction email (sent from forgot password)

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
import { LoaderCircle } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let recovered = false;

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        recovered = true;
        setRecoveryReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
        return;
      }

      setTimeout(() => {
        if (!recovered) {
          router.replace('/profile');
        }
      }, 500);
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: ResetPasswordValues) {
    setSubmitError(null);
    setSubmitSuccess(false);

    const { error } = await supabase.auth.updateUser({
      password: values.newPassword,
    });

    if (error) {
      console.log(error);
      setSubmitError(
        'Could not update password. Create new stronger password then try again.',
      );
      return;
    }

    setSubmitSuccess(true);
    form.reset();
  }

  if (!recoveryReady)
    return (
      <div className='w-full flex items-center justify-center'>
        <LoaderCircle className='animate-spin' size={24} />;
      </div>
    );

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle className='text-xl font-semibold'>Reset Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className='pb-4'>
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
          {submitSuccess && (
            <p className='text-blue-600'>
              Password updated.{' '}
              <Link href='/login' className='hover:underline'>
                Login here
              </Link>
            </p>
          )}

          <Button
            type='submit'
            disabled={form.formState.isSubmitting}
            className='mt-4 cursor-pointer'
          >
            {form.formState.isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

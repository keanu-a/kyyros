'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { useUser } from '@/contexts/user-context';
import { updateCurrentUser } from '@/lib/api/users';
import { Button } from './ui/button';

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters long')
    .max(20, 'Username must be at most 20 characters'),
  profilePictureUrl: z.union([z.url('Enter a valid URL'), z.literal('')]),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
  const { user, setUser } = useUser();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      username: user?.username ?? '',
      profilePictureUrl: user?.profilePictureUrl ?? '',
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const updatedUser = await updateCurrentUser({
        username: values.username,
        profilePictureUrl:
          values.profilePictureUrl === '' ? null : values.profilePictureUrl,
      });
      setUser(updatedUser);
      setSubmitSuccess(true);
    } catch (error) {
      if (error instanceof Error && error.message.includes('409')) {
        setSubmitError('That username is alrady taken');
      } else {
        setSubmitError('Something went wrong');
      }
    }
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your username and profile picture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className='pt-2 pb-4'>
            <Controller
              name='username'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel className='font-bold' htmlFor='profile-username'>
                    Username
                  </FieldLabel>
                  <Input
                    {...field}
                    id='profile-username'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name='profilePictureUrl'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel
                    className='font-bold'
                    htmlFor='profile-picture-url'
                  >
                    Profile Picture URL
                  </FieldLabel>
                  <Input
                    {...field}
                    id='profile-picture-url'
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

          {submitSuccess && (
            <p className='text-sm text-primary'>Profile updated</p>
          )}

          <Button
            type='submit'
            disabled={form.formState.isSubmitting}
            className='w-full cursor-pointer sm:w-1/2'
          >
            {form.formState.isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

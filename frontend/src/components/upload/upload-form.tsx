'use client';

import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { isContentType } from '@/lib/api/videos';
import { UploadStatus, useVideoUpload } from '@/hooks/use-video-upload';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const uploadSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  file: z
    .instanceof(File, { message: 'File is required' })
    .refine((file) => file.size > 0, {
      message: 'File appears to be empty',
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: 'File size must be less than 500MB',
    })
    .refine((file) => isContentType(file.type), {
      message: 'File type is not supported',
    }),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function UploadForm() {
  const { uploadStatus, progress, error, upload } = useVideoUpload();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      description: '',
      file: undefined,
    },
  });

  const isWorking =
    uploadStatus === UploadStatus.CREATING ||
    uploadStatus === UploadStatus.UPLOADING ||
    uploadStatus === UploadStatus.PROCESSING;

  const onSubmit = (data: UploadFormValues) => {
    const { file, title, description } = data;

    if (!isContentType(file.type)) return;
    upload(file, { title, description, contentType: file.type });
  };

  // TODO: Currently dead end, need to implement a way to navigate to the uploaded video
  if (uploadStatus === UploadStatus.READY) {
    return (
      <Card>
        <CardContent>
          <p>Upload complete and processed!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
        <CardDescription>Upload your video file</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="upload-title">Title</FieldLabel>
                  <Input
                    {...field}
                    id="upload-title"
                    placeholder="Title"
                    aria-invalid={fieldState.invalid}
                    disabled={isWorking}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="upload-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="upload-description"
                    placeholder="Description"
                    aria-invalid={fieldState.invalid}
                    disabled={isWorking}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="file"
              control={form.control}
              render={({
                field: { value, onChange, ...field },
                fieldState,
              }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="upload-file">File</FieldLabel>
                  <Input
                    {...field}
                    type="file"
                    id="upload-file"
                    accept="video/*"
                    aria-invalid={fieldState.invalid}
                    disabled={isWorking}
                    onChange={(e) => onChange(e.target.files?.item(0))}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {uploadStatus === UploadStatus.UPLOADING && (
            <div>
              <Progress value={progress} />
              <p>{progress}% uploaded</p>
            </div>
          )}

          {uploadStatus === UploadStatus.PROCESSING && (
            <p>Processing... this can take a minute</p>
          )}

          {error && <p className="text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={isWorking}
            className="w-full mt-4 cursor-pointer"
          >
            {isWorking ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

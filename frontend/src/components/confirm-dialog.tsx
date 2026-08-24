'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';

type ConfirmDialogProps = {
  title: string;
  onConfirm: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  countdownSeconds?: number;
};

export default function ConfirmDialog({
  title,
  onConfirm,
  open,
  onOpenChange,
  isPending,
  countdownSeconds = 3,
}: ConfirmDialogProps) {
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setCountdown(countdownSeconds);
    }
  }

  useEffect(() => {
    if (!open || countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [open, countdown]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Are you sure? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            className='cursor-pointer'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            className='cursor-pointer'
            disabled={countdown > 0 || isPending}
            onClick={onConfirm}
          >
            {isPending ? (
              <Loader2 className='animate-spin' size={20} />
            ) : countdown > 0 ? (
              `Delete (${countdown})`
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { toast } from 'react-hot-toast';

/**
 * A utility function to show toast notifications.
 * 
 * Usage:
 * const { success, error, custom } = useToast();
 * success('This is a success message');
 */
export function useToast() {
  const success = (message) => toast.success(message);
  const error = (message) => toast.error(message);
  const custom = (message, options) => toast(message, options);

  return { success, error, custom };
}

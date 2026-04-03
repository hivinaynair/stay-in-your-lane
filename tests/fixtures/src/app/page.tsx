// NOT a violation: app/ can import from features
import { login } from '@/features/auth/login';
import { PayButton } from '@/features/payments/components/pay-button';

export default function Page() {
  return null;
}

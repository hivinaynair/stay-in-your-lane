// VIOLATION: cross-feature import from enrollments
import { getEnrollment } from '@/features/enrollments/lib/queries';
// VIOLATION: cross-feature import from auth
import type { AuthUser } from '@/features/auth/types';

export function PayButton() {
  return null;
}

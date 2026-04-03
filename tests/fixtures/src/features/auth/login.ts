import { hashPassword } from './utils';
import { db } from '@/lib/db';

export function login(email: string, password: string) {
  return db.query(email, hashPassword(password));
}

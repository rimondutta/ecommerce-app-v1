/**
 * NextAuth type augmentation.
 * Extends the built-in Session, JWT, and User types so that
 * `session.user.role`, `session.user.id`, and `session.user.image`
 * are properly typed throughout the application without needing `as any`.
 */

import type { DefaultSession, DefaultUser } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

type UserRole = 'admin' | 'manager' | 'customer';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      image?: string | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: UserRole;
    image?: string | null;
  }
}


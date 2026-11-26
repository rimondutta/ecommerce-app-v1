import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import connectToDatabase from './db';
import User from '@/models/User';
import { cleanEnv } from '@/lib/env';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: cleanEnv(process.env.GOOGLE_CLIENT_ID),
      clientSecret: cleanEnv(process.env.GOOGLE_CLIENT_SECRET),
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        await connectToDatabase();

        const cleanEmail = credentials.email.trim();
        const user = await User.findOne({
          $or: [
            { email: cleanEmail.toLowerCase() },
            { email: cleanEmail },
            { email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          ],
        }).select('+password');

        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error('Invalid credentials');
        }

        return { 
          id: user._id.toString(), 
          email: user.email, 
          name: user.name, 
          role: user.role,
          image: user.image 
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth — auto-create customer account on first login
      if (account?.provider === 'google') {
        try {
          await connectToDatabase();
          // Generate a random placeholder password for Google-only users
          const passwordHash = await bcrypt.hash(randomUUID(), 10);
          const dbUser = await User.findOneAndUpdate(
            { email: user.email },
            {
              $setOnInsert: {
                name: user.name,
                email: user.email,
                password: passwordHash,
                role: 'customer',
              },
              // Always refresh their profile photo from Google
              $set: { image: user.image },
            },
            { upsert: true, new: true }
          );
          // Attach DB fields so jwt callback can access them
          user.id = dbUser._id.toString();
          user.role = dbUser.role;
          return true;
        } catch (error) {
          console.error('[NextAuth] Google signIn error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        if (user.image) {
          token.image = user.image;
        }
      }
      if (trigger === 'update' && session) {
        if (typeof session.name === 'string' && session.name.trim()) {
          token.name = session.name.trim();
        }
        if (typeof session.image === 'string') {
          token.image = session.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id ?? '';
        session.user.role = token.role ?? 'customer';
        if (typeof token.name === 'string') {
          session.user.name = token.name;
        }
        if (token.image) {
          session.user.image = token.image;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days — sessions expire automatically
  },
  secret: cleanEnv(process.env.NEXTAUTH_SECRET),
  debug: cleanEnv(process.env.NODE_ENV) === 'development',
};

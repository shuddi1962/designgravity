'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0A0A0F]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#9333ea] flex items-center justify-center">
              <span className="text-white font-bold text-lg">DG</span>
            </div>
            <span className="font-display font-bold text-xl text-[#F8F8FC]">DesignGravity</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#F8F8FC] mb-2">Create your account</h1>
          <p className="text-[#9090A8]">Start creating amazing designs today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#F8F8FC] mb-2">
              Full Name
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full px-4 py-3 bg-[#141420] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] placeholder-[#9090A8] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-colors"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-[#EF4444]">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#F8F8FC] mb-2">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className="w-full px-4 py-3 bg-[#141420] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] placeholder-[#9090A8] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-colors"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-[#EF4444]">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#F8F8FC] mb-2">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-4 py-3 bg-[#141420] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] placeholder-[#9090A8] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-colors"
              placeholder="Create a strong password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-[#EF4444]">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#F8F8FC] mb-2">
              Confirm Password
            </label>
            <input
              {...register('confirmPassword')}
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-3 bg-[#141420] border border-[#2A2A3E] rounded-lg text-[#F8F8FC] placeholder-[#9090A8] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-colors"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-[#EF4444]">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              required
              className="mt-1 w-4 h-4 rounded border-[#2A2A3E] bg-[#141420] text-[#7C3AED] focus:ring-[#7C3AED] focus:ring-offset-0"
            />
            <span className="text-sm text-[#9090A8]">
              I agree to the{' '}
              <Link href="/terms" className="text-[#7C3AED] hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-[#7C3AED] hover:underline">Privacy Policy</Link>
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#9090A8]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#7C3AED] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

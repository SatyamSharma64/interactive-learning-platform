import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { trpc } from '../../lib/trpc';
import { useAuthStore } from '../../store/authStore';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate('/dashboard');
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('firstName')}
                placeholder="First name"
                error={errors.firstName?.message}
              />
              <Input
                {...register('lastName')}
                placeholder="Last name"
                error={errors.lastName?.message}
              />
            </div>
            <Input
              {...register('email')}
              type="email"
              placeholder="Email address"
              error={errors.email?.message}
            />
            <Input
              {...register('username')}
              placeholder="Username"
              error={errors.username?.message}
            />
            <Input
              {...register('password')}
              type="password"
              placeholder="Password"
              error={errors.password?.message}
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="ghost"
              className="w-full"
              isLoading={registerMutation.isPending}
            >
              Sign up
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
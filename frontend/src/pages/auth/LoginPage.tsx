import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { trpc } from '../../lib/trpc';
import { useAuthStore } from '../../store/authStore';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const loginMutation = trpc.auth.login.useMutation({
        onSuccess: (data) => {
            setAuth(data.user, data.token);
            navigate('/dashboard');
        },
        onError: (error) => {
            console.error('Login failed:', error);
            alert('Login failed. Please check your credentials and try again.');
        },
    });

    const onSubmit = (data: LoginForm) => {
        loginMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
            <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Sign in to your account
            </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <Input
                {...register('email')}
                type="email"
                placeholder="Email address"
                error={errors.email?.message}
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
                isLoading={loginMutation.isPending}
                >
                Sign in
                </Button>
            </div>

            <div className="text-center">
                <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                    Sign up
                </Link>
                </span>
            </div>
            </form>
        </div>
        </div>
    );
};
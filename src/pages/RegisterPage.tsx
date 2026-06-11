import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';

const registerSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(20, '用户名最多20个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符'),
  confirmPassword: z.string().min(1, '请确认密码'),
  name: z.string().min(1, '请输入昵称'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        name: data.name,
      });
      navigate('/chat');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <Card className="w-full shadow-medium rounded-16">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold text-center">
          注册
        </CardTitle>
        <CardDescription className="text-center">
          创建您的账号
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 bg-functional-error/10 text-functional-error text-sm rounded-12">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              placeholder="请输入用户名"
              {...register('username')}
              className="rounded-12"
            />
            {errors.username && (
              <p className="text-sm text-functional-error">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">昵称</Label>
            <Input
              id="name"
              placeholder="请输入昵称"
              {...register('name')}
              className="rounded-12"
            />
            {errors.name && (
              <p className="text-sm text-functional-error">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱"
              {...register('email')}
              className="rounded-12"
            />
            {errors.email && (
              <p className="text-sm text-functional-error">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              {...register('password')}
              className="rounded-12"
            />
            {errors.password && (
              <p className="text-sm text-functional-error">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              {...register('confirmPassword')}
              className="rounded-12"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-functional-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-12"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                注册中...
              </>
            ) : (
              '注册'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-text-tertiary">
          已有账号？{' '}
          <Link to="/login" className="text-primary hover:underline">
            立即登录
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterPage;
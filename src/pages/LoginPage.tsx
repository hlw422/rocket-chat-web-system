import React, { useState } from 'react';
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

const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名或邮箱'),
  password: z.string().min(1, '请输入密码'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.username, data.password);
      navigate('/chat');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <Card className="w-full shadow-medium rounded-16">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold text-center">
          登录
        </CardTitle>
        <CardDescription className="text-center">
          输入您的账号信息登录
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
            <Label htmlFor="username">用户名或邮箱</Label>
            <Input
              id="username"
              placeholder="请输入用户名或邮箱"
              {...register('username')}
              className="rounded-12"
            />
            {errors.username && (
              <p className="text-sm text-functional-error">{errors.username.message}</p>
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
              记住登录
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full rounded-12"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-text-tertiary">
          还没有账号？{' '}
          <Link to="/register" className="text-primary hover:underline">
            立即注册
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginPage;
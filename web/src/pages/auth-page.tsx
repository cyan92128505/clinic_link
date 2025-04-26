import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Lock, Mail, UserPlus } from 'lucide-react';

// Login validation schema
const loginFormSchema = z.object({
  email: z.string().email({ message: '請輸入有效的電子郵件地址' }),
  password: z.string().min(1, { message: '請輸入密碼' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// Register validation schema
const registerFormSchema = z.object({
  email: z.string().email({ message: '請輸入有效的電子郵件地址' }),
  password: z.string().min(6, { message: '密碼至少需要6個字元' }),
  name: z.string().min(1, { message: '請輸入姓名' }),
  phone: z.string().optional(),
  clinicName: z.string().optional(),
  clinicAddress: z.string().optional(),
  clinicPhone: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [showDevOptions, setShowDevOptions] = useState<boolean>(false);

  const [location, navigate] = useLocation();
  const {
    user,
    isLoading,
    loginMutation,
    registerMutation,
    firebaseLoginMutation,
    firebaseRegisterMutation,
  } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Login form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Register form setup
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
      clinicName: '',
      clinicAddress: '',
      clinicPhone: '',
    },
  });

  // Handle login submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Handle register submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  // Handle login submission
  const onFirebaseEmailLoginSubmit = (data: LoginFormValues) => {
    firebaseLoginMutation.mutate({
      method: 'password',
      data: data,
    });
  };

  // Handle Firebase Google login
  const onFirebaseGoogleLoginSubmit = async () => {
    try {
      await firebaseLoginMutation.mutateAsync({
        method: 'google',
      });
      // Navigation will happen automatically in the auth provider after successful login
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  // Toggle developer options
  const toggleDevOptions = () => {
    setShowDevOptions(!showDevOptions);
  };

  // Check for developer mode in localStorage or URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const devMode =
      urlParams.get('dev') === 'true' ||
      localStorage.getItem('devMode') === 'true';

    if (devMode) {
      setShowDevOptions(true);
      localStorage.setItem('devMode', 'true');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col sm:flex-row items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col sm:flex-row shadow-lg rounded-lg overflow-hidden">
        {/* Hero Section */}
        <div className="w-full sm:w-1/2 bg-primary p-8 text-white">
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-6">
                <div className="rounded-md bg-white/20 p-2 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">CLINIC LINK</h1>
              </div>
              <h2 className="text-3xl font-bold mb-4">診所管理整合系統</h2>
              <p className="mb-6 text-white/80">
                全面整合線上預約、現場掛號和看診進度追蹤的診所管理系統，提升工作效率與病患體驗。
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white/20 rounded-full p-2 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">全面整合</h3>
                  <p className="text-sm text-white/70">
                    整合線上預約、現場掛號和看診進度追蹤
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white/20 rounded-full p-2 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">即時通知</h3>
                  <p className="text-sm text-white/70">
                    透過多種管道即時更新看診進度
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white/20 rounded-full p-2 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">數據分析</h3>
                  <p className="text-sm text-white/70">
                    提供診所運營效率和患者流量分析
                  </p>
                </div>
              </div>
              {/* Dev Mode Toggle (hidden in bottom corner) */}
              <div className="absolute bottom-2 left-2">
                <button
                  onClick={toggleDevOptions}
                  className="text-white/20 hover:text-white/40 text-xs"
                  aria-label="Toggle Developer Options"
                >
                  •
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="w-full sm:w-1/2 bg-white p-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="login">登入</TabsTrigger>
              <TabsTrigger value="register">註冊</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl">歡迎回來</CardTitle>
                  <CardDescription>請輸入您的信箱密碼登入系統</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>電子郵件</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                                <Input
                                  placeholder="輸入電子郵件"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>密碼</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                                <Input
                                  type="password"
                                  placeholder="輸入密碼"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                            登入中...
                          </>
                        ) : (
                          '登入系統'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="px-0 pt-4 flex flex-col items-center border-t border-neutral-100">
                  <p className="text-sm text-neutral-500">
                    還沒有帳號？
                    <Button
                      variant="link"
                      className="p-0 h-auto pl-1"
                      onClick={() => setActiveTab('register')}
                    >
                      立即註冊
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl">建立新帳號</CardTitle>
                  <CardDescription>請填寫以下資料完成註冊</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>電子郵件</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                                <Input
                                  placeholder="輸入電子郵件"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>密碼</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                                <Input
                                  type="password"
                                  placeholder="輸入密碼"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>姓名</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserPlus className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                                <Input
                                  placeholder="輸入真實姓名"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>電話號碼</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                                <Input
                                  placeholder="輸入電話號碼"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                            註冊中...
                          </>
                        ) : (
                          '建立帳號'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="px-0 pt-4 flex flex-col items-center border-t border-neutral-100">
                  <p className="text-sm text-neutral-500">
                    已有帳號？
                    <Button
                      variant="link"
                      className="p-0 h-auto pl-1"
                      onClick={() => setActiveTab('login')}
                    >
                      立即登入
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="google">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl">歡迎回來</CardTitle>
                  <CardDescription>
                    請使用您的 Google 帳號快速註冊：
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="mb-6">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center"
                      onClick={onFirebaseGoogleLoginSubmit}
                      disabled={firebaseLoginMutation.isPending}
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                      使用 Google 帳號註冊/登入
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

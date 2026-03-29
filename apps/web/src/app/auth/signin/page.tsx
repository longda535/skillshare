"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(errorParam ? "登录失败，请检查您的凭据。" : "");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl,
      });

      if (result?.error) {
        setError("电子邮箱或密码错误，请重试。");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("发生意外错误，请稍后再试。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-muted/30">
      <Card className="w-full max-w-md shadow-2xl border-primary/10">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight">欢迎回来</CardTitle>
          <CardDescription>
            登录您的 Skill-Share 账号以继续创作与分享
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> 电子邮箱
              </label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" /> 密码
                </label>
                <Link href="#" className="text-xs text-primary hover:underline">忘记密码？</Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "立即登录"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">或者通过以下方式</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-11" onClick={() => signIn("github", { callbackUrl })}>
            使用 GitHub 账号登录
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6 mt-2">
          <p className="text-sm text-muted-foreground">
            还没有账号？{" "}
            <Link href="#" className="font-semibold text-primary hover:underline">
              立即注册
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

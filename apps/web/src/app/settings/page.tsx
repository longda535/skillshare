"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import useSWR from "swr";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
    currentPassword: "",
    password: "",
    confirmPassword: ""
  });

  // 获取最新个人资料
  const { data: profileResult, mutate } = useSWR(
    session?.user ? `${API_BASE}/users/profile` : null,
    (url: string) => fetch(url, {
      headers: { "x-user-id": session?.user?.id || "" }
    }).then(res => res.json())
  );

  useEffect(() => {
    if (profileResult?.data) {
      setFormData(prev => ({
        ...prev,
        name: profileResult.data.name || "",
        avatar: profileResult.data.avatar || ""
      }));
    }
  }, [profileResult]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验文件类型
    if (!file.type.startsWith("image/")) {
      toast.error("只能上传图片文件");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    setIsUploading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/upload`, {
        method: "POST",
        headers: {
          "x-user-id": session?.user?.id || ""
        },
        body: formDataUpload,
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Upload failed");

      setFormData(prev => ({ ...prev, avatar: result.data.url }));
      toast.success("头像已上传并锁定，请点击下方保存生效");
    } catch (err: any) {
      toast.error(err.message || "上传失败，请重试");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": session?.user?.id || ""
        },
        body: JSON.stringify({
          name: formData.name,
          avatar: formData.avatar,
          currentPassword: formData.currentPassword,
          ...(formData.password && { password: formData.password })
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Update failed");

      toast.success("个人资料已更新");
      
      // 更新 Session
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          image: formData.avatar
        }
      });

      setFormData(prev => ({ ...prev, password: "", confirmPassword: "", currentPassword: "" }));
      mutate();
    } catch (err: any) {
      toast.error(err.message || "更新失败，请重试");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-none bg-background/50 backdrop-blur-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black">请先登录</CardTitle>
            <CardDescription>访问个人设置前，请先验证您的身份。</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button onClick={() => window.location.href = "/auth/signin"} className="rounded-full px-8">立即登录</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 container max-w-4xl mx-auto py-12 px-6 md:px-12 pb-32">
      <div className="space-y-2 mb-10">
        <h1 className="text-4xl font-black tracking-tight tracking-tighter bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">个人设置</h1>
        <p className="text-muted-foreground font-medium">管理您的账号信息、安全设置与个人偏好。</p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-8">
        {/* Profile Card */}
        <Card className="border-border/50 bg-background/40 backdrop-blur-md shadow-xl overflow-hidden rounded-2xl">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> 基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="relative group mx-auto md:mx-0">
                <Avatar 
                  className="h-24 w-24 border-4 border-background shadow-2xl transition-transform group-hover:scale-105 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AvatarImage src={formData.avatar} />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                  <AvatarFallback className="text-2xl font-black bg-primary/5 text-primary">
                    {session.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg border-2 border-background cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="font-bold text-sm">显示名称</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="您的昵称"
                    className="rounded-xl border-primary/10 bg-background/50 focus:border-primary/40"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="avatar" className="font-bold text-sm">头像 URL</Label>
                  <Input 
                    id="avatar" 
                    value={formData.avatar} 
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                    placeholder="https://example.com/avatar.jpg"
                    className="rounded-xl border-primary/10 bg-background/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2 opacity-70">
              <Label className="font-bold text-sm">注册邮箱</Label>
              <div className="flex items-center gap-2 text-sm bg-muted/30 p-3 rounded-xl border border-dashed border-border">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{session.user?.email}</span>
                <Badge variant="outline" className="ml-auto text-[10px] font-bold">不可修改</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="border-border/50 bg-background/40 backdrop-blur-md shadow-xl overflow-hidden rounded-2xl">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> 账号安全
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPass" className="font-bold text-sm">当前密码 <span className="text-destructive">*</span></Label>
                <Input 
                  id="currentPass" 
                  type="password" 
                  value={formData.currentPassword} 
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="执行更改前需验证原密码"
                  className="rounded-xl border-primary/10 bg-background/50"
                  required={!!formData.password}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="pass" className="font-bold text-sm">新密码</Label>
                <Input 
                  id="pass" 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="留空则不修改"
                  className="rounded-xl border-primary/10 bg-background/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm" className="font-bold text-sm">确认新密码</Label>
                <Input 
                  id="confirm" 
                  type="password" 
                  value={formData.confirmPassword} 
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="确保与上方一致"
                  className="rounded-xl border-primary/10 bg-background/50"
                />
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>为了您的账号安全，我们建议定期更换密码。密码修改后，您可能需要重新登录所有设备。</p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t border-border/50 p-6 flex justify-end">
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="rounded-full px-10 h-12 text-md font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all gap-2"
            >
              {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              保存所有更改
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}


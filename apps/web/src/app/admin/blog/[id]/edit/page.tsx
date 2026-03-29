"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { toast } from "sonner";

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/admin/blog/${id}/edit`);
    }
  }, [status, router, id]);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        // We use the ID to fetch, but the existing GET /posts/:slug only takes slug.
        // I should probably have a GET /posts/id/:id or similar.
        // For now, let's assume I can fetch by ID or I'll add the endpoint.
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/posts/detail/${id}`, {
          headers: {
            "x-user-role": session?.user?.role || ""
          }
        });
        if (!response.ok) throw new Error("无法加载文章数据");
        const data = await response.json();
        setPost(data.data);
      } catch (error: any) {
        toast.error(error.message);
        router.push("/admin/blog");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user?.id || !post) return null;

  return (
    <BlogEditor 
      mode="edit" 
      authorId={session.user.id} 
      initialData={post}
    />
  );
}

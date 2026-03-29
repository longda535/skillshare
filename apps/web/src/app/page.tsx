"use client";

import { Suspense, useState } from "react";
import useSWR from "swr";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillCard } from "@/components/shared/SkillCard";
import { fetcher } from "@/lib/api";
import type { Skill, Category } from "@skill-share/shared";
import { Skeleton } from "@/components/ui/skeleton";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const activeCategorySlug = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";

  // Local fetcher to get all paginated data (including total)
  const paginatedFetcher = (url: string) => fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : `http://localhost:4000/api${url}`).then(r => r.json());

  const [page, setPage] = useState(1);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalSkills, setTotalSkills] = useState(0);

  // Fetch Categories
  const { data: categories } = useSWR<Category[]>("/categories", fetcher);
  
  // Fetch Skills based on active category slug and search query
  const skillsUrl = `/skills?category=${activeCategorySlug}&page=${page}&limit=12${searchQuery ? `&search=${searchQuery}` : ""}`;
  
  const { data: response, isLoading: skillsLoading, error: skillsError } = useSWR<{ data: Skill[], total: number }>(skillsUrl, paginatedFetcher, {
    revalidateOnFocus: false,
    onSuccess: (res) => {
      if (res && res.data) {
        if (page === 1) {
          setAllSkills(res.data);
        } else {
          setAllSkills((prev) => [...prev, ...res.data]);
        }
        setTotalSkills(res.total || 0);
      }
      setIsLoadingMore(false);
    }
  });

  const categoryList = categories || [];
  
  const handleCategoryChange = (value: string) => {
    setPage(1);
    setAllSkills([]);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleLoadMore = () => {
    if (!skillsLoading && allSkills.length < totalSkills) {
      setIsLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden flex flex-col items-center text-center">
        {/* Background gradient effects */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl text-foreground">
          轻松发现与掌握顶尖的 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">AI 生产力技能</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          高质量的 AI 提示词、工作流模板与教程资源库，助你在 AI 时代快人一步，十倍提升个人和团队生产力。
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20">
            浏览所有技能
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base">
            成为创作者
          </Button>
        </div>
      </section>

      {/* Main Content Area: Tabs + Skill Cards Grid */}
      <section className="container mx-auto px-6 md:px-12 lg:px-20 py-12 flex-1">
        <Tabs 
          defaultValue="all" 
          value={activeCategorySlug} 
          onValueChange={handleCategoryChange} 
          className="w-full"
        >
          <div className="flex items-center justify-between mb-8">
            <TabsList className="h-12 w-full justify-start overflow-x-auto overflow-y-hidden hide-scrollbar bg-transparent border-b rounded-none p-0 pb-px">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-6 text-base whitespace-nowrap"
              >
                全部
              </TabsTrigger>
              {categoryList.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.slug}
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-6 text-base whitespace-nowrap"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeCategorySlug} className="mt-0">
            {searchQuery && (
              <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground">
                  搜索结果: <span className="text-foreground font-semibold">"{searchQuery}"</span>
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("search");
                    router.push(`/?${params.toString()}`);
                  }}
                >
                  清除搜索
                </Button>
              </div>
            )}

            {skillsLoading && page === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-video w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : skillsError ? (
              <div className="py-24 text-center text-muted-foreground">
                加载数据失败，请检查后端服务是否启动。
              </div>
            ) : allSkills && allSkills.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allSkills.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </div>
                
                {allSkills.length < totalSkills && (
                  <div className="mt-12 flex justify-center">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full max-w-xs h-12 text-base"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          正在加载...
                        </span>
                      ) : "加载更多内容"}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-full py-24 text-center text-muted-foreground flex flex-col items-center justify-center">
                <p className="text-lg">没有找到相关的技能资源</p>
                <p className="text-sm mt-1">尝试更换分类或搜索关键词</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">正在加载平台内容...</div>}>
      <HomeContent />
    </Suspense>
  );
}



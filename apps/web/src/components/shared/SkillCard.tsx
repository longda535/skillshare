import Image from "next/image";
import Link from "next/link";
import { Download, TrendingUp, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Skill } from "@skill-share/shared";

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col items-stretch justify-between transition-all hover:shadow-lg dark:hover:shadow-primary/5 hover:-translate-y-1">
      <Link href={`/skill/${skill.id}`} className="block relative aspect-video w-full overflow-hidden bg-muted">
        {!!skill.coverImage ? (
          <Image
            src={skill.coverImage}
            alt={skill.title}
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-muted to-muted-foreground/10">
            <span className="text-muted-foreground/30 font-bold text-2xl">
              {skill.category?.name || "Skill"}
            </span>
          </div>
        )}
      </Link>
      
      <CardHeader className="p-4 flex-none space-y-2">
        <div className="flex justify-between items-start">
          <Badge variant="secondary" className="font-normal text-xs">
            {skill.category?.name || "默认分类"}
          </Badge>
          <span className="font-bold text-primary">
            {skill.price === 0 ? "免费" : `¥${skill.price.toFixed(2)}`}
          </span>
        </div>
        <CardTitle className="text-lg line-clamp-2 leading-tight">
          <Link href={`/skill/${skill.id}`} className="hover:underline">
            {skill.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {skill.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
        <div className="flex flex-wrap gap-1 mt-auto">
          {skill.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-[10px] px-1 py-0 h-4">
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="px-4 py-3 flex items-center justify-between text-xs text-muted-foreground font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center leading-none">
            <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground/70" />
            {skill.downloadCount}
          </span>
          <span className="flex items-center leading-none">
            <Eye className="mr-1.5 h-3.5 w-3.5 text-muted-foreground/70" />
            {skill.viewCount}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-8 px-3 text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-colors" asChild>
          <Link href={`/skill/${skill.id}`}>查看详情</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

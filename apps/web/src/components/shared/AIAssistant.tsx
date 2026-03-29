"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  X, 
  ChevronRight, 
  MessageSquare, 
  Lightbulb, 
  Clock,
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  skillTitle: string;
  skillDescription: string;
}

export function AIAssistant({ skillTitle, skillDescription }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 初始化欢迎语
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          { 
            role: "assistant", 
            content: `你好！我是 Skill-Share AI 助手。针对《${skillTitle}》，我可以为你提供核心要点总结、学习建议或解答相关疑问。你想先了解哪方面？` 
          }
        ]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen, skillTitle]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // 模拟 AI 回复逻辑
    setTimeout(() => {
      let reply = "这是一个很好的问题！";
      if (input.includes("总结") || input.includes("怎么学")) {
        reply = `基于《${skillTitle}》，我建议你：\n1. 先掌握基础的概念框架。\n2. 尝试动手实践 2-3 个小型案例。\n3. 参考文档中的高级提示词模板进行优化。`;
      } else {
        reply = `关于 "${input}"，建议你可以深入查看该资源的详情说明或在社区发帖讨论。我可以帮你总结更多细节吗？`;
      }
      
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* 浮动按钮 */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl z-50 animate-bounce hover:animate-none group"
          size="icon"
        >
          <Sparkles className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </Button>
      )}

      {/* 助手面板 */}
      <div 
        className={cn(
          "fixed bottom-8 right-8 w-[380px] h-[600px] bg-background border rounded-3xl shadow-2xl flex flex-col z-50 transition-all duration-300 transform origin-bottom-right overflow-hidden",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b bg-primary text-primary-foreground flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5" />
            <span>AI 智能助手</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          <div className="bg-muted/50 rounded-2xl p-3 text-sm">
            <div className="flex items-center gap-2 mb-2 font-medium text-primary">
              <Lightbulb className="h-4 w-4" /> 快速建议
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setInput("总结核心要点")}
              >
                总结要点
              </Badge>
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setInput("我该如何开始学习？")}
              >
                学习建议
              </Badge>
            </div>
          </div>

          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={cn(
                "max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed",
                msg.role === "assistant" 
                  ? "bg-secondary self-start" 
                  : "bg-primary text-primary-foreground self-end ml-auto"
              )}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          
          {isTyping && (
            <div className="bg-secondary max-w-[85%] rounded-2xl p-3 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-muted/20">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="问问 AI 任何事..."
              className="rounded-xl border-muted-foreground/20 focus-visible:ring-primary"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isTyping}
              className="rounded-xl shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            AI 结果仅供参考，请根据实际场景应用。
          </p>
        </div>
      </div>
    </>
  );
}

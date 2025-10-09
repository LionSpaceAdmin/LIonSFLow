"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useWorkflowStore } from "@/lib/store/workflow-store";
import { runWorkflow } from "@/ai/flows/run-workflow";
import { Download, Play, Upload, Bot } from "lucide-react";

export default function Header() {
  const { toast } = useToast();
  const { nodes, edges } = useWorkflowStore();

  const handleRunWorkflow = async () => {
    toast({
      title: "מריץ תהליך עבודה...",
      description: "אנא המתן.",
    });

    try {
      const result = await runWorkflow({ nodes, edges });
      toast({
        title: "התהליך הסתיים",
        description: result.executionResult,
      });
    } catch (error) {
      console.error("Workflow execution failed:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בהרצת התהליך",
        description: "אירעה שגיאה בלתי צפויה. בדוק את הלוגים לפרטים נוספים.",
      });
    }
  };

  const handlePlaceholderClick = (feature: string) => {
    toast({
      title: "תכונה זו אינה מיושמת",
      description: `הפונקציונליות של ${feature} עדיין אינה זמינה.`,
    });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 z-10">
      <div className="flex items-center gap-3">
        <Bot className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold font-headline tracking-tighter">
          אורון
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePlaceholderClick("טעינת תהליך עבודה")}
        >
          <Upload className="ml-2 h-4 w-4" />
          טען
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePlaceholderClick("שמירת תהליך עבודה")}
        >
          <Download className="ml-2 h-4 w-4" />
          שמור
        </Button>
        <Button size="sm" onClick={handleRunWorkflow}>
          <Play className="ml-2 h-4 w-4" />
          הרץ
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage src="https://picsum.photos/seed/user/40/40" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>החשבון שלי</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>פרופיל</DropdownMenuItem>
            <DropdownMenuItem>חיובים</DropdownMenuItem>
            <DropdownMenuItem>הגדרות</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>התנתק</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

"use client";

import { useRef } from "react";
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
  const { nodes, edges, setWorkflow } = useWorkflowStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSaveWorkflow = () => {
    if (nodes.length === 0) {
      toast({
        variant: "destructive",
        title: "תהליך עבודה ריק",
        description: "לא ניתן לשמור תהליך עבודה ריק.",
      });
      return;
    }

    const workflowData = {
      nodes,
      edges,
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(workflowData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "workflow.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({
      title: "התהליך נשמר",
      description: "קובץ תהליך העבודה הורד למחשבך.",
    });
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const { nodes: loadedNodes, edges: loadedEdges } = JSON.parse(content);
          if (Array.isArray(loadedNodes) && Array.isArray(loadedEdges)) {
             setWorkflow(loadedNodes, loadedEdges);
             toast({
              title: "התהליך נטען בהצלחה",
              description: "תהליך העבודה מהקובץ מוצג כעת על הקנבס.",
            });
          } else {
            throw new Error("Invalid file structure");
          }
        }
      } catch (error) {
        console.error("Failed to load workflow:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת הקובץ",
          description: "הקובץ אינו קובץ תהליך עבודה תקין.",
        });
      }
    };
    reader.readAsText(file);
    // Reset file input to allow loading the same file again
    event.target.value = '';
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
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="application/json"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadClick}
        >
          <Upload className="ml-2 h-4 w-4" />
          טען
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveWorkflow}
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
            <DropdownMenuItem onClick={() => handlePlaceholderClick("פרופיל")}>פרופיל</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePlaceholderClick("חיובים")}>חיובים</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePlaceholderClick("הגדרות")}>הגדרות</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handlePlaceholderClick("התנתקות")}>התנתק</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

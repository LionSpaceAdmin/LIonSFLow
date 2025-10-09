"use client";

import { useWorkflowStore } from "@/lib/store/workflow-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "lucide-react";

export default function LogsPanel() {
  const { logs, isLogsPanelOpen, setLogsPanelOpen } = useWorkflowStore();

  return (
    <Sheet open={isLogsPanelOpen} onOpenChange={setLogsPanelOpen}>
      <SheetContent className="w-[500px] sm:w-[640px] flex flex-col" side="right">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-headline">
            <Terminal />
            יומן רישום הרצה
          </SheetTitle>
          <SheetDescription>
            כאן מוצגים הלוגים של הרצת תהליך העבודה האחרון.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 my-4 bg-muted/50 rounded-md p-2">
          <div className="p-2 font-mono text-xs text-foreground flex flex-col gap-2">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Badge variant="outline" className="text-muted-foreground">{index + 1}</Badge>
                  <p className="flex-1 whitespace-pre-wrap">{log}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">אין לוגים להצגה. הרץ תהליך עבודה כדי לראות את הפלט.</p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Download, Play, Upload, Bot, Database, FilePlus, LogOut, Loader2 } from "lucide-react";
import { useFirestore } from "@/firebase/provider";
import { collection, addDoc, doc, serverTimestamp, getDocs } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

type WorkflowDoc = {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
};

export default function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const { nodes, edges, setWorkflow, setLogs, setLogsPanelOpen, workflowId, setWorkflowId } = useWorkflowStore();
  const firestore = useFirestore();
  
  const [workflows, setWorkflows] = useState<WorkflowDoc[]>([]);
  const [isFetchingWorkflows, setIsFetchingWorkflows] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRunning, setIsRunning] = useState(false);


  const handleRunWorkflow = async () => {
    setIsRunning(true);
    toast({
      title: "מריץ תהליך עבודה...",
      description: "אנא המתן, הפעולה מתבצעת בשרת.",
    });

    try {
      const result = await runWorkflow({ nodes, edges });
      setLogs(result.logs);
      setLogsPanelOpen(true);
      toast({
        title: "התהליך הסתיים",
        description: "הצגת תוצאות ויומני רישום.",
      });
    } catch (error) {
      console.error("Workflow execution failed:", error);
      const errorMessage = error instanceof Error ? error.message : "אירעה שגיאה בלתי צפויה.";
      toast({
        variant: "destructive",
        title: "שגיאה בהרצת התהליך",
        description: errorMessage,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleNewWorkflow = () => {
    setWorkflow([], []);
    setWorkflowId(null);
    toast({
      title: "תהליך עבודה חדש",
      description: "הקנבס נוקה ומוכן להתחלה חדשה.",
    });
  };

  const handleSaveWorkflow = async () => {
    if (nodes.length === 0) {
      toast({
        variant: "destructive",
        title: "תהליך עבודה ריק",
        description: "לא ניתן לשמור תהליך עבודה ריק.",
      });
      return;
    }

    const workflowName = prompt("אנא הכנס שם לתהליך העבודה:", "תהליך עבודה חדש");
    if (!workflowName) return;

    setIsSaving(true);
    const workflowData = {
      name: workflowName,
      nodes,
      edges,
      lastModified: serverTimestamp(),
    };
    
    try {
      if (workflowId && firestore) {
        // Update existing workflow
        const docRef = doc(firestore, "workflows", workflowId);
        setDocumentNonBlocking(docRef, workflowData, { merge: true });
        toast({
          title: "התהליך עודכן!",
          description: `תהליך העבודה "${workflowName}" עודכן בהצלחה.`,
        });
      } else if (firestore) {
        // Create new workflow
        const docRef = await addDoc(collection(firestore, "workflows"), {
          ...workflowData,
          createdAt: serverTimestamp(),
          version: 1,
        });
        setWorkflowId(docRef.id);
        toast({
          title: "התהליך נשמר!",
          description: `תהליך העבודה "${workflowName}" נשמר בהצלחה.`,
        });
      }
    } catch (error) {
        console.error("Error saving workflow: ", error);
        const errorMessage = error instanceof Error ? error.message : "אירעה שגיאה בלתי צפויה.";
        toast({
            variant: "destructive",
            title: "שגיאה בשמירת התהליך",
            description: errorMessage,
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleLoadWorkflow = (workflow: any) => {
    if (workflow.nodes && workflow.edges) {
      setWorkflow(workflow.nodes, workflow.edges);
      setWorkflowId(workflow.id);
      toast({
        title: "התהליך נטען בהצלחה",
        description: `תהליך העבודה "${workflow.name}" מוצג כעת על הקנבס.`,
      });
    } else {
       toast({
        variant: "destructive",
        title: "שגיאה בטעינת התהליך",
        description: "מבנה הנתונים של תהליך העבודה אינו תקין.",
      });
    }
  };

  const fetchWorkflows = async () => {
    if (!firestore) return;
    setIsFetchingWorkflows(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, "workflows"));
      const workflowsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkflowDoc));
      setWorkflows(workflowsData);
    } catch (error) {
      console.error("Error fetching workflows: ", error);
       toast({
        variant: "destructive",
        title: "שגיאה בטעינת תהליכים",
        description: "לא ניתן היה להביא את רשימת תהליכי העבודה מ-Firestore. בדוק את חוקי האבטחה.",
      });
    } finally {
      setIsFetchingWorkflows(false);
    }
  };
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    toast({
      title: 'התנתקת בהצלחה',
    });
    setIsLoggingOut(false);
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
          onClick={handleNewWorkflow}
        >
          <FilePlus className="ml-2 h-4 w-4" />
          חדש
        </Button>
        <DropdownMenu onOpenChange={(open) => open && fetchWorkflows()}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isFetchingWorkflows}>
              {isFetchingWorkflows ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Database className="ml-2 h-4 w-4" />}
              טען
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>טען תהליך עבודה מ-Firestore</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isFetchingWorkflows && <DropdownMenuItem disabled>טוען רשימה...</DropdownMenuItem>}
            {!isFetchingWorkflows && workflows?.length === 0 && <DropdownMenuItem disabled>לא נמצאו תהליכי עבודה.</DropdownMenuItem>}
            {workflows?.map((wf) => (
              <DropdownMenuItem key={wf.id} onClick={() => handleLoadWorkflow(wf)}>
                {wf.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveWorkflow}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Download className="ml-2 h-4 w-4" />}
          שמור
        </Button>
        <Button size="sm" onClick={handleRunWorkflow} disabled={isRunning}>
          {isRunning ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Play className="ml-2 h-4 w-4" />}
          הרץ
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <LogOut className="ml-2 h-4 w-4" />}
          התנתק
        </Button>
      </div>
    </header>
  );
}

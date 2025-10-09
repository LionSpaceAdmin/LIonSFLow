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
import { Download, Play, Upload, Bot } from "lucide-react";

export default function Header() {
  const { toast } = useToast();

  const handlePlaceholderClick = (feature: string) => {
    toast({
      title: "Feature not implemented",
      description: `${feature} functionality is not yet available.`,
    });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 z-10">
      <div className="flex items-center gap-3">
        <Bot className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold font-headline tracking-tighter">
          Auron
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePlaceholderClick("Load workflow")}
        >
          <Upload className="mr-2 h-4 w-4" />
          Load
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePlaceholderClick("Save workflow")}
        >
          <Download className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button size="sm" onClick={() => handlePlaceholderClick("Run workflow")}>
          <Play className="mr-2 h-4 w-4" />
          Run
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage src="https://picsum.photos/seed/user/40/40" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

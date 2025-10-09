"use client";

import { NodeDefinition } from "@/lib/types/nodes";
import { Card, CardContent } from "@/components/ui/card";

interface SidebarNodeProps {
  nodeInfo: NodeDefinition;
  onDragStart: (event: React.DragEvent, nodeType: string, nodeName: string) => void;
}

export default function SidebarNode({ nodeInfo, onDragStart }: SidebarNodeProps) {
  const { icon: Icon, name } = nodeInfo;

  return (
    <div
      className="p-2 border rounded-md bg-background hover:shadow-md cursor-grab active:cursor-grabbing transition-shadow flex items-center gap-3"
      onDragStart={onDragStart}
      draggable
    >
      <Icon className="h-5 w-5 text-primary flex-shrink-0" />
      <p className="text-sm font-medium truncate">{name}</p>
    </div>
  );
}

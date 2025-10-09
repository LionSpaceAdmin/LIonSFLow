"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AllNodeDefinitions } from "@/lib/node-definitions";
import SidebarNode from "./sidebar-node";
import { Search } from "lucide-react";

const categories = [
  "טריגרים",
  "פעולות",
  "עיבוד",
  "לוגיקה",
  "בינה מלאכותית וגנרטיבית",
];

export default function NodePalette() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNodes = AllNodeDefinitions.filter((node) =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeName: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/node-name", nodeName);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-72 border-l bg-card flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="חיפוש צמתים..."
            className="pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={categories}
        >
          {categories.map((category) => {
            const nodesInCategory = filteredNodes.filter(
              (node) => node.category === category
            );
            if (nodesInCategory.length === 0) return null;

            return (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="px-4 py-2 text-sm font-medium font-headline">
                  {category}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-2 p-4 pt-0">
                    {nodesInCategory.map((node) => (
                      <SidebarNode
                        key={node.id}
                        nodeInfo={node}
                        onDragStart={(event) => onDragStart(event, node.type, node.name)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>
    </aside>
  );
}

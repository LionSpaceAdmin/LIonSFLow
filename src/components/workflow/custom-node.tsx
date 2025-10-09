"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AllNodeDefinitions } from "@/lib/node-definitions";
import { useWorkflowStore } from "@/lib/store/workflow-store";

const CustomNode = ({ id, data, selected, type: nodeType }: NodeProps) => {
  const { nodes } = useWorkflowStore();
  const node = nodes.find(n => n.id === id);
  const functionalType = node?.type || nodeType;

  const nodeDefinition = AllNodeDefinitions.find((def) => def.type === functionalType);

  if (!nodeDefinition) {
    return <div>שגיאה: הגדרת צומת לא נמצאה עבור סוג '{functionalType}'</div>;
  }

  const { icon: Icon, name, inputs, outputs, category } = nodeDefinition;

  const categoryColors: { [key: string]: string } = {
    'טריגרים': 'bg-green-500',
    'פעולות': 'bg-blue-500',
    'עיבוד': 'bg-yellow-500',
    'לוגיקה': 'bg-purple-500',
    'בינה מלאכותית וגנרטיבית': 'bg-pink-500',
    'GCP': 'bg-orange-500',
  };

  return (
    <Card
      className={cn(
        "w-64 border-2 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-xl",
        selected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-card"
      )}
    >
      <CardHeader className={cn("p-2 rounded-t-lg", categoryColors[category] || 'bg-gray-500')}>
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1 rounded-md">
             <Icon className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm font-bold text-white font-headline truncate">{data.label || name}</p>
        </div>
      </CardHeader>
      <CardContent className="p-3 bg-card rounded-b-lg">
        <div className="text-xs text-muted-foreground mb-2 truncate">
            {nodeDefinition.description}
        </div>
        <div className="relative flex justify-between items-center min-h-[20px]">
          {/* Inputs */}
          <div className="space-y-2 flex flex-col items-start">
            {inputs.map((input, index) => (
              <div key={input.name} className="flex items-center gap-2 relative">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={input.name}
                  className="!w-3 !h-3 !bg-blue-400"
                />
                <span className="text-xs">{input.label}</span>
              </div>
            ))}
          </div>
          {/* Outputs */}
          <div className="space-y-2 flex flex-col items-end">
            {outputs.map((output, index) => (
              <div key={output.name} className="flex items-center gap-2 justify-end relative">
                <span className="text-xs">{output.label}</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={output.name}
                  className="!w-3 !h-3 !bg-green-400"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(CustomNode);

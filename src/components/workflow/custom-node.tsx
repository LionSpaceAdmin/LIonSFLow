"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AllNodeDefinitions } from "@/lib/node-definitions";
import { useWorkflowStore } from "@/lib/store/workflow-store";

const CustomNode = ({ id, data, selected, type: nodeType }: NodeProps) => {
  // The 'type' from NodeProps is the one registered in ReactFlow, which is 'custom'.
  // The actual functional type of our node is stored in the node's data.
  // For backward compatibility or nodes just added, we check node.type as well.
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
        "w-64 border-2 shadow-md hover:shadow-lg transition-shadow duration-200",
        selected ? "border-primary shadow-xl" : "border-card"
      )}
    >
      <CardHeader className={cn("p-2 rounded-t-lg", categoryColors[category] || 'bg-gray-500')}>
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1 rounded">
             <Icon className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm font-bold text-white font-headline truncate">{data.label || name}</p>
        </div>
      </CardHeader>
      <CardContent className="p-3 bg-card rounded-b-lg">
        <div className="text-xs text-muted-foreground mb-2">
            {nodeDefinition.description}
        </div>
        <div className="flex justify-between">
          {/* Inputs */}
          <div className="space-y-2">
            {inputs.map((input, index) => (
              <div key={input.name} className="flex items-center gap-2">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={input.name}
                  style={{ top: `calc(50% + ${index * 20}px - ${(inputs.length -1) * 10}px)` }}
                  className="!w-3 !h-3"
                />
                <span className="text-xs">{input.label}</span>
              </div>
            ))}
          </div>
          {/* Outputs */}
          <div className="space-y-2 text-right">
            {outputs.map((output, index) => (
              <div key={output.name} className="flex items-center gap-2 justify-end">
                <span className="text-xs">{output.label}</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={output.name}
                   style={{ top: `calc(50% + ${index * 20}px - ${(outputs.length -1) * 10}px)` }}
                  className="!w-3 !h-3"
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

    
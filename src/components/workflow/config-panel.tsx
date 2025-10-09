"use client";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useWorkflowStore } from "@/lib/store/workflow-store";
import { AllNodeDefinitions } from "@/lib/node-definitions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function ConfigPanel() {
  const { selectedNodeId, nodes, updateNodeConfig, setSelectedNodeId } = useWorkflowStore();
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const nodeDefinition = AllNodeDefinitions.find(
    (def) => def.type === selectedNode?.type
  );

  const { control, reset, watch } = useForm({
    defaultValues: selectedNode?.data || {},
  });

  // Reset form when the selected node changes
  useEffect(() => {
    if (selectedNode) {
      reset(selectedNode.data);
    }
  }, [selectedNode, reset]);

  // Watch for form changes and update the zustand store
  useEffect(() => {
    const subscription = watch((value) => {
      if (selectedNodeId) {
        updateNodeConfig(selectedNodeId, value);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, selectedNodeId, updateNodeConfig]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedNodeId(null);
    }
  };

  if (!selectedNode || !nodeDefinition) {
    return null;
  }

  const renderFormControl = (param: any, field: any) => {
    switch (param.type) {
      case "string":
        return <Input {...field} placeholder={param.description} />;
      case "textarea":
        return <Textarea {...field} placeholder={param.description} />;
      case "number":
        return <Input type="number" {...field} placeholder={param.description} />;
      case "boolean":
        return <Switch checked={field.value} onCheckedChange={field.onChange} />;
      case "select":
        return (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder={param.label} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return <Input {...field} />;
    }
  };

  return (
    <Sheet open={!!selectedNodeId} onOpenChange={handleOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col" side="left">
        <SheetHeader>
          <SheetTitle className="font-headline">{nodeDefinition.name}</SheetTitle>
          <SheetDescription>{nodeDefinition.description}</SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="flex-1 overflow-y-auto pr-4 space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium font-headline">פרמטרים</h3>
            {nodeDefinition.parameters.length > 0 ? (
              nodeDefinition.parameters.map((param) => (
                <div key={param.name} className="grid grid-cols-1 items-center gap-2">
                  <Label htmlFor={param.name}>{param.label}</Label>
                  <Controller
                    name={param.name}
                    control={control}
                    defaultValue={param.defaultValue}
                    render={({ field }) => (
                      <div>
                        {renderFormControl(param, field)}
                        {param.description && param.type !== 'string' && param.type !== 'textarea' && <p className="text-xs text-muted-foreground mt-1">{param.description}</p>}
                      </div>
                    )}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">אין פרמטרים להגדרה.</p>
            )}
          </div>
        </div>
        <SheetFooter>
          {/* Footer content can be added here if needed */}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

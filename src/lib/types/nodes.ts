export interface NodeParameter {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'textarea' | 'code';
  defaultValue?: any;
  options?: { value: string; label: string }[];
  description?: string;
}

export interface NodeDefinition {
  id: string;
  type: string;
  name: string;
  category: 'Triggers' | 'Actions' | 'Processing' | 'Logic' | 'AI & Generative';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  inputs: { name: string; label: string }[];
  outputs: { name: string; label: string }[];
  parameters: NodeParameter[];
}

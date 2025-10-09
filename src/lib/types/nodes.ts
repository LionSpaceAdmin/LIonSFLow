export interface NodeParameter {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'textarea' | 'code';
  defaultValue?: any;
  options?: { value: string; label: string }[];
  description?: string;
}

export type NodeCategory = 'טריגרים' | 'פעולות' | 'עיבוד' | 'לוגיקה' | 'בינה מלאכותית וגנרטיבית' | 'GCP';


export interface NodeDefinition {
  id: string;
  type: string;
  name: string;
  category: NodeCategory;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  inputs: { name: string; label: string, type: string }[];
  outputs: { name: string; label: string, type: string }[];
  parameters: NodeParameter[];
}

    
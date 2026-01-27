export interface Resource {
  name: string;
  displayName: string;
  type: 'doc' | 'note' | 'material';
  icon?: string;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    fileType?: string;
    [key: string]: unknown;
  };
}

export interface ResourcesResponse {
  resources: Resource[];
  counts?: {
    docs: number;
    notes: number;
    materials: number;
  };
  error?: string;
}

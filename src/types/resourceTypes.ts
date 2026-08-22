export interface Resource {
  name: string;
  displayName: string;
  type: 'note' | 'material';
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
    notes: number;
    materials: number;
  };
  error?: string;
}

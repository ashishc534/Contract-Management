export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ContractVariables {
  contractType?: string;
  partyNames?: string[];
  amount?: string;
  date?: string;
  expirationDate?: string;
  signatures?: string[];
  otherFields?: Record<string, any>;
}

export interface Contract {
  id: string;
  filename: string;
  originalFilename: string;
  filePath: string;
  fileSize: number;
  uploadDate: string;
  variables: ContractVariables;
  extractionStatus: string;
  extractedText?: string;
  userId: string;
}

export interface Analytics {
  total_contracts: number;
  auto_extracted: number;
  manual_required: number;
  manually_edited: number;
  total_size: number;
}

export interface ContractType {
  contract_type: string;
  count: number;
}

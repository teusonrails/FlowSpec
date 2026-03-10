export interface FlowSpecHeader {
  name: string;
  version: string;
  flowspec: string;
  author: string;
  classification: {
    domain: string;
    platform: string;
    complexity: string;
  };
}

export interface FlowSpecStep {
  id: string;
  name: string;
  type: string;
  description: string;
  input: string;
  output: string;
  onError: string;
}

export interface FlowSpecValidationCheck {
  section: string;
  passed: boolean;
  message: string;
  severity: "error" | "warning" | "info";
}

export interface FlowSpecValidationResult {
  valid: boolean;
  score: number;
  checks: FlowSpecValidationCheck[];
}

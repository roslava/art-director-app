export type AgentMetadataValue = string | number | boolean | string[];

export interface AgentApproval {
  status: string;
  reviewerId?: string;
  notes?: string;
}

export interface AgentContext {
  requestId?: string;
  projectId?: string;
  subjectId?: string;
  instructions?: string[];
  constraints?: string[];
  approval?: AgentApproval;
  metadata?: Record<string, AgentMetadataValue>;
}

export interface AgentReasoning {
  explanation: string;
  assumptions: string[];
  uncertainties: string[];
  evidenceIds: string[];
}

export interface AgentConfidence {
  level: string;
  score?: number;
  rationale?: string;
}

export interface AgentResult<T> {
  data: T;
  reasoning: AgentReasoning;
  confidence: AgentConfidence;
  warnings: string[];
  approval?: AgentApproval;
  metadata?: Record<string, AgentMetadataValue>;
}

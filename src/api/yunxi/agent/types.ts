export interface YunxiHealthVo {
  serviceName: string;
  status: string;
  chatProvider: string;
  embeddingProvider: string;
  rerankProvider: string;
}

export interface AgentSessionCreateBo {
  title?: string;
  businessType?: string;
  customerId?: string;
}

export interface AgentSessionVo {
  sessionId: string | number;
  title: string;
  businessType: string;
  customerId: string;
  status: string;
  createTime?: string;
}

export interface AgentMessageVo {
  messageId: string | number;
  sessionId: string | number;
  traceId?: string | number;
  role: string;
  content: string;
  contentType: string;
  sequenceNo: number;
  status: string;
  createTime?: string;
}

export interface AgentTraceVo {
  traceId: string | number;
  sessionId: string | number;
  businessType: string;
  status: string;
  startedAt?: string;
  finishedAt?: string;
  elapsedMs?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface AgentTraceStepVo {
  stepId: string | number;
  traceId: string | number;
  parentStepId?: string | number;
  stepOrder: number;
  stepName: string;
  stepType: string;
  eventType?: string;
  status: string;
  elapsedMs?: number;
}

export interface AgentTraceDetailVo {
  trace?: AgentTraceVo;
  steps: AgentTraceStepVo[];
}

import request from '@/utils/request';
import { AgentMessageVo, AgentSessionCreateBo, AgentSessionVo, AgentTraceDetailVo, YunxiHealthVo } from './types';

export const getYunxiHealth = () => {
  return request({
    url: '/yunxi/health',
    method: 'get'
  });
};

export const createAgentSession = (data: AgentSessionCreateBo) => {
  return request({
    url: '/yunxi/agent/sessions',
    method: 'post',
    data
  });
};

export const listAgentMessages = (sessionId: string | number) => {
  return request({
    url: `/yunxi/agent/sessions/${sessionId}/messages`,
    method: 'get'
  });
};

export const getAgentTrace = (traceId: string | number) => {
  return request({
    url: `/yunxi/admin/traces/${traceId}`,
    method: 'get'
  });
};

export type { AgentMessageVo, AgentSessionCreateBo, AgentSessionVo, AgentTraceDetailVo, YunxiHealthVo };

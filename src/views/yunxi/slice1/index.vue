<template>
  <div class="p-2">
    <el-row :gutter="12">
      <el-col :xs="24" :lg="9">
        <el-card shadow="hover" class="mb-[12px]">
          <template #header>
            <div class="panel-header">
              <span>服务探活</span>
              <el-button type="primary" plain icon="Refresh" :loading="healthLoading" @click="handleHealth">刷新</el-button>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="服务">{{ health?.serviceName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="health?.status === 'UP' ? 'success' : 'info'">{{ health?.status || '未查询' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Chat">{{ health?.chatProvider || '-' }}</el-descriptions-item>
            <el-descriptions-item label="Embedding">{{ health?.embeddingProvider || '-' }}</el-descriptions-item>
            <el-descriptions-item label="Rerank">{{ health?.rerankProvider || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="hover">
          <template #header>
            <div class="panel-header">
              <span>创建会话</span>
              <el-button type="primary" icon="Plus" :loading="sessionLoading" @click="handleCreateSession">创建</el-button>
            </div>
          </template>
          <el-form ref="sessionFormRef" :model="sessionForm" :rules="sessionRules" label-width="86px">
            <el-form-item label="标题" prop="title">
              <el-input v-model="sessionForm.title" maxlength="120" placeholder="请输入会话标题" />
            </el-form-item>
            <el-form-item label="业务类型" prop="businessType">
              <el-select v-model="sessionForm.businessType" class="w-full" placeholder="请选择业务类型">
                <el-option label="投诉沟通" value="complaint" />
                <el-option label="政企拜访" value="enterprise_visit" />
                <el-option label="套餐咨询" value="package_consult" />
                <el-option label="外呼质检" value="outbound_quality" />
              </el-select>
            </el-form-item>
            <el-form-item label="客户编号" prop="customerId">
              <el-input v-model="sessionForm.customerId" maxlength="64" placeholder="请输入客户编号" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="15">
        <el-card shadow="hover" class="mb-[12px]">
          <template #header>
            <div class="panel-header">
              <span>会话结果</span>
              <el-button icon="Refresh" :disabled="!currentSession?.sessionId" :loading="messageLoading" @click="handleLoadMessages">查消息</el-button>
            </div>
          </template>
          <el-empty v-if="!currentSession" description="尚未创建会话" />
          <el-descriptions v-else :column="2" border>
            <el-descriptions-item label="Session ID">{{ currentSession.sessionId }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag>{{ currentSession.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="标题">{{ currentSession.title || '-' }}</el-descriptions-item>
            <el-descriptions-item label="业务类型">{{ currentSession.businessType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="客户编号">{{ currentSession.customerId || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentSession.createTime || '-' }}</el-descriptions-item>
          </el-descriptions>

          <el-table v-if="messages.length" class="mt-[12px]" border :data="messages">
            <el-table-column label="序号" prop="sequenceNo" width="80" align="center" />
            <el-table-column label="角色" prop="role" width="100" />
            <el-table-column label="Trace ID" prop="traceId" width="140" />
            <el-table-column label="状态" prop="status" width="100" />
            <el-table-column label="内容" prop="content" min-width="220" show-overflow-tooltip />
          </el-table>
        </el-card>

        <el-card shadow="hover">
          <template #header>
            <div class="panel-header">
              <span>Trace 查询</span>
              <el-button type="primary" plain icon="Search" :loading="traceLoading" @click="handleLoadTrace">查询</el-button>
            </div>
          </template>
          <el-form :model="traceForm" :inline="true">
            <el-form-item label="Trace ID">
              <el-input v-model="traceForm.traceId" class="trace-input" placeholder="输入 traceId" clearable @keyup.enter="handleLoadTrace" />
            </el-form-item>
          </el-form>

          <el-empty v-if="!traceDetail?.trace && !traceDetail?.steps?.length" description="暂无 Trace 数据" />
          <template v-else>
            <el-descriptions v-if="traceDetail.trace" :column="2" border class="mb-[12px]">
              <el-descriptions-item label="Trace ID">{{ traceDetail.trace.traceId }}</el-descriptions-item>
              <el-descriptions-item label="Session ID">{{ traceDetail.trace.sessionId }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{ traceDetail.trace.status }}</el-descriptions-item>
              <el-descriptions-item label="耗时">{{ traceDetail.trace.elapsedMs ?? '-' }} ms</el-descriptions-item>
              <el-descriptions-item label="错误码">{{ traceDetail.trace.errorCode || '-' }}</el-descriptions-item>
              <el-descriptions-item label="错误信息">{{ traceDetail.trace.errorMessage || '-' }}</el-descriptions-item>
            </el-descriptions>
            <el-table border :data="traceDetail.steps || []">
              <el-table-column label="顺序" prop="stepOrder" width="80" align="center" />
              <el-table-column label="步骤" prop="stepName" min-width="150" />
              <el-table-column label="类型" prop="stepType" width="120" />
              <el-table-column label="事件" prop="eventType" width="140" />
              <el-table-column label="状态" prop="status" width="100" />
              <el-table-column label="耗时(ms)" prop="elapsedMs" width="110" align="right" />
            </el-table>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="YunxiSliceOne" lang="ts">
import { createAgentSession, getAgentTrace, getYunxiHealth, listAgentMessages } from '@/api/yunxi/agent';
import { AgentMessageVo, AgentSessionCreateBo, AgentSessionVo, AgentTraceDetailVo, YunxiHealthVo } from '@/api/yunxi/agent/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const sessionFormRef = ref<ElFormInstance>();
const healthLoading = ref(false);
const sessionLoading = ref(false);
const messageLoading = ref(false);
const traceLoading = ref(false);

const health = ref<YunxiHealthVo>();
const currentSession = ref<AgentSessionVo>();
const messages = ref<AgentMessageVo[]>([]);
const traceDetail = ref<AgentTraceDetailVo>();

const sessionForm = reactive<AgentSessionCreateBo>({
  title: '投诉沟通辅助',
  businessType: 'complaint',
  customerId: 'C10001'
});

const traceForm = reactive({
  traceId: ''
});

const sessionRules = {
  title: [{ required: true, message: '会话标题不能为空', trigger: 'blur' }],
  businessType: [{ required: true, message: '业务类型不能为空', trigger: 'change' }],
  customerId: [{ required: true, message: '客户编号不能为空', trigger: 'blur' }]
};

const unwrapData = <T,>(res: any): T => {
  return (res?.data ?? res) as T;
};

const handleHealth = async () => {
  healthLoading.value = true;
  try {
    health.value = unwrapData<YunxiHealthVo>(await getYunxiHealth());
  } finally {
    healthLoading.value = false;
  }
};

const handleCreateSession = () => {
  sessionFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    sessionLoading.value = true;
    try {
      currentSession.value = unwrapData<AgentSessionVo>(await createAgentSession({ ...sessionForm }));
      messages.value = [];
      proxy?.$modal.msgSuccess('会话创建成功');
    } finally {
      sessionLoading.value = false;
    }
  });
};

const handleLoadMessages = async () => {
  if (!currentSession.value?.sessionId) {
    proxy?.$modal.msgWarning('请先创建会话');
    return;
  }
  messageLoading.value = true;
  try {
    messages.value = unwrapData<AgentMessageVo[]>(await listAgentMessages(currentSession.value.sessionId)) || [];
  } finally {
    messageLoading.value = false;
  }
};

const handleLoadTrace = async () => {
  if (!traceForm.traceId) {
    proxy?.$modal.msgWarning('请输入 Trace ID');
    return;
  }
  traceLoading.value = true;
  try {
    traceDetail.value = unwrapData<AgentTraceDetailVo>(await getAgentTrace(traceForm.traceId));
  } finally {
    traceLoading.value = false;
  }
};

onMounted(() => {
  handleHealth();
});
</script>

<style scoped>
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
}

.trace-input {
  width: 260px;
}

.w-full {
  width: 100%;
}
</style>

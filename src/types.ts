// 国风 AI Agent 应用 — 数据类型定义

import type { KBTopic } from "@/lib/knowledgeBase";

export type Role = "user" | "agent";

export type ToolType = "ink" | "paper" | "book";

export interface Citation {
  source: string;
  snippet: string;
}

export interface ToolInvoke {
  type: ToolType;
  label: string;
  detail: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  citations?: Citation[];
  toolInvokes?: ToolInvoke[];
  /** 是否处于流式书写中（控制墨迹晕染动效） */
  streaming?: boolean;
  /** 大模型思考过程（<think>标签内容）· 对话流不显示 · 思考抽屉可见 */
  thinking?: string;
  /** 是否有思考过程可供查看 */
  hasThinking?: boolean;
}

export type TaskStatus = "pending" | "running" | "done";

export type TaskIcon = "pavilion" | "bridge" | "boat" | "tower" | "tree" | "moon";

export interface TaskNode {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  icon: TaskIcon;
}

export interface TaskPlan {
  id: string;
  query: string;
  nodes: TaskNode[];
}

export type FeatureMotif = "plum" | "orchid" | "bamboo" | "chrysanthemum" | "lotus" | "pine";

export interface Feature {
  id: string;
  title: string;
  subtitle: string;
  motif: FeatureMotif;
  initialQuery: string;
  /** 任务规划模板 ID */
  taskTemplate: string;
}

export interface MemoryEntry {
  id: string;
  label: string;
  content: string;
  /** 时间戳 */
  ts: number;
}

// —— 研思录 · 思考链条目 ——
export type TraceKind = "node" | "tool" | "kb" | "llm" | "distill";

export interface ThinkingTrace {
  id: string;
  kind: TraceKind;
  title: string;       // 节点标题/工具名/知识来源
  detail: string;      // 描述
  status?: TaskStatus; // node 类型用
  ts: number;
}

// —— 案头索引 · 问答归目条目 ——
export interface IndexEntry {
  id: string;
  query: string;          // 用户所问
  topic: KBTopic;         // 归属主题
  citations: Citation[];  // 命中典据（来自知识库或大模型）
  ts: number;
}

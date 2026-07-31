// 行军图任务规划长卷 — 纵向展开，节点为亭台楼阁
import type { TaskPlan, TaskStatus } from "@/types";
import TaskIconSvg from "./TaskIconSvg";
import { useDynastyMeta } from "@/store/themeStore";

interface TaskScrollProps {
  plan: TaskPlan | null;
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "待行",
  running: "行进中",
  done: "已至",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  pending: "rgb(var(--c-qingbi-light-rgb))",
  running: "rgb(var(--c-zheshi-rgb))",
  done: "rgb(var(--c-qingbi-rgb))",
};

export default function TaskScroll({ plan }: TaskScrollProps) {
  const meta = useDynastyMeta();
  if (!plan) {
    return (
      <div className="h-full flex items-center justify-center px-6 py-12 text-center">
        <div className="font-song text-sm text-qingbi/50 tracking-wider leading-loose">
          <p>尚无行军之图</p>
          <p className="mt-1 text-xs">客有命题，方展长卷</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 卷首 — 标题 */}
      <div className="px-5 py-4 border-b border-qingbi/15 bg-qingbi/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-song text-xs text-qingbi/60 tracking-widest">行军图 · 任务规划</p>
            <h3 className="mt-0.5 font-brush text-xl text-daiqing tracking-wider">{plan.query}</h3>
          </div>
          <span className="seal w-8 h-8 text-xs rotate-[-3deg]">行军</span>
        </div>
      </div>

      {/* 长卷节点流 */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="relative">
          {/* 山径连线 */}
          <svg
            className="absolute left-6 top-0 w-1 h-full"
            viewBox="0 0 4 400"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1="2" y1="0" x2="2" y2="400"
              stroke="rgb(var(--c-qingbi-rgb))"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              opacity="0.4"
            />
          </svg>

          <ul className="space-y-5">
            {plan.nodes.map((node, idx) => {
              const isLast = idx === plan.nodes.length - 1;
              return (
                <li
                  key={node.id}
                  className="relative pl-16 animate-liftUp"
                  style={{ animationDelay: `${idx * 80}ms`, opacity: 0 }}
                >
                  {/* 节点图标 — 覆盖在连线上 */}
                  <div
                    className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center rounded-full border-2 bg-xuanzhi-light transition-all duration-500"
                    style={{
                      borderColor: STATUS_COLOR[node.status],
                      boxShadow:
                        node.status === "running"
                          ? "0 0 0 4px rgb(var(--c-zheshi-rgb) / 0.15)"
                          : node.status === "done"
                          ? "0 0 0 3px rgb(var(--c-qingbi-rgb) / 0.12)"
                          : "none",
                    }}
                  >
                    <TaskIconSvg
                      icon={node.icon}
                      className={`w-7 h-7 transition-all duration-500 ${
                        node.status === "pending" ? "opacity-40 grayscale" : "opacity-100"
                      }`}
                    />

                    {/* 序号小印 */}
                    <span
                      className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-song rounded-full border"
                      style={{
                        backgroundColor: STATUS_COLOR[node.status],
                        color: "rgb(var(--c-xuanzhi-light-rgb))",
                        borderColor: "rgb(var(--c-xuanzhi-light-rgb))",
                      }}
                    >
                      {idx + 1}
                    </span>
                  </div>

                  {/* 节点信息卡 */}
                  <div
                    className="px-3.5 py-2.5 border transition-all duration-500"
                    style={{
                      backgroundColor:
                        node.status === "running"
                          ? "rgb(var(--c-zheshi-rgb) / 0.06)"
                          : node.status === "done"
                          ? "rgb(var(--c-qingbi-rgb) / 0.05)"
                          : "rgb(var(--c-xuanzhi-light-rgb) / 0.5)",
                      borderColor:
                        node.status === "running"
                          ? "rgb(var(--c-zheshi-rgb) / 0.3)"
                          : "rgb(var(--c-qingbi-rgb) / 0.15)",
                      borderRadius: "2px",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-song text-sm text-daiqing tracking-wider">
                        {node.title}
                      </h4>
                      <span
                        className="font-song text-[10px] px-1.5 py-0.5 tracking-widest"
                        style={{
                          color: STATUS_COLOR[node.status],
                          border: `1px solid ${STATUS_COLOR[node.status]}`,
                          borderRadius: "2px",
                        }}
                      >
                        {STATUS_LABEL[node.status]}
                      </span>
                    </div>
                    <p className="mt-1 font-sans text-xs text-qingbi/70 leading-relaxed">
                      {node.description}
                    </p>
                  </div>

                  {/* 终点标记 */}
                  {isLast && node.status === "done" && (
                    <div className="absolute -bottom-3 left-7 text-zhusha">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                        <path d="M3,12 L9,18 L21,6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* 卷尾落款 */}
      <div className="px-5 py-2.5 border-t border-qingbi/15 bg-qingbi/5 flex items-center justify-between">
        <span className="font-song text-[10px] text-qingbi/50 tracking-widest">
          共 {plan.nodes.length} 站
        </span>
        <span className="font-song text-[10px] text-qingbi/50 tracking-widest">
          行军图 · {meta.brand}制
        </span>
      </div>
    </div>
  );
}

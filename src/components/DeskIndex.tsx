// 案头 · 翰墨索引 — 按用户问题归属主题归类 · 每问下挂命中的典据
// 数据源：chatStore.indexEntries（每轮问答归目条目）
// 主题模式：所有问题归入当前主题；兼容模式：按问题内容推断归属主题
import { useMemo } from "react";
import type { IndexEntry } from "@/types";
import type { KBTopic } from "@/lib/knowledgeBase";
import { useDynastyMeta } from "@/store/themeStore";

interface DeskIndexProps {
  indexEntries: IndexEntry[];
  currentTopic?: KBTopic;   // 主题模式时高亮当前主题
  plan?: { query?: string } | null;
}

interface TopicMeta {
  key: KBTopic;
  label: string;
  hint: string;
  accent: string;
  icon: string;   // 单字图标
}

const TOPICS: TopicMeta[] = [
  { key: "shici",  label: "诗词", hint: "韵文之属", accent: "#A4392F", icon: "诗" },
  { key: "shuhua", label: "书画", hint: "笔墨之属", accent: "#B8763E", icon: "画" },
  { key: "chadao", label: "茶道", hint: "盏茗之属", accent: "#3D6B6E", icon: "茶" },
  { key: "jieqi",  label: "节气", hint: "时令之属", accent: "#5C8A8D", icon: "节" },
  { key: "guqin",  label: "古琴", hint: "弦歌之属", accent: "#8AA0A8", icon: "琴" },
  { key: "wendao", label: "问道", hint: "雅事之属", accent: "#9C7E3F", icon: "雅" },
];

// 地支时辰
function earthlyHour(date = new Date()): { zhi: string; period: string } {
  const h = date.getHours();
  const zhiList = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const periodList = ["夜半", "鸡鸣", "平旦", "日出", "食时", "隅中", "日中", "日昳", "晡时", "日入", "黄昏", "人定"];
  const idx = Math.floor((h + 1) / 2) % 12;
  return { zhi: zhiList[idx], period: periodList[idx] };
}

export default function DeskIndex({ indexEntries, currentTopic, plan }: DeskIndexProps) {
  const { zhi, period } = useMemo(earthlyHour, []);
  const meta = useDynastyMeta();

  // 按主题分组
  const grouped = useMemo(() => {
    const map: Record<KBTopic, IndexEntry[]> = {
      shici: [], shuhua: [], chadao: [], jieqi: [], guqin: [], wendao: [],
    };
    indexEntries.forEach((e) => {
      if (map[e.topic]) map[e.topic].push(e);
    });
    return map;
  }, [indexEntries]);

  const totalEntries = indexEntries.length;
  const activeTopics = TOPICS.filter((t) => grouped[t.key].length > 0);

  return (
    <div className="h-full flex flex-col">
      {/* 标题栏 */}
      <div className="px-4 py-3 border-b border-qingbi/15 bg-qingbi/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="seal w-7 h-7 text-[10px] rotate-[-3deg]">案头</span>
          <div className="leading-tight">
            <div className="font-song text-sm text-daiqing tracking-wider">翰墨索引</div>
            <div className="font-song text-[10px] text-qingbi/55 tracking-wider">所问归目 · 随检</div>
          </div>
        </div>
        {/* 时辰 */}
        <div className="text-right leading-tight">
          <div className="font-song text-sm text-zheshi">
            {zhi}<span className="text-[10px] ml-0.5">时</span>
          </div>
          <div className="font-song text-[10px] text-qingbi/55 tracking-wider">{period}</div>
        </div>
      </div>

      {/* 本次清话 */}
      {plan?.query && (
        <div className="px-4 py-2.5 border-b border-qingbi/10 bg-xuanzhi/30">
          <div className="font-song text-[10px] text-qingbi/50 tracking-widest mb-1">本次清话</div>
          <div className="font-song text-xs text-daiqing leading-relaxed line-clamp-2">
            「{plan.query}」
          </div>
        </div>
      )}

      {/* 索引列表 · 按六大主题归目 */}
      <div className="flex-1 overflow-y-auto">
        {totalEntries === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10">
            <svg viewBox="0 0 48 48" className="w-10 h-10 mb-3 opacity-40" aria-hidden="true">
              <rect x="10" y="6" width="28" height="36" rx="1" fill="none" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="1.2" />
              <line x1="24" y1="6" x2="24" y2="42" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.8" />
              <line x1="10" y1="15" x2="38" y2="15" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.6" strokeDasharray="2 2" />
              <line x1="10" y1="33" x2="38" y2="33" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.6" strokeDasharray="2 2" />
            </svg>
            <p className="font-song text-xs text-qingbi/55 leading-relaxed">
              尚无问目<br />待客有命题，归目自现
            </p>
          </div>
        ) : (
          <div className="py-2">
            {/* 主题概览 · 六色印章 */}
            <div className="px-4 pb-2 flex items-center gap-1.5 flex-wrap">
              {TOPICS.map((t) => {
                const count = grouped[t.key].length;
                const active = count > 0;
                const isCurrent = currentTopic === t.key;
                return (
                  <span
                    key={t.key}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 font-song text-[10px] tracking-wider"
                    style={{
                      color: active ? t.accent : "rgb(var(--c-qingbi-rgb) / 0.35)",
                      border: `1px solid ${active ? t.accent : "rgb(var(--c-qingbi-rgb) / 0.15)"}`,
                      backgroundColor: isCurrent ? `${t.accent}10` : "transparent",
                      borderRadius: "2px",
                    }}
                    title={t.label}
                  >
                    {t.icon}{active ? `·${count}` : ""}
                  </span>
                );
              })}
            </div>

            {/* 各主题下的问答条目 */}
            {activeTopics.map((topic) => {
              const items = grouped[topic.key];
              const isCurrent = currentTopic === topic.key;
              return (
                <div key={topic.key} className="mb-1">
                  {/* 主题标题 */}
                  <div className="px-4 py-1.5 flex items-center gap-2">
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-song"
                      style={{
                        backgroundColor: `${topic.accent}14`,
                        color: topic.accent,
                        border: `1px solid ${topic.accent}55`,
                        borderRadius: "2px",
                      }}
                    >
                      {topic.icon}
                    </span>
                    <span className="font-song text-xs text-daiqing tracking-widest">{topic.label}</span>
                    <span className="font-song text-[10px] text-qingbi/45">· {topic.hint}</span>
                    {isCurrent && (
                      <span className="font-song text-[9px] text-zheshi tracking-widest">· 本室</span>
                    )}
                    <span className="ml-auto font-song text-[10px] text-qingbi/55">{items.length}</span>
                  </div>
                  {/* 该主题下的问答 */}
                  <ul>
                    {items.map((item, i) => (
                      <li
                        key={item.id}
                        className="px-4 py-2 mx-2 mb-1 hover:bg-xuanzhi/40 transition-colors group"
                        style={{ borderLeft: `2px solid ${topic.accent}33` }}
                      >
                        <div className="flex items-start gap-2">
                          {/* 朱印编号 */}
                          <span
                            className="shrink-0 inline-flex items-center justify-center w-5 h-5 mt-0.5 text-[10px] font-song"
                            style={{
                              backgroundColor: `${topic.accent}14`,
                              color: topic.accent,
                              border: `1px solid ${topic.accent}55`,
                              borderRadius: "2px",
                            }}
                          >
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            {/* 所问 */}
                            <div className="font-song text-xs text-daiqing font-medium line-clamp-1">
                              {item.query}
                            </div>
                            {/* 命中典据 */}
                            {item.citations.length > 0 ? (
                              <div className="mt-1 space-y-0.5">
                                {item.citations.slice(0, 2).map((c, ci) => (
                                  <div
                                    key={ci}
                                    className="font-song text-[11px] text-qingbi/60 leading-relaxed flex items-start gap-1"
                                  >
                                    <span
                                      className="shrink-0 inline-block w-1 h-1 rounded-full mt-1.5"
                                      style={{ backgroundColor: topic.accent }}
                                    />
                                    <span className="line-clamp-1">《{c.source}》— {c.snippet}</span>
                                  </div>
                                ))}
                                {item.citations.length > 2 && (
                                  <div className="font-song text-[10px] text-qingbi/45 ml-2">
                                    另引 {item.citations.length - 2} 条…
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="mt-1 font-song text-[10px] text-qingbi/45 italic">
                                · 灵台运思 · 无典据
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 底部 · 统计 */}
      <div className="px-4 py-2.5 border-t border-qingbi/15 bg-qingbi/5">
        <div className="flex items-center justify-between">
          <span className="font-song text-[10px] text-qingbi/50 tracking-widest">
            共问 {totalEntries} 题 · 归 {activeTopics.length} 目
          </span>
          <span className="font-song text-[10px] text-qingbi/50 tracking-widest">
            案头 · {meta.brand}手录
          </span>
        </div>
      </div>
    </div>
  );
}

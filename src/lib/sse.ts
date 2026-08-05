// 各家 LLM 流式/非流式响应解析 · 纯函数 · 可单测
// OpenAI 兼容 / Anthropic / Gemini 三种响应结构各异 · 此处统一提取增量文本

export type ApiResponse = Record<string, unknown>;

// 流式单条增量文本 · 无增量返回空串
export function extractDelta(j: ApiResponse, style: string): string {
  if (style === "anthropic") {
    if (j?.type === "content_block_delta") {
      const delta = j.delta as { text?: string } | undefined;
      return delta?.text ?? "";
    }
    return "";
  }
  if (style === "gemini") {
    const candidates = j.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined;
    return candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
  // openai
  const choices = j.choices as Array<{ delta?: { content?: string } }> | undefined;
  return choices?.[0]?.delta?.content ?? "";
}

// 非流式完整文本
export function extractFull(j: ApiResponse, style: string): string {
  if (style === "anthropic") {
    const content = (j.content as Array<{ text?: string }> | undefined) ?? [];
    return content.map((c) => c?.text ?? "").join("");
  }
  if (style === "gemini") {
    const candidates = j.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined;
    return candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
  const choices = j.choices as Array<{ message?: { content?: string } }> | undefined;
  return choices?.[0]?.message?.content ?? "";
}

// 消费一段 SSE 文本 · 返回提取到的增量列表与剩余缓冲（半行留在 buf 下一轮拼接）
export function consumeSSEBuffer(buf: string, style: string): { deltas: string[]; rest: string } {
  const lines = buf.split("\n");
  const rest = lines.pop() || "";
  const deltas: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || !t.startsWith("data:")) continue;
    const data = t.slice(5).trim();
    if (data === "[DONE]") continue;
    try {
      const j = JSON.parse(data) as ApiResponse;
      const delta = extractDelta(j, style);
      if (delta) deltas.push(delta);
    } catch {
      /* 跳过非 JSON 行 */
    }
  }
  return { deltas, rest };
}

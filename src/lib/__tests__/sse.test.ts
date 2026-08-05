import { describe, expect, it } from "vitest";
import { consumeSSEBuffer, extractDelta, extractFull } from "@/lib/sse";

describe("extractDelta · 各家流式增量", () => {
  it("OpenAI 兼容：choices[0].delta.content", () => {
    expect(extractDelta({ choices: [{ delta: { content: "青" } }] }, "openai")).toBe("青");
  });

  it("OpenAI 无增量时返回空串", () => {
    expect(extractDelta({ choices: [{}] }, "openai")).toBe("");
  });

  it("Anthropic：content_block_delta", () => {
    const j = { type: "content_block_delta", delta: { text: "砚" } };
    expect(extractDelta(j, "anthropic")).toBe("砚");
  });

  it("Anthropic 其它事件类型返回空串", () => {
    expect(extractDelta({ type: "message_start" }, "anthropic")).toBe("");
  });

  it("Gemini：candidates[0].content.parts[0].text", () => {
    const j = { candidates: [{ content: { parts: [{ text: "墨" }] } }] };
    expect(extractDelta(j, "gemini")).toBe("墨");
  });
});

describe("extractFull · 非流式全文", () => {
  it("OpenAI", () => {
    expect(extractFull({ choices: [{ message: { content: "全文" } }] }, "openai")).toBe("全文");
  });

  it("Anthropic 多段拼接", () => {
    expect(extractFull({ content: [{ text: "青" }, { text: "砚" }] }, "anthropic")).toBe("青砚");
  });

  it("Gemini", () => {
    expect(extractFull({ candidates: [{ content: { parts: [{ text: "玄墨" }] } }] }, "gemini")).toBe("玄墨");
  });
});

describe("consumeSSEBuffer · 流式缓冲消费", () => {
  it("逐条提取增量并保留半行缓冲", () => {
    const buf = [
      'data: {"choices":[{"delta":{"content":"青"}}]}',
      "",
      'data: {"choices":[{"delta":{"content":"砚"}}]}',
      "data: [DONE]",
      'data: {"choices":[{"delta":{"content":"半', // 未换行结尾 → 应留在 rest 下一轮拼接
    ].join("\n");
    const { deltas, rest } = consumeSSEBuffer(buf, "openai");
    expect(deltas).toEqual(["青", "砚"]);
    expect(rest).toBe('data: {"choices":[{"delta":{"content":"半');
  });

  it("跳过空行与非 JSON 行", () => {
    // 末尾补空串使 join 以 \n 收尾 · 最后一条数据行是完整行而非半行缓冲
    const buf = ["data: 不是JSON", "", ": 注释行", 'data: {"choices":[{"delta":{"content":"好"}}]}', ""].join("\n");
    const { deltas } = consumeSSEBuffer(buf, "openai");
    expect(deltas).toEqual(["好"]);
  });
});

import { describe, expect, it } from "vitest";
import { entryToMd, mdToEntry, parseMarkdown } from "@/lib/markdownParser";

describe("parseMarkdown · frontmatter 解析", () => {
  it("解析 key: value 与数组", () => {
    const raw = "---\ntitle: 宋代点茶\ntags: [茶, 宋]\ntopic: chadao\n---\n\n正文内容";
    const { frontmatter, content } = parseMarkdown(raw);
    expect(frontmatter.title).toBe("宋代点茶");
    expect(frontmatter.topic).toBe("chadao");
    expect(frontmatter.tags).toEqual(["茶", "宋"]);
    expect(content).toBe("正文内容");
  });

  it("无 frontmatter 时返回空对象与全文", () => {
    const { frontmatter, content } = parseMarkdown("只是正文");
    expect(Object.keys(frontmatter)).toHaveLength(0);
    expect(content).toBe("只是正文");
  });
});

describe("mdToEntry · 外接库条目映射", () => {
  it("映射到 external 库条目", () => {
    const e = mdToEntry("---\ntitle: 七言绝句格律\n---\n\n四句每句七字。", "C:/vault/poem.md", "poem.md", "myvault");
    expect(e).not.toBeNull();
    expect(e!.question).toBe("七言绝句格律");
    expect(e!.library).toBe("external");
    expect(e!.source).toBe("external");
    expect(e!.origin).toContain("myvault");
  });

  it("正文过短返回 null", () => {
    expect(mdToEntry("", "x", "y.md", "v")).toBeNull();
  });
});

describe("entryToMd · 写出 frontmatter", () => {
  it("包含 title/topic/tags 与正文", () => {
    const md = entryToMd("问题", "答案", "shici", ["诗"]);
    expect(md).toContain("title: 问题");
    expect(md).toContain("topic: shici");
    expect(md).toContain("tags: [诗]");
    expect(md).toContain("答案");
  });
});

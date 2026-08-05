import { describe, expect, it } from "vitest";
import { isHuaxiaRelated, matchedHuaxiaTags } from "@/lib/huaxiaFilter";

describe("isHuaxiaRelated · 华夏相关性", () => {
  it("命中朝代关键词", () => {
    expect(isHuaxiaRelated("宋代点茶有什么讲究")).toBe(true);
  });

  it("命中诗词关键词", () => {
    expect(isHuaxiaRelated("绝句的平仄怎么排")).toBe(true);
  });

  it("不相关问题不命中", () => {
    expect(isHuaxiaRelated("今天天气怎么样")).toBe(false);
  });
});

describe("matchedHuaxiaTags · 命中标签", () => {
  it("返回命中的关键词", () => {
    const tags = matchedHuaxiaTags("宋代点茶");
    expect(tags).toContain("宋");
    expect(tags).toContain("点茶");
  });
});

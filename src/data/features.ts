import type { Feature, TaskPlan } from "@/types";
import type { Dynasty } from "@/store/themeStore";

// 六事雅赏 · 按朝代定制内容
// 框架通用（诗词/书画/茶道/节气/古琴/问道），id 不变以兼容知识库主题与路由
// 各朝代切入角度与代表内容不同 · 切换朝代时多宝阁随之换新
const dynastyFeatures: Record<Dynasty, Feature[]> = {
  // —— 宋朝 · 文人雅致 · 青绿山水 ——
  song: [
    {
      id: "shici",
      title: "诗词",
      subtitle: "以韵为骨",
      motif: "plum",
      initialQuery: "为我拟一首七言绝句，题作「秋山夜雨」",
      taskTemplate: "shici",
    },
    {
      id: "shuhua",
      title: "书画",
      subtitle: "笔墨生韵",
      motif: "orchid",
      initialQuery: "解读北宋范宽《溪山行旅图》的构图与笔法",
      taskTemplate: "shuhua",
    },
    {
      id: "chadao",
      title: "茶道",
      subtitle: "一盏清欢",
      motif: "bamboo",
      initialQuery: "详述宋代点茶法的器具与工序",
      taskTemplate: "chadao",
    },
    {
      id: "jieqi",
      title: "节气",
      subtitle: "四时有序",
      motif: "chrysanthemum",
      initialQuery: "今日霜降，应如何养生与赏景",
      taskTemplate: "jieqi",
    },
    {
      id: "guqin",
      title: "古琴",
      subtitle: "弦上清音",
      motif: "lotus",
      initialQuery: "介绍古琴名曲《广陵散》的源流与意境",
      taskTemplate: "guqin",
    },
    {
      id: "wendao",
      title: "问道",
      subtitle: "格物致知",
      motif: "pine",
      initialQuery: "帮我策划一场宋代文人雅集，含场地、菜单、节目、请帖",
      taskTemplate: "wendao",
    },
  ],
  // —— 明朝 · 青花瓷韵 · 富丽端庄 ——
  ming: [
    {
      id: "shici",
      title: "诗词",
      subtitle: "吴中风流",
      motif: "plum",
      initialQuery: "拟唐寅诗风，作七律一首，题作「金陵秋眺」",
      taskTemplate: "shici",
    },
    {
      id: "shuhua",
      title: "书画",
      subtitle: "明四家笔",
      motif: "orchid",
      initialQuery: "解读沈周《庐山高图》的章法与皴法",
      taskTemplate: "shuhua",
    },
    {
      id: "chadao",
      title: "茶道",
      subtitle: "瀹泡清趣",
      motif: "bamboo",
      initialQuery: "详述朱权《茶谱》瀹泡散茶之法",
      taskTemplate: "chadao",
    },
    {
      id: "jieqi",
      title: "节气",
      subtitle: "白露为霜",
      motif: "chrysanthemum",
      initialQuery: "白露时节，江南园林有何赏桂雅事",
      taskTemplate: "jieqi",
    },
    {
      id: "guqin",
      title: "古琴",
      subtitle: "平沙落雁",
      motif: "lotus",
      initialQuery: "介绍琴曲《平沙落雁》的源流与意境",
      taskTemplate: "guqin",
    },
    {
      id: "wendao",
      title: "问道",
      subtitle: "园林文会",
      motif: "pine",
      initialQuery: "帮我策划一场明代园林文会，含亭阁、清供、诗画、昆曲",
      taskTemplate: "wendao",
    },
  ],
  // —— 秦朝 · 玄墨竹简 · 肃穆古拙 ——
  qin: [
    {
      id: "shici",
      title: "诗辞",
      subtitle: "四言古风",
      motif: "plum",
      initialQuery: "拟《诗经》四言体，作「秦风」一首，咏关中苍茫",
      taskTemplate: "shici",
    },
    {
      id: "shuhua",
      title: "金石",
      subtitle: "斯篆刻石",
      motif: "orchid",
      initialQuery: "解读李斯《泰山刻石》小篆的笔法与体势",
      taskTemplate: "shuhua",
    },
    {
      id: "chadao",
      title: "羹饮",
      subtitle: "煮茶古法",
      motif: "bamboo",
      initialQuery: "考述先秦煮茶为羹的器具与古法",
      taskTemplate: "chadao",
    },
    {
      id: "jieqi",
      title: "节气",
      subtitle: "冬至岁首",
      motif: "chrysanthemum",
      initialQuery: "秦以十月为岁首，冬至祭天有何典制",
      taskTemplate: "jieqi",
    },
    {
      id: "guqin",
      title: "古琴",
      subtitle: "高山流水",
      motif: "lotus",
      initialQuery: "述伯牙子期《高山流水》之琴事",
      taskTemplate: "guqin",
    },
    {
      id: "wendao",
      title: "问道",
      subtitle: "百工法度",
      motif: "pine",
      initialQuery: "帮我考述秦代百工法度与器物制度",
      taskTemplate: "wendao",
    },
  ],
  // —— 唐朝 · 金碧辉煌 · 大唐气象 ——
  tang: [
    {
      id: "shici",
      title: "诗词",
      subtitle: "盛唐律声",
      motif: "plum",
      initialQuery: "拟杜甫诗风，作七律一首，题作「长安春望」",
      taskTemplate: "shici",
    },
    {
      id: "shuhua",
      title: "书画",
      subtitle: "丹青神品",
      motif: "orchid",
      initialQuery: "解读阎立本《步辇图》的构图与人物",
      taskTemplate: "shuhua",
    },
    {
      id: "chadao",
      title: "茶道",
      subtitle: "茶经煎法",
      motif: "bamboo",
      initialQuery: "详述陆羽《茶经》煎茶法的器具与工序",
      taskTemplate: "chadao",
    },
    {
      id: "jieqi",
      title: "节气",
      subtitle: "谷雨新茶",
      motif: "chrysanthemum",
      initialQuery: "谷雨时节，唐人如何煎新茶、赏春光",
      taskTemplate: "jieqi",
    },
    {
      id: "guqin",
      title: "古琴",
      subtitle: "阳关三叠",
      motif: "lotus",
      initialQuery: "介绍琴曲《阳关三叠》的源流与意境",
      taskTemplate: "guqin",
    },
    {
      id: "wendao",
      title: "问道",
      subtitle: "曲江流饮",
      motif: "pine",
      initialQuery: "帮我策划一场唐代曲江流饮雅集，含宴饮、赋诗、乐舞、马球",
      taskTemplate: "wendao",
    },
  ],
};

// 取当前朝代的六事雅赏
export function getFeatures(dynasty: Dynasty): Feature[] {
  return dynastyFeatures[dynasty] ?? dynastyFeatures.song;
}

// 兼容旧引用 · 默认返回宋朝六事（静态导入处可用）
export const features: Feature[] = dynastyFeatures.song;

// 按朝代 + id 取单一雅事
export function getFeatureById(dynasty: Dynasty, id: string): Feature | undefined {
  return getFeatures(dynasty).find((f) => f.id === id);
}

// 任务规划模板 — 行军图节点序列（六事通用流程，各朝代适用）
export const taskTemplates: Record<string, TaskPlan> = {
  shici: {
    id: "tpl-shici",
    query: "拟诗",
    nodes: [
      { id: "n1", title: "审题", description: "辨明题意与体例", status: "pending", icon: "pavilion" },
      { id: "n2", title: "选韵", description: "依平水韵定韵脚", status: "pending", icon: "bridge" },
      { id: "n3", title: "起句", description: "首联铺陈景物", status: "pending", icon: "boat" },
      { id: "n4", title: "承转", description: "颔联转出意境", status: "pending", icon: "tower" },
      { id: "n5", title: "结句", description: "尾联收束余韵", status: "pending", icon: "moon" },
    ],
  },
  shuhua: {
    id: "tpl-shuhua",
    query: "解读书画",
    nodes: [
      { id: "n1", title: "考源", description: "查作者与年代", status: "pending", icon: "pavilion" },
      { id: "n2", title: "观构", description: "析章法布局", status: "pending", icon: "bridge" },
      { id: "n3", title: "辨笔", description: "识皴擦点染", status: "pending", icon: "tower" },
      { id: "n4", title: "释义", description: "解画中意境", status: "pending", icon: "moon" },
    ],
  },
  chadao: {
    id: "tpl-chadao",
    query: "述茶法",
    nodes: [
      { id: "n1", title: "备器", description: "罗列茶具", status: "pending", icon: "pavilion" },
      { id: "n2", title: "炙茶", description: "炙碾茶末", status: "pending", icon: "bridge" },
      { id: "n3", title: "烹点", description: "注水击拂", status: "pending", icon: "boat" },
      { id: "n4", title: "品鉴", description: "观色闻香", status: "pending", icon: "moon" },
    ],
  },
  jieqi: {
    id: "tpl-jieqi",
    query: "节气指南",
    nodes: [
      { id: "n1", title: "溯源", description: "查节气由来", status: "pending", icon: "pavilion" },
      { id: "n2", title: "物候", description: "列三候变化", status: "pending", icon: "tree" },
      { id: "n3", title: "养生", description: "调饮食起居", status: "pending", icon: "bridge" },
      { id: "n4", title: "赏景", description: "荐应季风物", status: "pending", icon: "moon" },
    ],
  },
  guqin: {
    id: "tpl-guqin",
    query: "考琴曲",
    nodes: [
      { id: "n1", title: "溯源", description: "稽曲谱出处", status: "pending", icon: "pavilion" },
      { id: "n2", title: "析律", description: "辨宫调指法", status: "pending", icon: "bridge" },
      { id: "n3", title: "释义", description: "解曲中典故", status: "pending", icon: "tower" },
      { id: "n4", title: "入境", description: "描摩意境", status: "pending", icon: "moon" },
    ],
  },
  wendao: {
    id: "tpl-wendao",
    query: "策划雅集",
    nodes: [
      { id: "n1", title: "选地", description: "择雅集之所", status: "pending", icon: "pavilion" },
      { id: "n2", title: "拟馔", description: "列时令清供", status: "pending", icon: "tree" },
      { id: "n3", title: "排程", description: "诗酒琴茶画", status: "pending", icon: "boat" },
      { id: "n4", title: "撰帖", description: "拟雅集尺素", status: "pending", icon: "tower" },
      { id: "n5", title: "成案", description: "汇总成文", status: "pending", icon: "moon" },
    ],
  },
};

export function getTaskTemplate(id: string): TaskPlan {
  return (
    taskTemplates[id] ?? {
      id: "tpl-default",
      query: "通用任务",
      nodes: [
        { id: "n1", title: "审意", description: "理解所求", status: "pending", icon: "pavilion" },
        { id: "n2", title: "查考", description: "检索典故", status: "pending", icon: "bridge" },
        { id: "n3", title: "成文", description: "拟就答覆", status: "pending", icon: "moon" },
      ],
    }
  );
}

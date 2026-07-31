import type { Message, MemoryEntry, ToolInvoke } from "@/types";

// 模拟 Agent 回复 — 按话题关键词返回不同信笺内容
interface ReplyPack {
  content: string;
  citations?: Message["citations"];
  toolInvokes?: ToolInvoke[];
}

const inkTool: ToolInvoke = { type: "ink", label: "研墨", detail: "调度语言模型" };
const paperTool: ToolInvoke = { type: "paper", label: "铺纸", detail: "展开写作上下文" };
const bookTool: ToolInvoke = { type: "book", label: "翻书", detail: "检索典籍文献" };

// 关键词 → 回复包 映射
const replyMap: Array<{ keys: string[]; pack: ReplyPack }> = [
  {
    keys: ["绝句", "诗", "韵", "秋山", "夜雨"],
    pack: {
      content:
        "秋山夜雨\n\n空山新雨后，落叶满苍苔。\n半卷寒窗月，一灯残砚灰。\n客来无俗语，茶罢有余杯。\n坐听松涛急，明朝径自开。\n\n此诗以「灰」韵为骨，首联写雨后山景，颔联转入夜境，颈联写客来茶罢之清趣，尾联以松涛收束，留余韵于言外。",
      citations: [
        { source: "《王右丞集》", snippet: "空山新雨后，天气晚来秋。" },
        { source: "《诗人玉屑》", snippet: "绝句贵婉曲，结句宜有余韵。" },
      ],
      toolInvokes: [inkTool, bookTool, paperTool],
    },
  },
  {
    keys: ["范宽", "溪山行旅", "画", "笔法", "构图"],
    pack: {
      content:
        "《溪山行旅图》赏析\n\n范中立此帧，巨碑式主峰居中而立，顶天立地，气势雄浑。山石用雨点皴密凿，如阵雨倾盆，是为「巨碑山水」典范。\n\n构图取「高远」之法：前景溪流杂树，中景行旅驮队一线蜿蜒，远景主峰巍峨压顶，三层叠递，引人入胜。\n\n笔法以中锋勾勒、侧锋皴擦，墨色层层积染，山体浑厚而不滞。范宽自题「臣范宽」于右下树丛间，至北宋已为画史神品。",
      citations: [
        { source: "《图画见闻志》", snippet: "范宽，字中立，华原人。工画山水。" },
        { source: "《溪山行旅图》", snippet: "臣范宽 — 隐款于右下杂树间。" },
      ],
      toolInvokes: [bookTool, inkTool, paperTool],
    },
  },
  {
    keys: ["点茶", "茶", "宋", "器具"],
    pack: {
      content:
        "宋代点茶法\n\n其一备器：茶焙、茶笼、汤瓶、茶盏、茶筅、茶勺、茶罗，缺一不可。\n\n其二炙茶：以炭火微烤茶饼，去其潮气，再以净纸裹捣碎，入茶碾细碾，过罗得极细茶末。\n\n其三点汤：盏先温热，置茶末一钱匕于盏心，注汤少许调膏，再注汤七分，以茶筅击拂，运筅须疾，愈疾愈佳，至乳花咬盏不散为度。\n\n其四品鉴：观色以纯白为上，闻香以清远为佳，啜味以鲜爽回甘为韵。",
      citations: [
        { source: "《茶录》蔡襄", snippet: "茶盏，要温热；汤瓶，嘴宜小。" },
        { source: "《大观茶论》", snippet: "运筅轻重适时，乳面勃然。" },
      ],
      toolInvokes: [bookTool, paperTool, inkTool],
    },
  },
  {
    keys: ["霜降", "节气", "养生", "赏景"],
    pack: {
      content:
        "霜降三候\n\n初候豺祭兽，二候草木黄落，三候蛰虫咸俯。\n\n养生之道：霜降乃秋末转冬之候，肺气当令，宜食白物以润燥，如梨、百合、银耳、山药。早卧早起，避清晨寒露。情志宜宁静，勿大喜大悲，以应秋收之气。\n\n赏景之处：北方层林尽染，红叶满山，香山、栖霞皆宜登临；江南桂花将尽，菊始盛开，可往园圃赏菊，或烹一壶桂花乌龙，倚窗听秋雨。",
      citations: [
        { source: "《月令七十二候集解》", snippet: "气肃而凝，露结为霜矣。" },
        { source: "《黄帝内经·素问》", snippet: "秋三月，此谓容平，早卧早起。" },
      ],
      toolInvokes: [bookTool, paperTool],
    },
  },
  {
    keys: ["广陵散", "古琴", "琴曲"],
    pack: {
      content:
        "《广陵散》源流\n\n此曲本名《广陵止息》，源自汉魏，嵇康临刑抚之，叹「广陵散于今绝矣」，遂成名曲绝唱。\n\n曲为「慢商调」，开指慢商，主调以宫商两弦同声取势，气势苍凉激越，与寻常琴曲清微淡远者迥异。全曲四十五段，含「刺韩」「冲冠」「发怒」「投剑」等小题，叙聂政刺韩王事。\n\n听其音，初如幽泉咽石，渐如风雷激荡，终如长剑出匣，寒光逼人。意境悲壮，非胸有块垒者不能解。",
      citations: [
        { source: "《晋书·嵇康传》", snippet: "康顾视日影，索琴弹之，曰：「广陵散于今绝矣！」" },
        { source: "《神奇秘谱》", snippet: "广陵散，慢商调，四十五段。" },
      ],
      toolInvokes: [bookTool, inkTool, paperTool],
    },
  },
  {
    keys: ["雅集", "宋代", "策划", "请帖", "菜单"],
    pack: {
      content:
        "宋代文人雅集方案\n\n【场地】择西湖南山烟霞岭下，临水竹庐三楹，前置曲水流觞之渠，后倚苍松翠竹，远借雷峰塔影。\n\n【清供】\n　· 时鲜：莼菜银鱼羹、蟹酿橙、笋蕨馄饨\n　· 果馔：石榴、银杏、新栗、桂花糖藕\n　· 茶酒：龙井新茗一釜、桂花酒一坛\n\n【节目】\n　一、涤器煮茶，众宾默坐观汤花\n　二、分韵赋诗，以「秋山」为题，限七律\n　三、抚琴一曲，《平沙落雁》或《潇湘水云》\n　四、挥毫合作一幅《雅集图》，各题款于上\n　五、曲水流觞，依次赋诗不成者罚三爵\n\n【请帖】\n「孟秋既望，西湖南山烟霞岭下，聚骚人墨客，煮茗抚琴，分韵赋诗。愿足下拨冗惠然，共襄雅事。— 鄙人某顿首」",
      citations: [
        { source: "《武林旧事》", snippet: "湖山胜概，多在南山。" },
        { source: "《东京梦华录》", snippet: "雅集以诗酒琴茶画为五雅。" },
      ],
      toolInvokes: [bookTool, paperTool, inkTool, bookTool],
    },
  },
];

const fallbackPack: ReplyPack = {
  content:
    "容我一思\n\n承蒙垂询，所问之事典籍多有载述。容我考其源流、辨其体例，再以信笺奉复。若有未尽之意，请详述所求，再行研拟。",
  toolInvokes: [bookTool, inkTool],
};

export function pickReply(query: string): ReplyPack {
  const hit = replyMap.find((r) => r.keys.some((k) => query.includes(k)));
  return hit ? hit.pack : fallbackPack;
}

// 模拟手札记忆条目 — 用户可查看 Agent 记住的上下文
export const mockMemory: MemoryEntry[] = [
  { id: "m1", label: "偏好", content: "喜宋词，尤爱苏辛豪放一路", ts: Date.now() - 86400000 },
  { id: "m2", label: "时令", content: "今日霜降，江南秋深", ts: Date.now() - 3600000 },
  { id: "m3", label: "惯例", content: "回复以信笺格式，附朱印引用", ts: Date.now() - 7200000 },
];

// 预设欢迎语 · 按朝代品牌名生成
export function createWelcomeMessage(brand: string, signoff: string): Message {
  return {
    id: "welcome",
    role: "agent",
    content:
      `${brand}问安\n\n${brand}在此，承蒙造访。妾可代拟诗词、解读书画、详述茶道、应节气、考琴曲、策划雅集。\n\n请于卷轴之上落笔所求，妾自当研墨铺纸，详加考复。若欲速览，可点下方多宝阁中诸般雅事。`,
    timestamp: Date.now(),
  };
}

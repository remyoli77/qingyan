// 六大主题种子知识 · 首次加载时灌入 IndexedDB
import { type KBEntry, type KBTopic } from "@/lib/knowledgeBase";

type Seed = Omit<KBEntry, "id" | "hits" | "createdAt" | "updatedAt">;

export const seedKnowledge: Seed[] = [
  // —— 诗词 shici ——
  { topic: "shici" as KBTopic, question: "七言绝句格律", answer: "七言绝句四句，每句七字。平仄相间，二四六字为节律关键。首句可押韵可不押，二四句必押韵，第三句不押韵。常用平起入韵式：平平仄仄仄平平（韵），仄仄平平仄仄平（韵）。", source: "seed", quality: 0.95, tags: ["格律", "绝句", "平仄"] },
  { topic: "shici" as KBTopic, question: "平水韵部", answer: "宋金时编《平水韵》分一〇六韵，平声三十韵最常用。东冬江支微为前几韵。作近体诗须依平水韵定韵脚，不可串韵。", source: "seed", quality: 0.9, tags: ["韵书", "平水韵"] },
  { topic: "shici" as KBTopic, question: "对仗工稳", answer: "律诗颔联颈联须对仗。要求词性相同、结构相应、平仄相对。如「两个黄鹂鸣翠柳，一行白鹭上青天」数量对数量、鸟对鸟、色对色。", source: "seed", quality: 0.88, tags: ["对仗", "律诗"] },
  { topic: "shici" as KBTopic, question: "词牌词调", answer: "词有词牌，定字数句式平仄。常见如《如梦令》三十三字、《浣溪沙》四十二字、《水调歌头》九十五字。填词须依词谱，不可擅自增减。", source: "seed", quality: 0.85, tags: ["词", "词牌"] },
  { topic: "shici" as KBTopic, question: "起承转合", answer: "绝句四句结构：起句点题布景，承句承接铺陈，转句转出新意或宕开，合句收束点睛留余韵。王昌龄《出塞》「秦时明月」为起句典范。", source: "seed", quality: 0.9, tags: ["章法", "结构"] },
  { topic: "shici" as KBTopic, question: "用典贴切", answer: "用典须切题、须化用、忌生僻堆砌。李商隐《锦瑟》连用庄周梦蝶、望帝啼鹃、沧海珠泪、蓝田玉烟四典，浑然无迹。", source: "seed", quality: 0.82, tags: ["用典"] },
  { topic: "shici" as KBTopic, question: "意境营造", answer: "诗重意境，情景交融。王维「大漠孤烟直，长河落日圆」以简笔写壮景，画面感与孤寂情俱出。", source: "seed", quality: 0.87, tags: ["意境"] },
  { topic: "shici" as KBTopic, question: "古体与近体之别", answer: "近体诗指唐代形成的格律诗，讲究平仄对仗押韵；古体诗不拘格律，可换韵，如李白《蜀道难》。", source: "seed", quality: 0.83, tags: ["诗体"] },
  { topic: "shici" as KBTopic, question: "押韵规则", answer: "近体诗一韵到底，不可换韵。偶句押韵，首句可押可不押。韵脚须同韵部，古音与今音有别，作旧体诗须查平水韵。", source: "seed", quality: 0.86, tags: ["押韵"] },
  { topic: "shici" as KBTopic, question: "炼字推敲", answer: "「推敲」典出贾岛。诗眼一字关乎全句精神，如「春风又绿江南岸」之「绿」字由「到」「过」改定，化静为动。", source: "seed", quality: 0.84, tags: ["炼字"] },
  { topic: "shici" as KBTopic, question: "五言绝句格律", answer: "五言绝句四句二十字，字少意长。平起式：平平平仄仄，仄仄仄平平。如王维《鹿柴》「空山不见人，但闻人语响」。", source: "seed", quality: 0.88, tags: ["格律", "绝句"] },

  // —— 书画 shuhua ——
  { topic: "shuhua" as KBTopic, question: "皴法种类", answer: "皴法表现山石纹理。披麻皴董源所创，宜江南土山；斧劈皴李唐马夏善用，宜北方石山；雨点皴范宽《溪山行旅图》典型；折带皴倪瓒写平坡。", source: "seed", quality: 0.92, tags: ["皴法", "技法"] },
  { topic: "shuhua" as KBTopic, question: "范宽溪山行旅图", answer: "北宋范宽作，绢本水墨，206cm高巨碑式构图。主峰居中占画面三分之二，雨点皴密布，瀑布一线垂悬。近景巨石行人驴队，比例衬山势巍峨。画幅右下有「范宽」款。台北故宫藏。", source: "seed", quality: 0.95, tags: ["范宽", "宋画", "溪山行旅图"] },
  { topic: "shuhua" as KBTopic, question: "青绿山水设色", answer: "青绿山水以石青石绿为主色，李思训父子开创，王希孟《千里江山图》为巅峰。先勾墨线，再敷赭石打底，后罩石青石绿，层层积染，金碧辉映。", source: "seed", quality: 0.9, tags: ["青绿", "设色"] },
  { topic: "shuhua" as KBTopic, question: "谢赫六法", answer: "南齐谢赫《古画品录》提出六法：气韵生动、骨法用笔、应物象形、随类赋彩、经营位置、传移模写。气韵生动居首，为中国画最高准则。", source: "seed", quality: 0.93, tags: ["六法", "理论"] },
  { topic: "shuhua" as KBTopic, question: "散点透视", answer: "中国画不用焦点透视，而用散点透视，可移动观照。长卷如《清明上河图》从城外画到城内，高远深远平远三远法并用，郭熙《林泉高致》论之。", source: "seed", quality: 0.88, tags: ["透视", "构图"] },
  { topic: "shuhua" as KBTopic, question: "墨分五色", answer: "墨色分焦浓重淡清五色，张彦远云「运墨而五色具」。焦墨最浓无水，浓墨次之，重墨为常，淡墨有水晕，清墨几近于水。墨色变化即色彩变化。", source: "seed", quality: 0.87, tags: ["用墨"] },
  { topic: "shuhua" as KBTopic, question: "宋画十八描", answer: "人物画衣纹描法，分高古游丝描、铁线描、兰叶描、行云流水描等十八种。顾恺之游丝描细密匀整，吴道子兰叶描顿挫飞扬。", source: "seed", quality: 0.8, tags: ["描法", "人物"] },
  { topic: "shuhua" as KBTopic, question: "题款钤印", answer: "宋元后画上题诗落款盖印成规。题款位置关乎构图，或长题或穷款。钤印有姓名印、闲印、引首印，朱白相间，画印书三者合一。", source: "seed", quality: 0.82, tags: ["题款", "钤印"] },
  { topic: "shuhua" as KBTopic, question: "董源潇湘图", answer: "五代董源作，江南山水代表。披麻皴画土山，点子皴写远树，水墨淡设色。气象温润，开南宗山水一脉，董其昌推崇为南宗之祖。", source: "seed", quality: 0.86, tags: ["董源", "南宗"] },
  { topic: "shuhua" as KBTopic, question: "写意与工笔", answer: "工笔勾勒精细设色层层，如宋院体花鸟；写意笔墨简练抒写胸臆，徐渭大写意水墨淋漓。兼工带写者如陈洪绶。", source: "seed", quality: 0.83, tags: ["画法"] },

  // —— 茶道 chadao ——
  { topic: "chadao" as KBTopic, question: "宋代点茶法", answer: "宋人点茶：先炙茶碾茶罗茶得末，置末于盏，注汤调膏，再注汤七次，以茶筅击拂生沫。汤花咬盏久者为胜。详见蔡襄《茶录》、徽宗《大观茶论》。", source: "seed", quality: 0.95, tags: ["点茶", "宋茶"] },
  { topic: "chadao" as KBTopic, question: "点茶器具", answer: "宋点茶十二先生：茶炉、茶碾、茶罗、茶盏（建窑兔毫盏为上）、茶筅、汤瓶、茶巾等。徽宗赐名韦鸿胪、木待制、金法曹、罗枢密等雅号。", source: "seed", quality: 0.9, tags: ["茶具", "建盏"] },
  { topic: "chadao" as KBTopic, question: "建窑兔毫盏", answer: "福建建阳建窑所产黑釉茶盏，釉面有兔毫状结晶纹，宋代点茶斗茶首选。徽宗云「盏色贵青黑，玉毫条达者为上」。日本国宝曜变天目即建盏。", source: "seed", quality: 0.88, tags: ["建盏", "茶具"] },
  { topic: "chadao" as KBTopic, question: "斗茶之戏", answer: "宋人斗茶比汤花咬盏之久暂与色之白。以纯白为上，青白次之。先现水痕者为负。范仲淹《斗茶歌》「胜若登仙不可攀，输同降将无穷耻」。", source: "seed", quality: 0.86, tags: ["斗茶"] },
  { topic: "chadao" as KBTopic, question: "唐煎茶法", answer: "唐人煎茶：煮水三沸，一沸如鱼目调盐，二沸如涌泉舀出一瓢旋膏，三沸如腾波投茶末。陆羽《茶经》述之，与宋点茶、明泡茶并称三变。", source: "seed", quality: 0.87, tags: ["煎茶", "唐茶"] },
  { topic: "chadao" as KBTopic, question: "明泡茶法", answer: "明洪武废团茶兴散茶，瀹泡法兴。置茶于壶或盏，注沸水即饮，简便流行至今。紫砂壶因之盛，供春时大彬制壶名家辈出。", source: "seed", quality: 0.84, tags: ["泡茶", "明代"] },
  { topic: "chadao" as KBTopic, question: "紫砂壶艺", answer: "宜兴紫砂壶透气性佳宜发茶香。供春、时大彬、陈鸣远、顾景舟为名家。泥分紫泥、朱泥、段泥。制壶讲究造型、泥料、火候、功夫四要。", source: "seed", quality: 0.82, tags: ["紫砂", "茶具"] },
  { topic: "chadao" as KBTopic, question: "茶之九难", answer: "陆羽《茶经》论茶有九难：曰造、曰别、曰器、曰火、曰水、曰末、曰煮、曰饮。水为茶之母，山水上江水中井水下。", source: "seed", quality: 0.85, tags: ["茶经", "陆羽"] },
  { topic: "chadao" as KBTopic, question: "茶人四境", answer: "茶事四境：物境（器水茶）、艺境（冲泡技法）、人境（同饮者）、心境（精神体悟）。由物入心，茶道即以此为阶。", source: "seed", quality: 0.8, tags: ["茶道"] },
  { topic: "chadao" as KBTopic, question: "六大茶类", answer: "中国茶按发酵分六类：绿（不发酵）、白（微发酵）、黄（轻发酵）、青/乌龙（半发酵）、红（全发酵）、黑（后发酵如普洱）。制法不同风味各异。", source: "seed", quality: 0.86, tags: ["茶类"] },

  // —— 节气 jieqi ——
  { topic: "jieqi" as KBTopic, question: "二十四节气序", answer: "立春雨水惊蛰春分清明谷雨，立夏小满芒种夏至小暑大暑，立秋处暑白露秋分寒露霜降，立冬小雪大雪冬至小寒大寒。每月两节，节气中气相间。", source: "seed", quality: 0.95, tags: ["节气"] },
  { topic: "jieqi" as KBTopic, question: "霜降物候", answer: "霜降三候：豺祭兽、草木黄落、蛰虫咸俯。霜降为秋之末节，气温骤降初霜现。农事收毕入库，万物收藏。", source: "seed", quality: 0.9, tags: ["霜降", "物候"] },
  { topic: "jieqi" as KBTopic, question: "霜降养生", answer: "霜降养生重在「秋冻有度，渐添衣被」。宜食温润之物如山药、栗子、柿子。忌寒凉生冷。早卧早起，与鸡俱兴。", source: "seed", quality: 0.87, tags: ["霜降", "养生"] },
  { topic: "jieqi" as KBTopic, question: "七十二候", answer: "每节气分三候，五日一候，全年七十二候。每候配一物候现象如「桃始华」「仓庚鸣」「鸿雁来」。源于《逸周书》，为农耕时令指南。", source: "seed", quality: 0.85, tags: ["物候"] },
  { topic: "jieqi" as KBTopic, question: "冬至阴阳", answer: "冬至一阳生，阴极阳回。日影最长，昼最短。古人视冬至为大节，有「冬至大如年」之说。数九寒天自此始，九九八十一天后春深。", source: "seed", quality: 0.88, tags: ["冬至", "阴阳"] },
  { topic: "jieqi" as KBTopic, question: "夏至养生", answer: "夏至阳极阴生。养生宜「夜卧早起，无厌于日」。饮食清淡，忌肥甘厚味。可食绿豆、莲子、苦瓜清暑。心静自然凉。", source: "seed", quality: 0.83, tags: ["夏至", "养生"] },
  { topic: "jieqi" as KBTopic, question: "清明习俗", answer: "清明踏青扫墓祭祖。源寒食禁火与上巳祓禊合流。折柳戴柳、放风筝、荡秋千。扫墓培土除草献花，慎终追远。", source: "seed", quality: 0.86, tags: ["清明", "习俗"] },
  { topic: "jieqi" as KBTopic, question: "立春咬春", answer: "立春咬春，食春饼、萝卜、五辛盘，迎春接福。鞭春牛劝农耕，糊春牛内盛五谷象征丰收。", source: "seed", quality: 0.82, tags: ["立春", "习俗"] },
  { topic: "jieqi" as KBTopic, question: "节气与农事", answer: "节气为农时指南。惊蛰春耕始，谷雨种大田，芒种忙收忙种，秋分秋收忙。四时八节定农事节奏，违时则歉收。", source: "seed", quality: 0.84, tags: ["农事"] },
  { topic: "jieqi" as KBTopic, question: "数九歌", answer: "一九二九不出手，三九四九冰上走，五九六九沿河看柳，七九河开八九雁来，九九加一九耕牛遍地走。冬至起数九，描冬去春来。", source: "seed", quality: 0.87, tags: ["数九", "民谣"] },

  // —— 古琴 guqin ——
  { topic: "guqin" as KBTopic, question: "广陵散源流", answer: "《广陵散》又名《广陵止息》，魏晋已有。嵇康临刑叹「广陵散于今绝矣」，然曲谱存于明朱权《神奇秘谱》。曲写聂政刺韩王事，慷慨激越，为琴中异响。", source: "seed", quality: 0.93, tags: ["广陵散", "嵇康"] },
  { topic: "guqin" as KBTopic, question: "减字谱", answer: "唐曹柔创减字谱，以汉字减笔符号记指法。左手按弦吟猱绰注，右手勾剔抹挑打摘。不记节奏，赖口传心授。明《神奇秘谱》为现存最早琴谱集。", source: "seed", quality: 0.9, tags: ["减字谱", "记谱"] },
  { topic: "guqin" as KBTopic, question: "古琴形制", answer: "琴长三尺六寸五分喻周天三百六十五度。桐木为面梓木为底，七弦十三徽。伏羲式、仲尼式、连珠式、落霞式等形制各异。岳山承露龙池凤沼各有其位。", source: "seed", quality: 0.88, tags: ["形制"] },
  { topic: "guqin" as KBTopic, question: "高山流水", answer: "伯牙鼓琴志在高山流水，钟子期皆能解。子期死，伯牙破琴绝弦终身不复鼓。高山流水成知音之喻。曲分《高山》《流水》二首，管平湖奏《流水》载入旅行者金唱片。", source: "seed", quality: 0.9, tags: ["高山流水", "知音"] },
  { topic: "guqin" as KBTopic, question: "琴曲十三大套", answer: "琴曲以《潇湘水云》《平沙落雁》《梅花三弄》《阳关三叠》《醉渔唱晚》《渔樵问答》《忆故人》《流水》《广陵散》《胡笳十八拍》《酒狂》《秋塞吟》《捣衣》等为经典大套。", source: "seed", quality: 0.85, tags: ["琴曲"] },
  { topic: "guqin" as KBTopic, question: "潇湘水云", answer: "南宋郭沔作。郭楚望泛舟潇湘，见云水遮蔽九嶷山，感时局飘零而作。云水吞吐之声用大揉大吟写就，为琴曲中写意典范。浙派代表。", source: "seed", quality: 0.87, tags: ["潇湘水云", "郭沔"] },
  { topic: "guqin" as KBTopic, question: "琴派流变", answer: "琴派因地域师承而异。浙派郭沔徐天民，虞山派严天池严澂主清微淡远，广陵派徐常遇跌宕多变，岭南派古健，川派激越，九嶷派杨时百。", source: "seed", quality: 0.83, tags: ["琴派"] },
  { topic: "guqin" as KBTopic, question: "琴德琴禁", answer: "琴者禁也，所以禁邪正心。琴有十四宜弹之境：遇知音、逢可人、对道士、处高堂、升楼阁、在宫观、坐石上、登山、憩泉、玩水、居舟中、息林下、值二气清明、对雪。", source: "seed", quality: 0.82, tags: ["琴德"] },
  { topic: "guqin" as KBTopic, question: "梅花三弄", answer: "原为晋桓伊笛曲，后改编为琴曲。三段同一主题在不同徽位重复三次，喻梅花三度绽放。曲调清越，写梅傲雪凌霜之节。", source: "seed", quality: 0.85, tags: ["梅花三弄"] },
  { topic: "guqin" as KBTopic, question: "阳关三叠", answer: "据王维《送元二使安西》谱。三叠即全诗叠唱三次，每叠后加衬词。送别曲之冠，情深而不伤，雅而不俗。", source: "seed", quality: 0.84, tags: ["阳关三叠"] },

  // —— 问道 wendao ——
  { topic: "wendao" as KBTopic, question: "雅集规制", answer: "宋人雅集重清雅不重奢华。兰亭修禊流觞曲水为典范。雅集四要素：佳客（志同道合）、胜地（水竹之胜）、清供（茶酒琴书）、雅事（诗酒琴茶画）。", source: "seed", quality: 0.9, tags: ["雅集"] },
  { topic: "wendao" as KBTopic, question: "西园雅集", answer: "北宋驸马王诜西园雅集，苏东坡、黄庭坚、米芾、李公麟等十六人参与。李公麟绘《西园雅集图》记之，米芾作记。与兰亭修禊并称两大雅集。", source: "seed", quality: 0.88, tags: ["西园雅集", "宋代"] },
  { topic: "wendao" as KBTopic, question: "兰亭修禊", answer: "东晋永和九年王羲之等四十二人兰亭修禊，曲水流觞赋诗。羲之作《兰亭序》三百二十四字，二十个「之」字各异其态，为天下第一行书。", source: "seed", quality: 0.92, tags: ["兰亭", "王羲之"] },
  { topic: "wendao" as KBTopic, question: "宋代文人四艺", answer: "宋人四艺：焚香、点茶、挂画、插花。香为鼻观，茶为舌味，画为眼福，花为生机。四事皆备方称雅致生活。", source: "seed", quality: 0.87, tags: ["四艺", "生活美学"] },
  { topic: "wendao" as KBTopic, question: "雅集请帖", answer: "雅集请帖称「请简」「尺素」。用洒金笺，行楷书写，载时间地点雅事。措辞谦雅如「某月某日薄具清酌，敬邀文旌」。", source: "seed", quality: 0.83, tags: ["请帖", "尺牍"] },
  { topic: "wendao" as KBTopic, question: "茶席陈设", answer: "茶席讲究一席四事：主器（壶盏）、辅器（煮水）、茶食（茶点清供）、装饰（插花挂画）。席地而设，简而不陋，雅而不奢。", source: "seed", quality: 0.82, tags: ["茶席"] },
  { topic: "wendao" as KBTopic, question: "文人雅趣", answer: "文人雅趣：抚琴弈棋、写字作画、赋诗填词、品茗焚香、赏石玩砚、莳花养鸟、藏书校勘。重在自娱与修身，非为炫耀。", source: "seed", quality: 0.84, tags: ["雅趣"] },
  { topic: "wendao" as KBTopic, question: "宋人食单", answer: "宋人尚清供。林洪《山家清供》载梅粥、雪霞羹、拨霞供等雅馔。取时令山野之材，制法清雅，命名诗意。饮食亦文人化。", source: "seed", quality: 0.85, tags: ["饮食", "山家清供"] },
  { topic: "wendao" as KBTopic, question: "焚香之法", answer: "焚香隔火熏蒸为雅。置香灰于炉，埋炭饼，隔云母片或银叶置香材，使香不燃而气徐出。沉檀龙麝为四大香，文人偏爱沉香。", source: "seed", quality: 0.83, tags: ["焚香", "香道"] },
  { topic: "wendao" as KBTopic, question: "插花之道", answer: "宋人插花讲三才：天（主枝高）、地（副枝低）、人（中间枝）。花不在多，一二枝疏朗见意。瓶花为日常，篮花为雅集。袁宏道《瓶史》论之。", source: "seed", quality: 0.82, tags: ["插花"] },
];

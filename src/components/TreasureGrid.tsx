// 多宝阁功能宫格 — 移动端 2 列起步 · lg 起 3 列 · 按当前朝代展示六事雅赏
import { getFeatures } from "@/data/features";
import { useDynastyMeta } from "@/store/themeStore";
import FeatureCard from "./FeatureCard";

export default function TreasureGrid() {
  const meta = useDynastyMeta();
  const features = getFeatures(meta.id);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
      {features.map((f, i) => (
        <FeatureCard key={f.id} feature={f} index={i} />
      ))}
    </div>
  );
}

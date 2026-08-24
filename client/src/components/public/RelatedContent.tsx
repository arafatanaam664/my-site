import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { findEditorialItem, findToolById, type ToolId } from "@/content/catalog";

export function RelatedContent({ toolIds = [], editorialSlug }: { toolIds?: ToolId[]; editorialSlug?: string }) {
  const editorial = editorialSlug ? findEditorialItem(editorialSlug) : undefined;
  const listedTools = toolIds.map(findToolById).filter(Boolean);
  if (!editorial && listedTools.length === 0) return null;
  return (
    <aside className="related-content" aria-label="محتوى ذو صلة">
      <div className="section-kicker">استكمل ما بدأت</div>
      <h2>قد يفيدك أيضًا</h2>
      <div className="related-list">
        {editorial && <Link href={`/${editorial.type === "guide" ? "guides" : "articles"}/${editorial.slug}`} className="related-link"><span>{editorial.type === "guide" ? "دليل مرتبط" : "مقال مرتبط"}</span><strong>{editorial.title}</strong><ArrowLeft size={17} /></Link>}
        {listedTools.map((tool) => tool && <Link key={tool.slug} href={`/tools/${tool.slug}`} className="related-link"><span>{tool.category}</span><strong>{tool.title}</strong><ArrowLeft size={17} /></Link>)}
      </div>
    </aside>
  );
}

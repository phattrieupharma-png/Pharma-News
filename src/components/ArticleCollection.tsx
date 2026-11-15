import Link from "next/link";
import { ArrowRight, FileSearch } from "lucide-react";
import {
  ARTICLE_CATEGORIES,
  getArticlesByCategory,
  type Article,
  type ArticleCategorySlug,
} from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";

const categoryDescriptions: Record<ArticleCategorySlug, string> = {
  "diem-tin":
    "Những cập nhật đáng chú ý về dược phẩm, y tế và các khuyến cáo mới trong thực hành.",
  "goc-hoc-thuat":
    "Phân tích chuyên sâu, bằng chứng khoa học và kiến thức ứng dụng trong dược lâm sàng.",
  "chuyen-ben-le":
    "Những câu chuyện, góc nhìn và diễn biến thú vị bên lề lĩnh vực y dược.",
};

export function ArticleGrid({
  articles,
}: {
  articles: Article[];
}) {
  if (articles.length === 0) {
    return (
      <div className="empty-state">
        <FileSearch size={28} strokeWidth={1.5} aria-hidden="true" />
        <p>Chưa có bài viết trong mục này.</p>
      </div>
    );
  }

  return (
    <div className="article-grid">
      {articles.map((article) => (
        <ArticleCard article={article} key={`${article.categorySlug}-${article.slug}`} />
      ))}
    </div>
  );
}

export async function CategoryCollection({
  categorySlug,
}: {
  categorySlug: ArticleCategorySlug;
}) {
  const articles = await getArticlesByCategory(categorySlug);
  const category = ARTICLE_CATEGORIES[categorySlug];

  return (
    <main className="site-shell page-main">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PHARMA NEWS · CHUYÊN MỤC</span>
          <h1>{category.title}</h1>
          <p>{categoryDescriptions[categorySlug]}</p>
        </div>
        <span className="heading-count">{articles.length} bài viết</span>
      </div>
      <ArticleGrid articles={articles} />
      <Link className="text-link back-home-link" href="/">
        <ArrowRight size={16} aria-hidden="true" />
        Về trang chủ
      </Link>
    </main>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  count,
}: {
  eyebrow: string;
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {count !== undefined && (
        <span className="heading-count">{count} bài viết</span>
      )}
    </div>
  );
}

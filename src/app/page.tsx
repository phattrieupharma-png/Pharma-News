import Link from "next/link";
import { ArrowRight, CalendarDays, UserRound } from "lucide-react";
import {
  getAllArticles,
  getArticlesByCategory,
  ARTICLE_CATEGORIES,
  type ArticleCategorySlug,
} from "@/lib/articles";
import { ArticleCard, ArticleCover, CategoryBadge, CompactArticle, formatArticleDate } from "@/components/ArticleCard";

const categoryOrder: ArticleCategorySlug[] = [
  "diem-tin",
  "goc-hoc-thuat",
  "chuyen-ben-le",
];

export default async function HomePage() {
  const articles = await getAllArticles();
  const [featured, ...recentArticles] = articles;
  const categoryArticles = await Promise.all(
    categoryOrder.map(async (categorySlug) => ({
      categorySlug,
      articles: (await getArticlesByCategory(categorySlug)).slice(0, 3),
    })),
  );

  return (
    <main>
      <section className="site-shell home-hero-section">
        <div className="section-kicker">
          <span className="kicker-line" />
          <span>TRI THỨC DƯỢC LÂM SÀNG</span>
          <span className="kicker-dot" />
          <span>CẬP NHẬT HỌC THUẬT</span>
        </div>

        {featured ? (
          <div className="hero-grid">
            <article className="hero-feature">
              <Link
                className="hero-cover-link"
                href={`/bai-viet/${encodeURIComponent(featured.slug)}`}
                aria-label={`Đọc bài viết: ${featured.title || featured.slug}`}
              >
                <ArticleCover article={featured} />
                <span className="hero-image-note">BÀI VIẾT TIÊU ĐIỂM</span>
              </Link>
              <div className="hero-feature-copy">
                <CategoryBadge
                  categorySlug={featured.categorySlug}
                  category={featured.category}
                />
                <h1>
                  <Link href={`/bai-viet/${encodeURIComponent(featured.slug)}`}>
                    {featured.title || featured.slug}
                  </Link>
                </h1>
                {featured.summary && <p className="hero-summary">{featured.summary}</p>}
                <div className="article-card-meta hero-meta">
                  <span>
                    <CalendarDays size={15} aria-hidden="true" />
                    {formatArticleDate(featured.date)}
                  </span>
                  {featured.author && (
                    <span>
                      <UserRound size={15} aria-hidden="true" />
                      {featured.author}
                    </span>
                  )}
                </div>
              </div>
            </article>

            <aside className="latest-panel" aria-labelledby="latest-heading">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">MỚI NHẤT</span>
                  <h2 id="latest-heading">Bài viết gần đây</h2>
                </div>
                <Link className="icon-link" href="/gan-day" aria-label="Xem tất cả bài viết gần đây">
                  <ArrowRight size={18} />
                </Link>
              </div>
              <div className="latest-list">
                {recentArticles.slice(0, 4).map((article) => (
                  <CompactArticle
                    article={article}
                    key={`${article.categorySlug}-${article.slug}`}
                  />
                ))}
                {recentArticles.length === 0 && (
                  <p className="muted-copy">Chưa có thêm bài viết.</p>
                )}
              </div>
            </aside>
          </div>
        ) : (
          <div className="empty-home">
            <h1>Chào mừng đến với Pharma News</h1>
            <p>Các bài viết học thuật sẽ sớm được cập nhật.</p>
          </div>
        )}
      </section>

      <div className="home-categories">
        {categoryArticles.map(({ categorySlug, articles: categoryItems }, index) => {
          const category = ARTICLE_CATEGORIES[categorySlug];
          return (
            <section
              className={`site-shell category-band ${index === 0 ? "category-band-first" : ""}`}
              key={categorySlug}
            >
              <div className="section-heading">
                <div>
                  <span className="eyebrow">CHUYÊN MỤC {String(index + 1).padStart(2, "0")}</span>
                  <h2>{category.title}</h2>
                </div>
                <Link className="text-link" href={`/${categorySlug}`}>
                  Xem tất cả <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
              {categoryItems.length > 0 ? (
                <div className="article-grid">
                  {categoryItems.map((article) => (
                    <ArticleCard
                      article={article}
                      key={`${article.categorySlug}-${article.slug}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Chưa có bài viết trong mục này.</p>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}

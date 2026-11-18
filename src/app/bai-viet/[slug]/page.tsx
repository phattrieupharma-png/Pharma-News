import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, UserRound } from "lucide-react";
import {
  getAllArticles,
  getArticleBySlug,
  getArticlesByCategory,
} from "@/lib/articles";
import {
  CategoryBadge,
  CompactArticle,
  formatArticleDate,
} from "@/components/ArticleCard";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = (await getArticlesByCategory(article.categorySlug))
    .filter((related) => related.slug !== article.slug)
    .slice(0, 4);
  type NumberedTocItem = (typeof article.toc)[number] & { number: string };
  const tocItems = article.toc.reduce<{
    h1Count: number;
    h2Count: number;
    items: NumberedTocItem[];
  }>(
    (counts, item) => {
      const h1Count = item.level === 1 ? counts.h1Count + 1 : counts.h1Count;
      const h2Count = item.level === 1 ? 0 : counts.h2Count + 1;
      const number =
        item.level === 1
          ? `${h1Count}.`
          : `${h1Count}.${h2Count}.`;

      return {
        h1Count,
        h2Count,
        items: [...counts.items, { ...item, number }],
      };
    },
    { h1Count: 0, h2Count: 0, items: [] },
  ).items;

  return (
    <main className="site-shell article-page">
      <nav className="breadcrumb" aria-label="Điều hướng đường dẫn">
        <Link href="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${article.categorySlug}`}>{article.category}</Link>
        <span aria-hidden="true">/</span>
        <span className="breadcrumb-current">{article.title || article.slug}</span>
      </nav>

      <div className="article-layout">
        <article className="article-main">
          <header className="article-header">
            <CategoryBadge
              categorySlug={article.categorySlug}
              category={article.category}
            />
            <h1>{article.title || article.slug}</h1>
            <div className="article-byline">
              {article.author && (
                <span>
                  <UserRound size={16} aria-hidden="true" />
                  {article.author}
                </span>
              )}
              <span>
                <CalendarDays size={16} aria-hidden="true" />
                {formatArticleDate(article.date)}
              </span>
            </div>
            {article.summary && (
              <blockquote className="article-summary">
                <span className="summary-label">TÓM TẮT</span>
                <p>{article.summary}</p>
              </blockquote>
            )}
          </header>

          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          <div className="article-end">
            <span />
            <p>Bạn đang đọc bài viết trên Pharma News</p>
            <span />
          </div>
        </article>

        <aside className="article-sidebar">
          <section className="sidebar-card toc-card">
            <span className="eyebrow">ĐIỀU HƯỚNG</span>
            <h2>Mục lục bài viết</h2>
            {article.toc.length > 0 ? (
              <div className="toc-scroll">
                <nav aria-label="Mục lục bài viết">
                  <ol className="toc-list">
                    {tocItems.map((item) => (
                      <li
                        className={item.level === 2 ? "toc-level-two" : ""}
                        key={item.id}
                      >
                        <a href={`#${item.id}`}>
                          <span className="toc-number">{item.number}</span>
                          <span>{item.text}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            ) : (
              <p className="sidebar-muted">Bài viết chưa có đề mục.</p>
            )}
          </section>

          <section className="sidebar-card related-card">
            <div className="related-heading">
              <div>
                <span className="eyebrow">ĐỌC TIẾP</span>
                <h2>Cùng chuyên mục</h2>
              </div>
              <Link
                className="icon-link"
                href={`/${article.categorySlug}`}
                aria-label={`Xem chuyên mục ${article.category}`}
              >
                <ArrowRight size={17} />
              </Link>
            </div>
            {relatedArticles.length > 0 ? (
              <div className="related-list">
                {relatedArticles.map((related) => (
                  <CompactArticle article={related} key={related.slug} />
                ))}
              </div>
            ) : (
              <p className="sidebar-muted">Chưa có bài viết liên quan.</p>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpenText, CalendarDays, UserRound } from "lucide-react";
import type { Article, ArticleCategorySlug } from "@/lib/articles";

const categoryStyles: Record<ArticleCategorySlug, string> = {
  "diem-tin": "badge-news",
  "goc-hoc-thuat": "badge-academic",
  "chuyen-ben-le": "badge-stories",
};

const categoryAccents: Record<ArticleCategorySlug, string> = {
  "diem-tin": "cover-news",
  "goc-hoc-thuat": "cover-academic",
  "chuyen-ben-le": "cover-stories",
};

export function formatArticleDate(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (!date || Number.isNaN(parsedDate.getTime())) {
    return date || "Chưa cập nhật ngày";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsedDate);
}

export function CategoryBadge({
  categorySlug,
  category,
}: {
  categorySlug: ArticleCategorySlug;
  category: string;
}) {
  return <span className={`category-badge ${categoryStyles[categorySlug]}`}>{category}</span>;
}

export function ArticleCover({ article }: { article: Article }) {
  if (article.thumbnail) {
    return (
      <div className="article-cover">
        <Image
          src={article.thumbnail}
          alt={article.title || "Ảnh minh họa bài viết"}
          fill
          unoptimized
          sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 360px"
        />
      </div>
    );
  }

  return (
    <div
      className={`article-cover article-cover-placeholder ${categoryAccents[article.categorySlug]}`}
      aria-hidden="true"
    >
      <span className="cover-orbit cover-orbit-one" />
      <span className="cover-orbit cover-orbit-two" />
      <BookOpenText className="cover-icon" size={38} strokeWidth={1.2} />
      <span className="cover-label">PHARMA NEWS</span>
    </div>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  const title = article.title || article.slug;

  return (
    <article className="article-card">
      <Link
        className="article-card-cover-link"
        href={`/bai-viet/${encodeURIComponent(article.slug)}`}
        aria-label={`Đọc bài viết: ${title}`}
      >
        <ArticleCover article={article} />
      </Link>
      <div className="article-card-body">
        <CategoryBadge categorySlug={article.categorySlug} category={article.category} />
        <h3 className="article-card-title">
          <Link href={`/bai-viet/${encodeURIComponent(article.slug)}`}>{title}</Link>
        </h3>
        {article.summary && <p className="article-card-summary">{article.summary}</p>}
        <div className="article-card-meta">
          <span>
            <CalendarDays size={14} aria-hidden="true" />
            {formatArticleDate(article.date)}
          </span>
          {article.author && (
            <span>
              <UserRound size={14} aria-hidden="true" />
              {article.author}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function CompactArticle({ article }: { article: Article }) {
  return (
    <article className="compact-article">
      <div className="compact-article-date">
        <span className="date-day">{article.date.slice(8, 10) || "—"}</span>
        <span className="date-month">
          {article.date.slice(5, 7) && `TH${article.date.slice(5, 7)}`}
        </span>
      </div>
      <div className="compact-article-copy">
        <CategoryBadge categorySlug={article.categorySlug} category={article.category} />
        <h3>
          <Link href={`/bai-viet/${encodeURIComponent(article.slug)}`}>
            {article.title || article.slug}
          </Link>
        </h3>
        <p>{formatArticleDate(article.date)}</p>
      </div>
      <ArrowUpRight className="compact-arrow" size={17} aria-hidden="true" />
    </article>
  );
}

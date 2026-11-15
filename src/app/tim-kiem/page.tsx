import { Suspense } from "react";
import { Search } from "lucide-react";
import { searchArticles } from "@/lib/articles";
import { ArticleGrid, PageIntro } from "@/components/ArticleCollection";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense
      fallback={
        <main className="site-shell page-main">
          <PageIntro
            eyebrow="PHARMA NEWS · TRA CỨU"
            title="Tìm kiếm bài viết"
            description="Đang tải kết quả tìm kiếm..."
          />
        </main>
      }
    >
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchResults({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "";
  const articles = await searchArticles(query);
  const hasQuery = query.trim().length > 0;

  return (
    <main className="site-shell page-main">
      <PageIntro
        eyebrow="PHARMA NEWS · TRA CỨU"
        title={hasQuery ? "Kết quả tìm kiếm" : "Tìm kiếm bài viết"}
        description={
          hasQuery
            ? `Các bài viết phù hợp với từ khóa “${query.trim()}”.`
            : "Nhập từ khóa ở thanh tìm kiếm phía trên để khám phá nội dung."
        }
        count={hasQuery ? articles.length : undefined}
      />
      {hasQuery && articles.length === 0 ? (
        <div className="empty-state search-empty">
          <Search size={30} strokeWidth={1.5} aria-hidden="true" />
          <h2>Chưa tìm thấy bài viết phù hợp</h2>
          <p>Thử một từ khóa khác hoặc kiểm tra lại chính tả.</p>
        </div>
      ) : (
        <ArticleGrid articles={articles} />
      )}
    </main>
  );
}

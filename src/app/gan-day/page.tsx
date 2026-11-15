import { getAllArticles } from "@/lib/articles";
import { ArticleGrid, PageIntro } from "@/components/ArticleCollection";

export default async function RecentArticlesPage() {
  const articles = await getAllArticles();

  return (
    <main className="site-shell page-main">
      <PageIntro
        eyebrow="PHARMA NEWS · MỚI NHẤT"
        title="Bài viết gần đây"
        description="Theo dõi những cập nhật và kiến thức mới nhất từ tất cả chuyên mục."
        count={articles.length}
      />
      <ArticleGrid articles={articles} />
    </main>
  );
}

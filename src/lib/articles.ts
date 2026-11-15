import "server-only";

import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import { cacheLife } from "next/cache";

export const ARTICLE_CATEGORIES = {
  "diem-tin": {
    title: "Điểm tin",
    directory: "diem-tin",
  },
  "goc-hoc-thuat": {
    title: "Góc học thuật",
    directory: "goc-hoc-thuat",
  },
  "chuyen-ben-le": {
    title: "Chuyện bên lề",
    directory: "chuyen-ben-le",
  },
} as const;

export type ArticleCategorySlug = keyof typeof ARTICLE_CATEGORIES;

export interface ArticleTocItem {
  id: string;
  text: string;
  level: 1 | 2;
}

export interface Article {
  slug: string;
  categorySlug: ArticleCategorySlug;
  category: string;
  title: string;
  summary: string;
  author: string;
  date: string;
  thumbnail: string;
  toc: ArticleTocItem[];
  contentHtml: string;
}

const ARTICLE_ROOT = path.join(process.cwd(), "articles");
const IMAGE_OUTPUT_DIRECTORY = path.join(
  process.cwd(),
  "public",
  "images",
  "articles",
);
const IMAGE_OUTPUT_URL = "/images/articles";

function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,
    (entity, encoded: string) => {
      const normalized = encoded.toLowerCase();

      if (normalized.startsWith("#x")) {
        return String.fromCodePoint(Number.parseInt(normalized.slice(2), 16));
      }

      if (normalized.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(normalized.slice(1), 10));
      }

      const entities: Record<string, string> = {
        amp: "&",
        apos: "'",
        gt: ">",
        lt: "<",
        nbsp: " ",
        quot: '"',
      };

      return entities[normalized] ?? entity;
    },
  );
}

function htmlToText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\b[^>]*>/gi, " ")
      .replace(/<\/(?:p|div|li|h[1-6])\s*>/gi, " ")
      .replace(/<[^>]*>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function findFirstTable(html: string): { start: number; end: number } | null {
  const tableTags = /<\/?table\b[^>]*>/gi;
  const firstTable = tableTags.exec(html);

  if (!firstTable || /^<\//.test(firstTable[0])) {
    return null;
  }

  let depth = 1;
  let match: RegExpExecArray | null;

  while ((match = tableTags.exec(html)) !== null) {
    if (/^<\//.test(match[0])) {
      depth -= 1;
      if (depth === 0) {
        return { start: firstTable.index, end: tableTags.lastIndex };
      }
    } else {
      depth += 1;
    }
  }

  return null;
}

function extractMetadata(tableHtml: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  const rows = tableHtml.match(/<tr\b[^>]*>[\s\S]*?<\/tr\s*>/gi) ?? [];

  for (const row of rows) {
    const cells = row.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]\s*>/gi) ?? [];
    if (cells.length < 2) {
      continue;
    }

    const key = htmlToText(cells[0] ?? "").toLowerCase();
    const value = htmlToText(cells[1] ?? "");
    if (key) {
      metadata[key] = value;
    }
  }

  return metadata;
}

function slugifyHeading(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function addHeadingIds(html: string): {
  contentHtml: string;
  toc: ArticleTocItem[];
} {
  const usedIds = new Set<string>();
  const toc: ArticleTocItem[] = [];

  const contentHtml = html.replace(
    /<(h[12])\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi,
    (_heading, tag: string, attributes: string, innerHtml: string) => {
      const text = htmlToText(innerHtml);
      const baseId = slugifyHeading(text);
      let id = baseId;
      let suffix = 2;

      while (usedIds.has(id)) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(id);

      const attributesWithoutId = attributes.replace(
        /\s+id\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
        "",
      );
      const level = Number(tag.slice(1)) as 1 | 2;
      toc.push({ id, text, level });

      return `<${tag}${attributesWithoutId} id="${escapeHtmlAttribute(id)}">${innerHtml}</${tag}>`;
    },
  );

  return { contentHtml, toc };
}

function wrapTables(html: string): string {
  const tableTags = /<\/?table\b[^>]*>/gi;
  const replacements: Array<{ start: number; end: number }> = [];
  let depth = 0;
  let tableStart = -1;
  let match: RegExpExecArray | null;

  while ((match = tableTags.exec(html)) !== null) {
    if (/^<\//.test(match[0])) {
      depth -= 1;
      if (depth === 0 && tableStart !== -1) {
        replacements.push({ start: tableStart, end: tableTags.lastIndex });
        tableStart = -1;
      }
    } else {
      if (depth === 0) {
        tableStart = match.index;
      }
      depth += 1;
    }
  }

  let result = html;
  for (const replacement of replacements.reverse()) {
    result =
      result.slice(0, replacement.start) +
      `<div class="table-wrapper">${result.slice(replacement.start, replacement.end)}</div>` +
      result.slice(replacement.end);
  }
  return result;
}

function safeImageSlug(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "article";
}

function imageExtension(contentType: string): string {
  const extensions: Record<string, string> = {
    "image/bmp": "bmp",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/svg+xml": "svg",
    "image/tiff": "tiff",
    "image/webp": "webp",
  };

  return extensions[contentType.toLowerCase()] ?? "img";
}

function sortNewestFirst(articles: Article[]): Article[] {
  return articles.sort((left, right) => {
    const leftDate = Date.parse(left.date);
    const rightDate = Date.parse(right.date);
    const leftTime = Number.isNaN(leftDate) ? 0 : leftDate;
    const rightTime = Number.isNaN(rightDate) ? 0 : rightDate;
    return rightTime - leftTime;
  });
}

async function loadArticles(): Promise<Article[]> {
  const articles: Article[] = [];

  for (const [categorySlug, categoryInfo] of Object.entries(
    ARTICLE_CATEGORIES,
  ) as Array<[ArticleCategorySlug, (typeof ARTICLE_CATEGORIES)[ArticleCategorySlug]]>) {
    const categoryDirectory = path.join(ARTICLE_ROOT, categoryInfo.directory);
    let fileNames: string[];

    try {
      fileNames = await readdir(categoryDirectory);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        continue;
      }
      throw error;
    }

    const docxFiles = fileNames
      .filter(
        (fileName) =>
          fileName.toLowerCase().endsWith(".docx") &&
          !fileName.startsWith("~$"),
      )
      .sort((left, right) => left.localeCompare(right));

    for (const fileName of docxFiles) {
      const slug = path.basename(fileName, path.extname(fileName));
      let imageIndex = 0;
      let firstImageUrl = "";

      const result = await mammoth.convertToHtml(
        { path: path.join(categoryDirectory, fileName) },
        {
          convertImage: mammoth.images.imgElement(async (image) => {
            imageIndex += 1;
            const imageName = `${safeImageSlug(slug)}-img-${imageIndex}.${imageExtension(image.contentType)}`;
            const imageBuffer = await image.read();
            await mkdir(IMAGE_OUTPUT_DIRECTORY, { recursive: true });
            await writeFile(path.join(IMAGE_OUTPUT_DIRECTORY, imageName), imageBuffer);

            const imageUrl = `${IMAGE_OUTPUT_URL}/${imageName}`;
            if (imageIndex === 1) {
              firstImageUrl = imageUrl;
            }
            return { src: imageUrl };
          }),
        },
      );
      const conversionErrors = result.messages
        .filter((message) => message.type === "error")
        .map((message) => message.message);
      if (conversionErrors.length > 0) {
        throw new Error(
          `Could not convert ${categorySlug}/${fileName}: ${conversionErrors.join("; ")}`,
        );
      }
      for (const warning of result.messages.filter(
        (message) => message.type === "warning",
      )) {
        console.warn(`[articles] ${categorySlug}/${fileName}: ${warning.message}`);
      }

      let contentHtml = result.value;
      const metadataTable = findFirstTable(contentHtml);
      const metadata = metadataTable
        ? extractMetadata(
            contentHtml.slice(metadataTable.start, metadataTable.end),
          )
        : {};

      if (metadataTable) {
        contentHtml =
          contentHtml.slice(0, metadataTable.start) +
          contentHtml.slice(metadataTable.end);
      }

      const headings = addHeadingIds(contentHtml);
      contentHtml = wrapTables(headings.contentHtml);
      const thumbnail = metadata.thumbnail || firstImageUrl;

      articles.push({
        slug,
        categorySlug,
        category: categoryInfo.title,
        title: metadata.title ?? "",
        summary: metadata.summary ?? "",
        author: metadata.author ?? "",
        date: metadata.date ?? "",
        thumbnail,
        toc: headings.toc,
        contentHtml,
      });
    }
  }

  return sortNewestFirst(articles);
}

async function getCachedArticles(): Promise<Article[]> {
  "use cache";
  cacheLife("days");
  return loadArticles();
}

export async function getAllArticles(): Promise<Article[]> {
  return getCachedArticles();
}

export async function getArticlesByCategory(
  categorySlug: ArticleCategorySlug,
): Promise<Article[]> {
  const articles = await getCachedArticles();
  return sortNewestFirst(
    articles.filter((article) => article.categorySlug === categorySlug),
  );
}

export async function getArticleBySlug(
  slug: string,
): Promise<Article | undefined> {
  const articles = await getCachedArticles();
  return articles.find((article) => article.slug === slug);
}

export async function searchArticles(query: string): Promise<Article[]> {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const articles = await getCachedArticles();
  return articles.filter((article) =>
    [article.title, article.summary, htmlToText(article.contentHtml)]
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );
}

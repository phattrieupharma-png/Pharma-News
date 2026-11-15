import Image from "next/image";
import Link from "next/link";

const categories = [
  { href: "/diem-tin", label: "Điểm tin" },
  { href: "/goc-hoc-thuat", label: "Góc học thuật" },
  { href: "/chuyen-ben-le", label: "Chuyện bên lề" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-main">
        <div className="footer-about">
          <Link className="footer-brand" href="/">
            <Image
              className="footer-logo"
              src="/logo.png"
              alt=""
              width={32}
              height={32}
            />
            <span>Pharma News</span>
          </Link>
          <p>
            Nền tảng chia sẻ kiến thức dược lâm sàng và thông tin y khoa học
            thuật, được chọn lọc dành cho cộng đồng y dược.
          </p>
        </div>
        <div className="footer-links">
          <h2>Chuyên mục</h2>
          {categories.map((category) => (
            <Link href={category.href} key={category.href}>
              {category.label}
            </Link>
          ))}
        </div>
        <div className="footer-links">
          <h2>Khám phá</h2>
          <Link href="/gan-day">Bài viết gần đây</Link>
          <Link href="/tim-kiem">Tìm kiếm bài viết</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="site-shell footer-bottom-inner">
          <span>© Pharma News. Bảo lưu mọi quyền.</span>
          <span>Chia sẻ tri thức · Nâng tầm thực hành</span>
        </div>
      </div>
    </footer>
  );
}

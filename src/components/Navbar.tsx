import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

const navigation = [
  { href: "/", label: "Trang chủ" },
  { href: "/gan-day", label: "Gần đây" },
  { href: "/diem-tin", label: "Điểm tin" },
  { href: "/goc-hoc-thuat", label: "Góc học thuật" },
  { href: "/chuyen-ben-le", label: "Chuyện bên lề" },
];

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="topline">
        <div className="site-shell topline-inner">
          <span>Tri thức dược lâm sàng, cập nhật mỗi ngày</span>
          <span className="topline-note">Thông tin học thuật dành cho cộng đồng y dược</span>
        </div>
      </div>
      <div className="site-shell masthead">
        <Link className="brand" href="/" aria-label="Pharma News - Trang chủ">
          <Image
            className="brand-logo"
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            priority
          />
          <span className="brand-copy">
            <span className="brand-name">Pharma News</span>
            <span className="brand-caption">Clinical Pharmacy</span>
          </span>
        </Link>

        <form className="header-search" action="/tim-kiem" method="get" role="search">
          <label className="sr-only" htmlFor="site-search">
            Tìm kiếm bài viết
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="Tìm kiếm bài viết..."
          />
          <button type="submit" aria-label="Tìm kiếm">
            <Search size={17} />
          </button>
        </form>
      </div>
      <nav className="primary-nav" aria-label="Điều hướng chính">
        <div className="site-shell nav-scroll">
          {navigation.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

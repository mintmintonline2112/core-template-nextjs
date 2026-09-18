import Link from "next/link";
import { Brand, type BrandProps } from "./Brand";
import { SITE_CONTACT } from "@/config/contact";
import { siteRoutes } from "@/config/routes";
import type { SiteContact } from "@/lib/settings";
import { cn } from "@/utils/cn";

/** Link cột điều hướng. */
const FOOTER_LINK = "block py-1 text-base text-light-soft hover:text-gold-300";

/** Dòng liên hệ: icon 18px + nội dung. */
const CONTACT_ROW =
  "grid w-full grid-cols-[18px_minmax(0,1fr)] items-start gap-3 p-0 text-light-soft";

const CONTACT_ICON =
  "mt-1 block h-[18px] w-[18px] max-w-[18px] min-w-[18px] text-gold-300 [&>svg]:block [&>svg]:h-[18px] [&>svg]:max-h-[18px] [&>svg]:w-[18px] [&>svg]:max-w-[18px]";

/** Tiêu đề cột. */
const COL_TITLE = "mb-4 text-xs tracking-xl text-light uppercase";

export function Footer({
  brand,
  contact,
  footerText,
}: {
  brand?: BrandProps;
  /** Thông tin liên hệ từ admin; bỏ trống thì dùng mặc định trong config. */
  contact?: SiteContact;
  /** Dòng chữ cuối trang (admin → Cài đặt). */
  footerText?: string | null;
} = {}) {
  const info = contact ?? {
    ...SITE_CONTACT,
    name: "Your Company",
    mapUrl: null,
  };
  return (
    <footer className="bg-navy-900 text-light-soft">
      <div className="site-container grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] gap-[clamp(2rem,5vw,4rem)] pt-[clamp(3rem,6vw,4.5rem)] pb-10 max-[640px]:grid-cols-1 max-[640px]:gap-8">
        <div>
          <Brand footer {...brand} />
          <p className="mt-6 max-w-80 text-lg text-gold-300 italic">
            Your company tagline goes here.
          </p>
        </div>

        {/* Link chân trang trỏ vào section của trang chủ (page.seed.ts) —
            đổi sectionKey trong seed thì sửa lại đường dẫn ở đây cho khớp. */}
        <nav aria-label="Khám phá">
          <h4 className={COL_TITLE}>Khám phá</h4>
          <Link className={FOOTER_LINK} href={siteRoutes.products}>
            Dịch vụ
          </Link>
          <Link
            className={FOOTER_LINK}
            href={siteRoutes.homeSection("gioi-thieu")}
          >
            Giới thiệu
          </Link>
          <Link className={FOOTER_LINK} href={siteRoutes.homeSection("dich-vu")}>
            Chúng tôi làm gì
          </Link>
          <Link
            className={FOOTER_LINK}
            href={siteRoutes.homeSection("quy-trinh")}
          >
            Quy trình làm việc
          </Link>
        </nav>

        <nav aria-label="Công ty">
          <h4 className={COL_TITLE}>Công ty</h4>
          <Link className={FOOTER_LINK} href={siteRoutes.homeSection("faq")}>
            Câu hỏi thường gặp
          </Link>
          <Link className={FOOTER_LINK} href={siteRoutes.news}>
            Tin tức
          </Link>
          <Link className={FOOTER_LINK} href={siteRoutes.contact}>
            Liên hệ
          </Link>
          <Link
            className={FOOTER_LINK}
            href={siteRoutes.homeSection("request-quote")}
          >
            Nhận báo giá
          </Link>
        </nav>

        <div>
          <h4 className={COL_TITLE}>Contact</h4>
          <address className="mb-6 flex flex-col gap-3 text-sm leading-relaxed text-light-soft not-italic">
            <a
              className={cn(CONTACT_ROW, "hover:text-gold-300")}
              href={info.phoneHref}
            >
              <span className={CONTACT_ICON} aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 4h4l1.8 4.5-2.3 1.7a13 13 0 0 0 5.3 5.3l1.7-2.3L20 15v4a1.5 1.5 0 0 1-1.6 1.5C10.8 20 4 13.2 3.5 5.6A1.5 1.5 0 0 1 5 4z" />
                </svg>
              </span>
              <span>{info.phone}</span>
            </a>
            <a
              className={cn(CONTACT_ROW, "hover:text-gold-300")}
              href={`mailto:${info.email}`}
            >
              <span className={CONTACT_ICON} aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3.5 6.5 8.5 7 8.5-7" />
                </svg>
              </span>
              <span>{info.email}</span>
            </a>
            <div className={CONTACT_ROW}>
              <span className={CONTACT_ICON} aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2.6" />
                </svg>
              </span>
              <span>
                {info.address}
                <br />
                {info.location}
              </span>
            </div>
            {info.hours ? (
              <div className={CONTACT_ROW}>
                <span className={CONTACT_ICON} aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7.5V12l3 2" />
                  </svg>
                </span>
                <span>
                  <span className="sr-only">Opening hours: </span>
                  {info.hours}
                </span>
              </div>
            ) : null}
          </address>
          <Link href={siteRoutes.contact} className="btn btn-gold btn-sm">
            Nhận báo giá
          </Link>
        </div>
      </div>
      <div className="site-container flex flex-wrap justify-between gap-x-8 gap-y-2 border-t border-t-light/10 py-6 text-sm max-[640px]:flex-col">
        <p className="m-0">
          © {new Date().getFullYear()}{" "}
          {footerText?.trim() || `${info.name}. Bảo lưu mọi quyền.`}
        </p>
      </div>
    </footer>
  );
}

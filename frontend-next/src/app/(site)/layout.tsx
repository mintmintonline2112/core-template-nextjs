import type { ReactNode } from "react";
import { Footer } from "@/app/(site)/_components/Footer";
import { Header } from "@/app/(site)/_components/Header";
import { SiteEffects } from "@/app/(site)/_components/SiteEffects";
import { getSiteMenu } from "@/app/(site)/_lib/menu";
import { FONT_STACKS, getSiteSettings } from "@/lib/settings";

/** Khung site public: header (menu CMS) + nội dung + footer + hiệu ứng. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [menu, settings] = await Promise.all([getSiteMenu(), getSiteSettings()]);

  // Admin → Cài đặt → Font chữ: đè --font-main của site; trống = Roboto mặc định.
  const fontStack = settings.fontFamily ? FONT_STACKS[settings.fontFamily] : undefined;

  return (
    <>
      {fontStack ? (
        <style>{`:root { --font-main: ${fontStack}; }`}</style>
      ) : null}
      <SiteEffects />
      <Header menu={menu} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}

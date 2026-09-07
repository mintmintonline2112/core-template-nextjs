import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SiteEffects } from "@/components/site/SiteEffects";
import { getSiteMenu } from "@/lib/menu";
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

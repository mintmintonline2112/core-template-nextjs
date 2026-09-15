import { WorldMap } from "@/app/(site)/_components/WorldMap";
import { RichIntro, metaOf, type StandardSectionProps } from "./section-content";

const DEFAULT_INTRO =
  "<p>Prime Nuts USA is a California-based sourcing and trading company focused on connecting qualified international buyers with the California almond supply chain.</p>" +
  "<p>We simplify procurement by providing buyers with a local sourcing partner who understands supplier communication, product specifications, commercial requirements, logistics, and international trade.</p>" +
  "<p>Our team works with established industry participants to identify almond supply according to each customer&rsquo;s required variety, grade, size, packaging, volume, destination, and shipment schedule.</p>" +
  "<p>Our business is built on straightforward communication, responsible sourcing, and long-term commercial relationships.</p>";

/**
 * SECTION `about-map` — trang Home.
 * Giới thiệu công ty + bản đồ thế giới tương tác (6 nút khu vực).
 * CMS: heading, subheading, content, metadata.regions [{key,name,countries[]}].
 */
export function AboutMap({ section }: StandardSectionProps) {
  const regions = metaOf<Array<{ key?: string; name?: string }>>(section, "regions")
    ?.filter((region) => region.key && region.name)
    .map((region) => ({ key: region.key!, label: region.name! }));

  return (
    <section className="section" id={section?.sectionKey ?? "about-map"}>
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow">{section?.subheading ?? "About Prime Nuts USA"}</p>
          <h2>{section?.heading ?? "Connecting California Supply with Global Demand"}</h2>
          <RichIntro html={section?.content ?? DEFAULT_INTRO} />
        </div>
        <WorldMap regions={regions} />
      </div>
    </section>
  );
}

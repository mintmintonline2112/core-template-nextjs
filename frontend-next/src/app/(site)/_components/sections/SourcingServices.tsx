import { RichIntro, metaOf, type StandardSectionProps } from "./section-content";

const DEFAULT_INTRO =
  "<p>Working with suppliers from overseas can involve multiple parties, delayed communication, and unclear product availability.</p>" +
  "<p>Prime Nuts USA provides international buyers with a California-based sourcing contact. You send us your purchasing requirements, and our team identifies suitable supply options, coordinates commercial details, and follows the order through export preparation and cargo dispatch.</p>";

const SERVICES = [
  "Supplier sourcing and quotation", "Product and specification matching",
  "Commercial negotiation support", "Procurement coordination",
  "Packing and documentation coordination", "Export preparation",
  "Freight and container coordination", "Shipment follow-up",
];

/**
 * SECTION `sourcing-services` — trang Home.
 * Danh sách dịch vụ kẹp hai bên ảnh tròn (vòng nét đứt xoay) + dải câu mục tiêu.
 * CMS: heading, subheading, content, metadata.documents [{label,note}] (hoặc chuỗi),
 * metadata.incoterms [] (chip tuỳ chọn — trống thì ẩn).
 */
export function SourcingServices({ section }: StandardSectionProps) {
  const services = (
    metaOf<Array<string | { label?: string; note?: string }>>(section, "documents") ?? SERVICES
  )
    .map((entry) =>
      typeof entry === "string"
        ? { label: entry, note: undefined }
        : { label: entry.label ?? "", note: entry.note },
    )
    .filter((service) => service.label);
  const chips = (metaOf<string[]>(section, "incoterms") ?? []).filter(Boolean);
  const half = Math.ceil(services.length / 2);

  return (
    <section className="section" id={section?.sectionKey ?? "sourcing-services"}>
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow">{section?.subheading ?? "California-Based Sourcing & Procurement"}</p>
          <h2>{section?.heading ?? "A Local Point of Contact for Your Almond Purchases"}</h2>
          <RichIntro html={section?.content ?? DEFAULT_INTRO} />
        </div>

        {/* Dịch vụ kẹp hai bên ảnh tròn trung tâm */}
        <div className="doc-features reveal">
          <ul className="doc-col doc-col-left">
            {services.slice(0, half).map((service, index) => (
              <li key={service.label}>
                <span className="doc-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div className="doc-body">
                  <h4>{service.label}</h4>
                  {service.note ? <span className="doc-note">{service.note}</span> : null}
                </div>
              </li>
            ))}
          </ul>
          <div className="doc-center">
            <div className="doc-center-ring">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/container-ship.jpg" alt="" loading="lazy" />
            </div>
          </div>
          <ul className="doc-col doc-col-right">
            {services.slice(half).map((service, index) => (
              <li key={service.label}>
                <span className="doc-num" aria-hidden="true">
                  {String(half + index + 1).padStart(2, "0")}
                </span>
                <div className="doc-body">
                  <h4>{service.label}</h4>
                  {service.note ? <span className="doc-note">{service.note}</span> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="incoterm-band reveal">
          <p>
            Our objective is simple: to make purchasing California almonds more efficient,
            transparent, and reliable for international buyers.
          </p>
          {chips.length > 0 ? (
            <div className="incoterm-chips">
              {chips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

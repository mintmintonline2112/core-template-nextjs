import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import {
  ARCH,
  PHOTO_FRAME,
  SECTION,
  SECTION_FLOW,
  SECTION_NOTE,
  SECTION_PHOTO,
  SECTION_TINT,
} from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  ALMOND_ICON,
  Head,
  IconBadge,
  InlineNote,
  Shell,
  anchorId,
  iconFor,
  items,
  layoutOf,
  paragraphs,
  resolveImage,
  str,
  strings,
  type SectionProps,
} from "./shared";

const LAYOUTS = ["circles", "toggle", "names", "photo", "badge"] as const;

type Card = Record<string, string>; // title, text, short, image, imagePosition, icon

const pad = (n: number) => String(n + 1).padStart(2, "0");

/** Thẻ nổi lên khi rê chuột — dùng chung cho bố cục `names`, `photo`, `badge`. */
const CARD_BASE =
  "rounded-lg border border-line bg-paper shadow-soft hover:border-gold-400 hover:shadow-lift";

/** Ảnh trong thẻ phóng nhẹ khi rê chuột (thẻ bọc ngoài phải có class `group`). */
const CARD_ZOOM =
  "block h-full w-full object-cover transition-transform duration-500 ease-brand group-hover:scale-[1.045] motion-reduce:transition-none";

/**
 * SECTION `media-cards` — lưới thẻ có ảnh, mỗi thẻ một giống / định dạng sản phẩm.
 * layout `circles`: ảnh tròn đánh số + tên + mô tả (hàng ngang).
 * layout `toggle`:  thẻ lớn bo góc (gradient navy hoặc ảnh nền), công tắc "Short
 *                   version" đổi mô tả ngắn / đầy đủ (kèm cỡ hạt), nút kính mờ.
 * layout `names`:   thẻ tên có icon hạnh nhân (không ảnh).
 * layout `photo`:   ảnh lớn phía trên + lưới thẻ ảnh có số thứ tự (trang Products).
 * layout `badge`:   thẻ ảnh có nhãn số + icon, dải ảnh và dòng ghi chú (trang Products).
 * CMS: heading, subheading, content, metadata.items [{title,text,short,image,imagePosition,icon}],
 * sizes [] + toggleLabel (toggle), image (photo), photos [{image,caption}] + note (badge),
 * ctaLabel/ctaHref (toggle), itemLabel (photo/badge: chữ trước số thứ tự).
 *
 * Thẻ `.reveal` không tự khai transition: layer effects giữ transition của
 * hiệu ứng hiện dần (xem styles/effects.css), hover đổi viền/bóng tức thì.
 */
export function MediaCards({ section, index = 0 }: SectionProps) {
  const id = anchorId(section, "media-cards");
  const layout = layoutOf(section, LAYOUTS, "circles");
  const cards: Card[] = items(section, "items").filter((card) => card.title);

  if (layout === "toggle")
    return <ToggleCards id={id} section={section} cards={cards} />;
  if (layout === "photo")
    return <PhotoCards id={id} section={section} cards={cards} />;
  if (layout === "badge")
    return <BadgeCards id={id} section={section} cards={cards} />;

  if (layout === "names") {
    return (
      <Shell tint={index % 2 === 1} id={id}>
        <Head section={section} />
        {cards.length > 0 ? (
          <div
            data-stagger="90"
            className="grid grid-cols-3 gap-6 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1"
          >
            {cards.map((card) => (
              <article
                className={cn(
                  "tilt-card group reveal px-7 pt-8 pb-7 hover:-translate-y-1",
                  CARD_BASE,
                )}
                key={card.title}
              >
                <IconBadge className="mb-5 group-hover:scale-110 group-hover:rotate-[-5deg]">
                  {ALMOND_ICON}
                </IconBadge>
                <h3 className="mb-2 text-2xl">{card.title}</h3>
              </article>
            ))}
          </div>
        ) : null}
      </Shell>
    );
  }

  return (
    <section className={cn(SECTION, SECTION_TINT, SECTION_FLOW)} id={id}>
      <div className="site-container">
        <Head section={section} />
        {cards.length > 0 ? (
          <ul className="reveal mt-[clamp(2.5rem,5vw,3.5rem)] grid grid-cols-4 gap-[clamp(1.5rem,3vw,2.5rem)] text-center max-[900px]:grid-cols-2 max-[900px]:gap-y-10">
            {cards.map((card, i) => (
              <li className="group" key={`${card.title}-${i}`}>
                <div className="relative mx-auto aspect-square w-[clamp(150px,15vw,210px)]">
                  <span
                    className="absolute top-0 left-0 z-1 grid h-[46px] w-[46px] place-items-center rounded-full border-[3px] border-cream-2 bg-gold-400 text-base font-bold text-navy-900 shadow-badge"
                    aria-hidden="true"
                  >
                    {pad(i)}
                  </span>
                  {card.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImage(card.image)}
                      alt={card.title}
                      loading="lazy"
                      className="h-full w-full rounded-full border-4 border-paper object-cover shadow-lift transition-transform duration-[350ms] ease-brand group-hover:scale-105 motion-reduce:transition-none"
                    />
                  ) : null}
                </div>
                <h4 className="mt-5 mb-2 text-xl">{card.title}</h4>
                {card.text ? (
                  <p className="m-0 text-base text-ink-soft">{card.text}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

/* ---------- Bố cục `toggle` ---------- */

/** Nền thẻ gradient (không có ảnh): navy đậm → navy nhạt, ánh vàng đồng góc dưới. */
const GRADIENT_CARD =
  "bg-[radial-gradient(120%_70%_at_100%_100%,color-mix(in_oklab,var(--gold-300)_38%,transparent),transparent_62%),linear-gradient(178deg,var(--navy-800)_0%,var(--navy-600)_52%,color-mix(in_oklab,var(--navy-600)_55%,#fff)_100%)]";

/** Thẻ ảnh: lớp tối phủ lên ảnh cho chữ dễ đọc. */
const PHOTO_CARD_SCRIM =
  'before:absolute before:inset-0 before:-z-1 before:bg-[linear-gradient(180deg,color-mix(in_oklab,var(--navy-900)_72%,transparent)_0%,color-mix(in_oklab,var(--navy-900)_28%,transparent)_42%,color-mix(in_oklab,var(--navy-900)_5%,transparent)_62%,color-mix(in_oklab,var(--navy-900)_45%,transparent)_100%)] before:content-[""]';

/** Đoạn mô tả trong thẻ — dùng cho cả bản ngắn và các đoạn của bản đầy đủ. */
const CARD_TEXT = "mt-3 max-w-[44ch] text-base leading-relaxed text-white/90";

/**
 * Thẻ lớn + công tắc "Short version".
 *
 * Công tắc chạy thuần CSS, không JavaScript: checkbox ẩn là `peer` của thanh
 * trượt (đổi màu + dời chấm), còn việc đổi giữa mô tả ngắn / đầy đủ thì bắt từ
 * thẻ bao ngoài bằng `group-has-[input:not(:checked)]` — mô tả nằm khác nhánh
 * DOM với checkbox nên `peer-*` không với tới được.
 */
function ToggleCards({
  id,
  section,
  cards,
}: { id: string } & Pick<SectionProps, "section"> & { cards: Card[] }) {
  const sizes = strings(section, "sizes");
  const toggleLabel = str(section, "toggleLabel") ?? "Bản rút gọn";
  const ctaLabel = str(section, "ctaLabel");
  const ctaHref = str(section, "ctaHref");

  return (
    <section className={cn(SECTION, SECTION_TINT)} id={id}>
      <div className="site-container">
        <Head section={section} />

        {cards.length > 0 ? (
          <div className="mt-[clamp(2.25rem,4vw,3.25rem)] grid grid-cols-2 gap-[clamp(1rem,2vw,1.5rem)] max-[900px]:grid-cols-1">
            {cards.map((card, i) => {
              const detail = card.text || card.short || "";
              return (
                <article
                  className={cn(
                    "group reveal relative isolate min-h-[clamp(380px,36vw,480px)] overflow-hidden rounded-3xl text-white shadow-soft max-[900px]:min-h-[360px] max-[640px]:min-h-[340px] max-[640px]:rounded-2xl",
                    card.image ? PHOTO_CARD_SCRIM : GRADIENT_CARD,
                  )}
                  key={`${card.title}-${i}`}
                >
                  {card.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="absolute inset-0 -z-2 h-full w-full object-cover transition-transform duration-[900ms] ease-brand group-hover:scale-[1.04] motion-reduce:transition-none"
                      src={resolveImage(card.image)}
                      alt=""
                      loading="lazy"
                    />
                  ) : null}

                  <div className="relative flex h-full min-h-[inherit] flex-col p-[clamp(1.5rem,3vw,2.4rem)]">
                    <div className="flex items-center justify-between gap-4">
                      <label
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-3 select-none",
                          // Thẻ không có mô tả ngắn thì không có gì để đổi
                          !card.short && "invisible",
                        )}
                      >
                        <input
                          type="checkbox"
                          role="switch"
                          className="peer pointer-events-none absolute h-px w-px opacity-0"
                          defaultChecked
                        />
                        <span
                          className="relative h-[22px] w-[38px] shrink-0 rounded-full border border-white/55 bg-white/30 transition-colors duration-[220ms] ease-brand peer-checked:bg-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-gold-300 peer-checked:[&>span]:translate-x-4 peer-checked:[&>span]:bg-navy-700"
                          aria-hidden="true"
                        >
                          <span className="absolute top-[3px] left-[3px] h-[14px] w-[14px] rounded-full bg-white transition-[transform,background-color] duration-[240ms] ease-brand motion-reduce:transition-none" />
                        </span>
                        <span className="text-base font-medium">
                          {toggleLabel}
                        </span>
                      </label>
                      <span
                        className="font-display text-sm font-bold tracking-sm text-gold-300"
                        aria-hidden="true"
                      >
                        {pad(i)}
                      </span>
                    </div>

                    <h3 className="mt-4 mb-0 font-display text-h3 leading-tight text-white">
                      {card.title}
                    </h3>

                    {card.short ? (
                      <p
                        className={cn(
                          CARD_TEXT,
                          "mb-6 group-has-[input:not(:checked)]:hidden",
                        )}
                      >
                        {card.short}
                      </p>
                    ) : null}
                    <div
                      className={cn(
                        "mb-6",
                        card.short
                          ? "hidden group-has-[input:not(:checked)]:block group-has-[input:not(:checked)]:animate-[faq-in_300ms_var(--ease)_both] motion-reduce:animate-none"
                          : "block",
                      )}
                    >
                      {paragraphs(detail).map((paragraph, p) => (
                        <p key={p} className={cn(CARD_TEXT, "mb-0")}>
                          {paragraph}
                        </p>
                      ))}
                      {sizes.length > 0 ? (
                        <ul
                          className="mt-4 flex flex-wrap gap-2"
                          aria-label="Quy cách hiện có"
                        >
                          {sizes.map((size) => (
                            <li
                              key={size}
                              className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-sm font-semibold tracking-xs"
                            >
                              {size}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    {ctaLabel ? (
                      // Nút kính mờ ở đáy thẻ
                      <a
                        className="mt-auto inline-flex items-center gap-2 self-start rounded-full border border-white/60 bg-white/10 px-5 py-3 text-base font-semibold text-white backdrop-blur-[8px] transition-[background-color,color,border-color] duration-[220ms] ease-brand hover:border-gold-300 hover:bg-gold-300 hover:text-navy-900"
                        href={ctaHref || "#request-quote"}
                      >
                        <span
                          className="h-2 w-2 rounded-full bg-current"
                          aria-hidden="true"
                        />
                        {ctaLabel}
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        <InlineNote
          text={str(section, "note")}
          className={cn(SECTION_NOTE, "reveal")}
        />
      </div>
    </section>
  );
}

/* ---------- Bố cục `photo`: ảnh lớn + lưới thẻ ảnh (trang Products — giống tự nhiên) ---------- */

function PhotoCards({
  id,
  section,
  cards,
}: { id: string } & Pick<SectionProps, "section"> & { cards: Card[] }) {
  const image = str(section, "image");
  const itemLabel = str(section, "itemLabel") ?? "Loại";

  return (
    <section className={SECTION} id={id}>
      <div className="site-container">
        <Head section={section} />

        {image ? (
          <figure className={cn(PHOTO_FRAME, SECTION_PHOTO, ARCH, "reveal")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImage(image)}
              alt={str(section, "imageAlt") ?? section?.heading ?? ""}
            />
          </figure>
        ) : null}

        {cards.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
            {cards.map((card, i) => (
              <article
                className={cn(
                  "group reveal grid min-h-[290px] grid-cols-[minmax(190px,0.9fr)_minmax(0,1.1fr)] overflow-hidden hover:-translate-y-1 max-[640px]:grid-cols-1",
                  CARD_BASE,
                )}
                key={`${card.title}-${i}`}
              >
                {card.image ? (
                  <figure className="relative m-0 min-h-full min-w-0 overflow-hidden bg-navy-900 max-[640px]:aspect-[16/10] max-[640px]:min-h-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveImage(card.image)}
                      alt={`Ảnh ${card.title}`}
                      loading="lazy"
                      style={
                        card.imagePosition
                          ? { objectPosition: card.imagePosition }
                          : undefined
                      }
                      className={cn(
                        CARD_ZOOM,
                        "min-h-[290px] max-[640px]:min-h-0",
                      )}
                    />
                  </figure>
                ) : null}
                <div className="flex flex-col justify-center px-6 py-7">
                  <div className="mb-5 flex items-center gap-3 text-2xs font-bold tracking-md text-ink-faint uppercase">
                    <IconBadge className="h-[42px] w-[42px] flex-none">
                      {ALMOND_ICON}
                    </IconBadge>
                    <span>{`${itemLabel} ${pad(i)}`}</span>
                  </div>
                  <h3 className="mb-2 text-2xl">{card.title}</h3>
                  {card.text ? (
                    <p className="m-0 text-ink-soft">{card.text}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ---------- Bố cục `badge`: thẻ ảnh có nhãn số + icon, dải ảnh, dòng ghi chú ---------- */

function BadgeCards({
  id,
  section,
  cards,
}: { id: string } & Pick<SectionProps, "section"> & { cards: Card[] }) {
  const photos = items(section, "photos").filter((photo) => photo.image);
  const note = str(section, "note");
  const itemLabel = str(section, "itemLabel") ?? "Dạng";

  return (
    <section className={cn(SECTION, SECTION_TINT)} id={id}>
      <div className="site-container">
        <Head section={section} />

        {cards.length > 0 ? (
          <div className="grid grid-cols-3 gap-6 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1">
            {cards.map((card, i) => (
              <article
                className={cn(
                  "group reveal overflow-hidden hover:-translate-y-[5px]",
                  CARD_BASE,
                )}
                key={`${card.title}-${i}`}
              >
                {/* ::after = lớp tối vuốt dần xuống đáy ảnh, cho nhãn số nổi lên */}
                <div className='relative aspect-[4/3] overflow-hidden bg-cream-2 after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,color-mix(in_oklab,var(--navy-900)_2%,transparent)_45%,color-mix(in_oklab,var(--navy-900)_32%,transparent)_100%)] after:content-[""]'>
                  {card.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImage(card.image)}
                      alt={`Ảnh ${card.title}`}
                      loading="lazy"
                      style={{ objectPosition: card.imagePosition || "center" }}
                      className={CARD_ZOOM}
                    />
                  ) : null}
                  <span className="absolute top-4 left-4 z-1 rounded-full border border-gold-300/50 bg-navy-900/90 px-3 py-2 text-2xs leading-none font-bold tracking-md text-cream uppercase">
                    {`${itemLabel} ${pad(i)}`}
                  </span>
                </div>
                <div className="relative min-h-[190px] border-t-[3px] border-gold-400 px-6 pt-6 pb-7">
                  <IconBadge className="absolute -top-[1.8rem] right-[1.3rem] border-cream bg-navy-700 text-cream shadow-badge">
                    {iconFor(card.icon, i)}
                  </IconBadge>
                  <h3 className="mb-2 max-w-[calc(100%-3.2rem)] text-2xl">
                    {card.title}
                  </h3>
                  {card.text ? (
                    <p className="m-0 text-ink-soft">{card.text}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {photos.length > 0 ? (
          <div
            data-stagger="70"
            className={cn(
              "reveal reveal-group mt-[clamp(2.5rem,5vw,3.5rem)] grid grid-cols-3 gap-6",
              photos.length === 2 && "grid-cols-2",
            )}
          >
            {photos.map((photo, i) => (
              <figure className="m-0" key={`${photo.image}-${i}`}>
                <div className={cn(PHOTO_FRAME, "aspect-4/3")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImage(photo.image)}
                    alt={photo.caption ?? ""}
                    loading="lazy"
                  />
                </div>
                {photo.caption ? (
                  <figcaption className="mt-3 text-center font-display text-base text-ink-faint italic">
                    {photo.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        ) : null}

        {note ? (
          <div className="reveal mt-[clamp(2.5rem,5vw,4rem)] rounded-lg border border-l-2 border-navy-100 border-l-gold-400 bg-navy-50 px-8 py-6 text-lg text-ink-soft">
            <p
              className="m-0 max-w-none [&_strong]:text-navy-700"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(note) }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

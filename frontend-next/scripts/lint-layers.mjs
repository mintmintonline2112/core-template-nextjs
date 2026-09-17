#!/usr/bin/env node
/**
 * lint:layers — bắt class Tailwind bị CASCADE LAYER nuốt im lặng.
 *
 * Kiến trúc CSS (xem src/styles/tailwind.css):
 *
 *     @layer theme, base, components, utilities, effects;
 *
 * Layer đứng sau thắng layer đứng trước, BẤT KỂ specificity. base và
 * components nằm trước utilities nên không bao giờ nuốt class Tailwind. Chỉ
 * effects.css (trạng thái hiệu ứng do JS bật/tắt, cố ý đặt SAU utilities) là
 * có thể nuốt: ví dụ `<article className="reveal transition-colors">` thì
 * transition của `.reveal` thắng, class Tailwind vẫn nằm trong DOM, build
 * xanh, nhưng không có tác dụng.
 *
 * Script đọc effects.css, lấy các thuộc tính mà rule theo từng class móc
 * (`.reveal`, …) đặt, rồi dò mọi className trong src/app/(site):
 *
 *   [BỊ NUỐT]  class Tailwind đặt cùng thuộc tính lên phần tử mang class móc đó
 *   [THỪA  !]  hậu tố `!` — không còn layer nào cần đè bằng `!`
 *
 * Giới hạn: chỉ đọc chuỗi class viết thẳng trong className / cn(...), không lần
 * theo hằng số (PHOTO_FRAME…); không biết phần tử nào là CON của
 * `.reveal-group` — đừng đặt opacity / transform / transition lên con trực tiếp
 * của nó.
 *
 * Chạy: npm run lint:layers        (thoát mã 1 nếu có phát hiện)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIR = path.join(ROOT, "src/app/(site)");
const EFFECTS_CSS = path.join(ROOT, "src/styles/effects.css");

/** Thuộc tính CSS -> tiền tố utility Tailwind đặt cùng thuộc tính đó. */
const PROP_PREFIX = [
  [/^opacity$/, /^opacity-/],
  [/^transform$/, /^\[transform:/],
  [/^transition(-[a-z]+)?$/, /^(transition|duration-|ease-|delay-)/],
  [/^animation(-[a-z]+)?$/, /^animate-/],
];

/** Đọc effects.css -> map: tên class -> tập tiền tố utility mà nó sẽ nuốt. */
function readEffects() {
  const css = fs
    .readFileSync(EFFECTS_CSS, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  const map = new Map();
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const props = m[2]
      .split(";")
      .map((d) => d.split(":")[0].trim().toLowerCase())
      .filter(Boolean);
    const prefixes = PROP_PREFIX.filter(([p]) =>
      props.some((x) => p.test(x)),
    ).map(([, u]) => u);
    if (!prefixes.length) continue;
    for (const selector of m[1].trim().replace(/^@media[^{]*/, "").split(/,(?![^(]*\))/)) {
      // Compound CUỐI của selector mới là phần tử nhận style.
      const last =
        selector
          .trim()
          .split(/\s+|>|\+|~/)
          .filter(Boolean)
          .pop() ?? "";
      if (last.includes("::") || last.startsWith(":is(")) continue;
      for (const c of last.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
        if (c[1] === "is-visible") continue;
        if (!map.has(c[1])) map.set(c[1], new Set());
        for (const p of prefixes) map.get(c[1]).add(p);
      }
    }
  }
  return map;
}

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, f.name);
    if (f.isDirectory()) walk(fp, out);
    else if (f.name.endsWith(".tsx")) out.push(fp);
  }
  return out;
}

/**
 * Tách tên class khỏi một biểu thức className.
 * - Chỉ lấy nội dung trong CHUỖI (nháy đơn/kép/backtick); định danh JS trong
 *   cn(...) như `isActive`, `PHOTO_FRAME` không phải class.
 * - Tôn trọng dấu ngoặc vuông: `w-[min(55vw,1150px)]` là MỘT class.
 */
function classesIn(expr) {
  const out = [];
  for (const s of expr.matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)) {
    const text = s[1] ?? s[2] ?? s[3] ?? "";
    if (text.includes("${")) continue;
    let depth = 0,
      cur = "";
    for (const ch of text) {
      if (ch === "[" || ch === "(") depth++;
      else if (ch === "]" || ch === ")") depth--;
      if (/\s/.test(ch) && depth === 0) {
        if (cur) (out.push(cur), (cur = ""));
      } else cur += ch;
    }
    if (cur) out.push(cur);
  }
  return out;
}

const hooks = readEffects();
const findings = [];

for (const file of walk(SCAN_DIR)) {
  const src = fs.readFileSync(file, "utf8");
  for (const m of src.matchAll(
    /className=(?:("(?:[^"]*)")|\{`(?:[^`]*)`\}|\{cn\(([\s\S]*?)\)\})/g,
  )) {
    const classes = classesIn(m[0].slice("className=".length));
    const swallowed = new Set();
    for (const c of classes)
      for (const p of hooks.get(c) ?? []) swallowed.add(p);

    const line = src.slice(0, m.index).split("\n").length;
    const rel = path.relative(ROOT, file);
    for (const cls of classes) {
      if (cls.endsWith("!")) {
        findings.push(`${rel}:${line}  [THỪA  !]  ${cls}  — bỏ dấu ! đi`);
        continue;
      }
      const bare = cls.replace(/^(?:[^:\s[]+:|\[[^\]]*\]:)+/, "");
      if ([...swallowed].some((p) => p.test(bare))) {
        findings.push(
          `${rel}:${line}  [BỊ NUỐT]  ${cls}  — effects.css đè thuộc tính này trên phần tử`,
        );
      }
    }
  }
}

if (!findings.length) {
  console.log("lint:layers — sạch, không có class Tailwind nào bị nuốt im lặng.");
  process.exit(0);
}
console.error(`lint:layers — ${findings.length} phát hiện:\n`);
for (const f of findings) console.error("  " + f);
console.error(`
Cách sửa [BỊ NUỐT]: chuyển class đó lên phần tử con (VD bọc nội dung thẻ), hoặc
bỏ đi nếu hiệu ứng hiện dần đã lo phần chuyển động.
Giải thích đầy đủ: comment đầu file scripts/lint-layers.mjs`);
process.exit(1);

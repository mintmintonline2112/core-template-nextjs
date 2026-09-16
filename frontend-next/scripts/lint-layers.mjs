#!/usr/bin/env node
/**
 * lint:layers — bắt lỗi CASCADE LAYER giữa Tailwind và CSS cũ.
 *
 * Kiến trúc CSS của site (xem src/styles/tailwind.css):
 *
 *     @layer theme, base, utilities, legacy;
 *     base.css  -> base    (TRƯỚC utilities)  reset theo TÊN THẺ
 *     site.css  -> legacy  (SAU  utilities)   CSS component theo .class
 *
 * Layer đứng sau thắng layer đứng trước, BẤT KỂ specificity. Nên:
 *
 *   - Rule theo tên thẻ ở base  -> utility thắng  -> KHÔNG cần hậu tố `!`
 *   - Rule theo .class ở legacy -> utility THUA   -> phải có hậu tố `!`
 *
 * Kiểu lỗi này thua IM LẶNG: class vẫn nằm trong DOM, build xanh, lint xanh,
 * chỉ là không có tác dụng. Script dò cả hai chiều:
 *
 *   [THIẾU !]  utility đang bị một rule .class trong site.css nuốt
 *   [THỪA  !]  `!` không còn đối thủ nào, bỏ đi cho sạch
 *
 * Chạy: npm run lint:layers        (thoát mã 1 nếu có phát hiện)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIR = path.join(ROOT, "src/app/(site)");
const LEGACY_CSS = path.join(ROOT, "src/styles/site.css");

/** Thuộc tính CSS -> tiền tố utility Tailwind đặt cùng thuộc tính đó. */
const PROP_PREFIX = [
  [/^margin(-|$)/, /^-?m[trblxyse]?-/],
  [/^padding(-|$)/, /^p[trblxyse]?-/],
  [/^color$/, /^text-/],
  [/^background(-color)?$/, /^bg-/],
  [/^border(-[a-z]+)?-color$/, /^border-/],
  [/^border(-[a-z]+)?-width$|^border$/, /^border(-|$)/],
  [
    /^font-family$/,
    /^font-(?!thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/,
  ],
  [
    /^font-weight$/,
    /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
  ],
  [/^line-height$/, /^leading-/],
  [/^letter-spacing$/, /^tracking-/],
  [/^width$/, /^w-/],
  [/^height$/, /^h-/],
  [
    /^display$/,
    /^(block|inline|inline-block|flex|inline-flex|grid|inline-grid|hidden|contents|table)$/,
  ],
  [/^transition(-property)?$/, /^transition/],
  [/^text-transform$/, /^(uppercase|lowercase|capitalize|normal-case)$/],
  [/^text-align$/, /^text-(left|right|center|justify)$/],
  [/^font-style$/, /^(italic|not-italic)$/],
];

/** Đọc site.css -> map: tên class -> tập tiền tố utility mà nó sẽ nuốt. */
function readLegacy() {
  const css = fs
    .readFileSync(LEGACY_CSS, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const map = new Map();
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim();
    if (selector.startsWith("@") || !selector.includes(".")) continue;
    const props = m[2]
      .split(";")
      .map((d) => d.split(":")[0].trim().toLowerCase())
      .filter(Boolean);
    const prefixes = PROP_PREFIX.filter(([p]) =>
      props.some((x) => p.test(x)),
    ).map(([, u]) => u);
    if (!prefixes.length) continue;
    // Class ở compound CUỐI của selector mới là thứ áp lên phần tử đang xét.
    const last =
      selector
        .split(",")
        .pop()
        .trim()
        .split(/\s+|>|\+|~/)
        .filter(Boolean)
        .pop() ?? "";
    // Rule nhắm ::before/::after tô cho phần tử giả, không đụng chính phần tử.
    if (last.includes("::")) continue;
    for (const c of last.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
      if (!map.has(c[1])) map.set(c[1], new Set());
      for (const p of prefixes) map.get(c[1]).add(p);
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
 *   cn(...) như `isActive`, `card.image` không phải class.
 * - Tôn trọng dấu ngoặc vuông: `w-[min(55vw,1150px)]` là MỘT class, không cắt
 *   ở dấu phẩy.
 */
function classesIn(expr) {
  const out = [];
  for (const s of expr.matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)) {
    const text = s[1] ?? s[2] ?? s[3] ?? "";
    if (text.includes("${")) continue; // chuỗi có nội suy -> bỏ qua cho chắc
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

const legacy = readLegacy();
const findings = [];

for (const file of walk(SCAN_DIR)) {
  const src = fs.readFileSync(file, "utf8");
  for (const m of src.matchAll(
    /className=(?:("(?:[^"]*)")|\{`(?:[^`]*)`\}|\{cn\(([\s\S]*?)\)\})/g,
  )) {
    const classes = classesIn(m[0].slice("className=".length));
    // gom mọi tiền tố mà các class legacy trên CHÍNH phần tử này sẽ nuốt
    const swallowed = new Set();
    for (const c of classes)
      for (const p of legacy.get(c.replace(/!$/, "")) ?? []) swallowed.add(p);

    const line = src.slice(0, m.index).split("\n").length;
    const rel = path.relative(ROOT, file);
    for (const cls of classes) {
      const bare = cls.replace(/^(?:[^:\s]+:)+/, "").replace(/!$/, "");
      const hit = [...swallowed].some((p) => p.test(bare));
      if (hit && !cls.endsWith("!")) {
        findings.push(
          `${rel}:${line}  [THIẾU !]  ${cls}  — bị class legacy trên cùng phần tử nuốt`,
        );
      } else if (!hit && cls.endsWith("!")) {
        findings.push(
          `${rel}:${line}  [THỪA  !]  ${cls}  — không còn đối thủ, bỏ dấu ! đi`,
        );
      }
    }
  }
}

if (!findings.length) {
  console.log("lint:layers — sạch, không có utility nào thua im lặng.");
  process.exit(0);
}
console.error(`lint:layers — ${findings.length} phát hiện:\n`);
for (const f of findings) console.error("  " + f);
console.error(`
Hai kiểu BÁO THỪA cần tự nhìn lại, script không tự phân biệt được:
  1. Rule legacy đặt ĐÚNG giá trị mà utility muốn (VD .why-grid{display:grid}
     nuốt class \`grid\`) — thua nhưng kết quả y hệt, bỏ qua được.
  2. Rule legacy có nhiều compound (VD .serve-band .eyebrow{display}) chỉ áp khi
     phần tử nằm trong container đó — ngoài container thì không ảnh hưởng.
Giải thích đầy đủ: comment đầu file scripts/lint-layers.mjs`);
process.exit(1);

import localFont from "next/font/local";

/**
 * Font local (Barlow + Barlow Condensed). Tách riêng để root layout (vi) và
 * root layout (zh) dùng chung — next/font/local yêu cầu gọi ở module scope
 * với đường dẫn tương đối từ chính file này (src/lib → ../fonts).
 */
export const barlow = localFont({
  variable: "--font-barlow",
  display: "swap",
  src: [
    { path: "../fonts/barlow-v13-7cHqv4kjgoGqM7E3p-ks6FospT4.woff2", weight: "300" },
    { path: "../fonts/barlow-v13-7cHqv4kjgoGqM7E3p-ks6VospT4.woff2", weight: "300" },
    { path: "../fonts/barlow-v13-7cHqv4kjgoGqM7E3p-ks51os.woff2", weight: "300" },
    { path: "../fonts/barlow-v13-7cHpv4kjgoGqM7E_A8s52Hs.woff2", weight: "400" },
    { path: "../fonts/barlow-v13-7cHpv4kjgoGqM7E_Ass52Hs.woff2", weight: "400" },
    { path: "../fonts/barlow-v13-7cHpv4kjgoGqM7E_DMs5.woff2", weight: "400" },
    { path: "../fonts/barlow-v13-7cHqv4kjgoGqM7E3_-gs6FospT4.woff2", weight: "500" },
    { path: "../fonts/barlow-v13-7cHqv4kjgoGqM7E3_-gs6VospT4.woff2", weight: "500" },
    { path: "../fonts/barlow-v13-7cHqv4kjgoGqM7E3_-gs51os.woff2", weight: "500" },
  ],
});

export const barlowCondensed = localFont({
  variable: "--font-barlow-cond",
  display: "swap",
  src: [
    {
      path: "../fonts/barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B47rxz3nWuZEC.woff2",
      weight: "300",
    },
    {
      path: "../fonts/barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B47rxz3jWuZEC.woff2",
      weight: "300",
    },
    {
      path: "../fonts/barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B47rxz3bWuQ.woff2",
      weight: "300",
    },
    {
      path: "../fonts/barlowcondensed-v13-HTx3L3I-JCGChYJ8VI-L6OO_au7B6x7T2kn3.woff2",
      weight: "400",
    },
    {
      path: "../fonts/barlowcondensed-v13-HTx3L3I-JCGChYJ8VI-L6OO_au7B6x_T2kn3.woff2",
      weight: "400",
    },
    {
      path: "../fonts/barlowcondensed-v13-HTx3L3I-JCGChYJ8VI-L6OO_au7B6xHT2g.woff2",
      weight: "400",
    },
    {
      path: "../fonts/barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B4-Lwz3nWuZEC.woff2",
      weight: "500",
    },
    {
      path: "../fonts/barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B4-Lwz3jWuZEC.woff2",
      weight: "500",
    },
    {
      path: "../fonts/barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B4-Lwz3bWuQ.woff2",
      weight: "500",
    },
    {
      path: "../fonts/barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B4873z3nWuZEC.woff2",
      weight: "600",
    },
    {
      path: "../fonts/barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B4873z3jWuZEC.woff2",
      weight: "600",
    },
    {
      path: "../fonts/barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B4873z3bWuQ.woff2",
      weight: "600",
    },
  ],
});

export const fontClassName = `${barlow.variable} ${barlowCondensed.variable}`;

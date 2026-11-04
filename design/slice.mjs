// Cuts the rendered canvas into the pieces the README lays out flush, and writes the README.
import { readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const [, , plate, outDir] = process.argv;
const R = 2; // canvas px per layout px
mkdirSync(outDir, { recursive: true });

const SITE = "https://dealwithmuhammad.com";
const RAW = "https://raw.githubusercontent.com/Deal-With-Muhammad/Deal-With-Muhammad/main/assets";
const OUTPUT = "https://raw.githubusercontent.com/Deal-With-Muhammad/Deal-With-Muhammad/output";
const LIVE = "https://www.dealwithmuhammad.com/api/views/invite-card";

const crop = async (name, x, y, w, h, quality = 90) => {
  await sharp(plate)
    .extract({ left: x * R, top: y * R, width: w * R, height: h * R })
    .webp({ quality, alphaQuality: 100, smartSubsample: true, effort: 6 })
    .toFile(`${outDir}/${name}.webp`);
};

// Hero: name row, button row, phones.
await crop("hero-top", 0, 0, 900, 252, 92);
const btnCuts = [0, 207, 369, 531, 693, 900];
const btnNames = ["hero-pad-l", "btn-website", "btn-linkedin", "btn-instagram", "hero-pad-r"];
for (let i = 0; i < 5; i++) await crop(btnNames[i], btnCuts[i], 252, btnCuts[i + 1] - btnCuts[i], 74, 92);
await crop("hero-phones", 0, 326, 900, 386, 90);

// DWM Invite plate. The live numbers are drawn over this by the portfolio's card route.
await crop("invite-plate", 0, 712, 900, 392, 86);

await crop("tile-fleetzero", 0, 1104, 450, 312, 90);
await crop("tile-imposter", 450, 1104, 450, 312, 90);

await crop("dock-head", 0, 1416, 900, 54, 92);
const APPS = ["invite", "imposter", "bgremove", "qr", "email", "ip", "compressor", "progress"];
const px = 225; // 112.5 layout px
for (let i = 0; i < 8; i++) {
  await sharp(plate)
    .extract({ left: i * px, top: 1470 * R, width: px, height: 148 * R })
    .webp({ quality: 92, alphaQuality: 100, smartSubsample: true, effort: 6 })
    .toFile(`${outDir}/app-${APPS[i]}.webp`);
}

await crop("graph-plate", 0, 1618, 900, 230, 90);

// Animated hero top: real raster plus a soft sweep of light and a pulsing status dot.
const b64 = readFileSync(`${outDir}/hero-top.webp`).toString("base64");
const m = JSON.parse(readFileSync(new URL("./metrics.json", import.meta.url)));
const dx = (m.herodot.x + m.herodot.w / 2) * R, dy = (m.herodot.y + m.herodot.h / 2) * R;
writeFileSync(`${outDir}/hero-top.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 504" width="1800" height="504"><title>Muhammad Ahmad, Software Engineer at FleetZero</title><defs><linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".26"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><clipPath id="c"><rect width="1800" height="600" rx="52"/></clipPath></defs><style>@keyframes w{0%{transform:translateX(-900px)}26%,100%{transform:translateX(2300px)}}@keyframes p{0%{opacity:.75;transform:scale(1)}70%,100%{opacity:0;transform:scale(3.4)}}.w{animation:w 10s cubic-bezier(.45,.05,.3,1) 1s infinite;transform:translateX(-900px)}.p{animation:p 2.2s ease-out infinite;transform-box:fill-box;transform-origin:center;opacity:0}@media (prefers-reduced-motion:reduce){.w,.p{animation:none}}</style><image width="1800" height="504" href="data:image/webp;base64,${b64}"/><g clip-path="url(#c)"><rect class="w" y="-60" width="760" height="640" fill="url(#s)" style="mix-blend-mode:soft-light"/></g><circle class="p" cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="9" fill="#34e368"/></svg>`);

rmSync(`${outDir}/hero-top.webp`);

// README: everything on one line so no whitespace sneaks between the flush images.
const a = (href, title, src, width, alt) =>
  `<a href="${href}" title="${title}"><img src="${src}" width="${width}" align="top" alt="${alt}"></a>`;
const rows = [
  a(SITE, "Muhammad Ahmad", `${RAW}/hero-top.svg`, "100%", "Muhammad Ahmad, Software Engineer at FleetZero. I build web and mobile apps people use every day."),
  a(SITE, "Muhammad Ahmad", `${RAW}/hero-pad-l.webp`, "23%", ""),
  a(SITE, "dealwithmuhammad.com", `${RAW}/btn-website.webp`, "18%", "Website"),
  a("https://www.linkedin.com/in/muhammad-ahmad-7009b8248/", "LinkedIn", `${RAW}/btn-linkedin.webp`, "18%", "LinkedIn"),
  a("https://www.instagram.com/dealwithmuhammad/", "Instagram", `${RAW}/btn-instagram.webp`, "18%", "Instagram"),
  a(SITE, "Muhammad Ahmad", `${RAW}/hero-pad-r.webp`, "23%", ""),
  a(`${SITE}/work`, "See my work", `${RAW}/hero-phones.webp`, "100%", "Apps I built, shown on iPhones: DWM QR, Imposter Who, DWM Invite and DWM BG Remover"),
  a("https://invite.dealwithmuhammad.com", "Open DWM Invite", LIVE, "100%", "My biggest achievement: DWM Invite, online invitations that open like a film, with live visitor numbers"),
  a("https://fleetzero.ai", "Open fleetzero.ai", `${RAW}/tile-fleetzero.webp`, "50%", "Where I work: FleetZero. I built fleetzero.ai and garagezero.ai."),
  a("https://imposterwho.dealwithmuhammad.com", "Play Imposter Who", `${RAW}/tile-imposter.webp`, "50%", "Imposter Who, a party word game with 50,000+ words"),
  a(`${SITE}/tools`, "All my free tools", `${RAW}/dock-head.webp`, "100%", "More things I've built, free for anyone"),
  ...[
    ["invite", "DWM Invite", "https://invite.dealwithmuhammad.com"],
    ["imposter", "Imposter Who", "https://imposterwho.dealwithmuhammad.com"],
    ["bgremove", "BG Remover", "https://bgremove.dealwithmuhammad.com"],
    ["qr", "QR Codes", "https://qr.dealwithmuhammad.com"],
    ["email", "Email Checker", "https://emailcheck.dealwithmuhammad.com"],
    ["ip", "My IP", "https://ip.dealwithmuhammad.com"],
    ["compressor", "Compressor", "https://compressor.dealwithmuhammad.com"],
    ["progress", "Progress", "https://progress.dealwithmuhammad.com"],
  ].map(([k, n, u]) => a(u, n, `${RAW}/app-${k}.webp`, "12.5%", n)),
  a("https://github.com/Deal-With-Muhammad?tab=overview", "My contributions", `${OUTPUT}/graph.svg`, "100%", "My GitHub contributions over the last year, animated"),
];
const readme = `<p>${rows.join("")}</p>

<sub>My previous GitHub account, @DealWithMuhammad, was deactivated before July 2025, so my older work isn't here.</sub>
`;
writeFileSync(`${outDir}/../README.md`, readme);


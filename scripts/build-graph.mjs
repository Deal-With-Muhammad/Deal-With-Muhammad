// Wraps the snake animation in the glass contributions tile and adds the real yearly total.
import { readFileSync, writeFileSync } from "node:fs";

const [, , snakePath, outPath] = process.argv;
const digits = JSON.parse(readFileSync("assets/digits.json"));
const plate = readFileSync("assets/graph-plate.webp").toString("base64");

async function totalContributions() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar { totalContributions } } } }`,
      variables: { login: process.env.GITHUB_REPOSITORY_OWNER },
    }),
  });
  const json = await res.json();
  return json?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions ?? null;
}

function drawNumber(text, right, baseline, size) {
  const em = size / digits.upem, tracking = -0.012 * size;
  const adv = (c) => digits.glyphs[c].adv * em + tracking;
  let x = right - [...text].reduce((w, c) => w + adv(c), -tracking);
  let out = "";
  for (const c of text) {
    out += `<path transform="translate(${x.toFixed(1)} ${baseline}) scale(${em.toFixed(5)} -${em.toFixed(5)})" d="${digits.glyphs[c].d}"/>`;
    x += adv(c);
  }
  return out;
}

const COLORS = ":root{--cb:#0000;--cs:#ffffff;--ce:#ffffff14;--c0:#ffffff14;--c1:#14703f;--c2:#1f9e56;--c3:#30d874;--c4:#6cf89d}.u{display:none}";
const snake = readFileSync(snakePath, "utf8")
  .replace(/:root\{[^}]*\}/, COLORS)
  .replace(/^<svg /, '<svg x="68" y="120" ')
  .replace(/ width="\d+" height="\d+"/, ' width="1664" height="363"');

const total = await totalContributions();
const number = total === null ? "" : `<g fill="#fff">${drawNumber(total.toLocaleString("en-US"), 1492, 112.6, 48)}</g>`;

writeFileSync(
  outPath,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 460" width="1800" height="460"><title>My GitHub contributions over the last year</title><image width="1800" height="460" href="data:image/webp;base64,${plate}"/>${number}${snake}</svg>`,
);
console.log("graph.svg written, total:", total);

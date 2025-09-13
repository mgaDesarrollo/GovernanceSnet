import removeMd from "remove-markdown";

export function markdownToBriefPreview(md: string, max = 180) {
  const txt = removeMd(md, {
    stripListLeaders: true,
    useImgAltText: true,
    gfm: true,
  })
    .replace(/\s+/g, " ")
    .trim();

  return txt.length > max ? txt.slice(0, max - 1) + "…" : txt;
}
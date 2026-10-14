import { createContext, useContext, useEffect, useMemo } from "react";
import { church as C, services as S, ministries as M, beliefs as B } from "./data.js";
import { useCollection } from "./api.js";

/* Everything staff can edit from the staff area ("Website text"). Each field has a built-in default (from data.js
   or the original wording), and a saved SiteSetting record with the same key overrides it. */
const text = (key, label, def, group, type = "text") => ({ key, label, def, group, type });

const mkFields = () => {
  const f = [
    text("church.name", "Church name", C.name, "Church info"),
    text("church.mission", "Mission line", C.mission, "Church info"),
    text("church.tagline", "Tagline", C.tagline, "Church info"),
    text("church.phone", "Phone", C.phone, "Church info"),
    text("church.email", "Email", C.email, "Church info"),
    text("church.office", "Office hours", C.office, "Church info"),
    text("church.address1", "Street address", C.address[0], "Church info"),
    text("church.address2", "City, state, zip", C.address[1], "Church info"),
    text("church.mapUrl", "Directions link (Google Maps)", C.mapUrl, "Church info", "url"),
    text("church.giveUrl", "Online giving link (Tithely)", C.giveUrl, "Church info", "url"),
    text("church.liveUrl", "Live stream link", C.liveUrl, "Church info", "url"),
    text("church.textWord", "Text-to-give word", C.textGive.word, "Church info"),
    text("church.textNumber", "Text-to-give number", C.textGive.number, "Church info"),
    text("church.topbar", "Top bar line", "Sundays 10 AM Bible Study · 11 AM Worship", "Homepage"),
    text("home.kicker", "Small heading above the title", "Montebello, California", "Homepage"),
    text("home.lead", "Welcome sentence under the title", `${C.tagline}. A Foursquare church family following Jesus together, and there's a seat for you.`, "Homepage", "longtext"),
    text("home.time", "Main service time shown in the card", "11:00 AM", "Homepage"),
    text("verse.text", "Bible verse (bottom of the homepage)", "Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need.", "Homepage", "longtext"),
    text("verse.ref", "Verse reference", "Hebrews 4:16", "Homepage"),
  ];
  S.forEach((s, i) => {
    f.push(text(`service.${i + 1}.time`, `Sunday service ${i + 1}: time`, s.time, "Sunday times"));
    f.push(text(`service.${i + 1}.name`, `Sunday service ${i + 1}: name`, s.name, "Sunday times"));
    f.push(text(`service.${i + 1}.note`, `Sunday service ${i + 1}: note`, s.note, "Sunday times"));
  });
  f.push(text("visit.when", "Plan a visit: When", "Adult Bible Study at 10 AM, Main Service at 11 AM.", "Plan a visit", "longtext"));
  f.push(text("visit.kids", "Plan a visit: Kids", "Nursery every Sunday. Littles & Middles for pre-K to 8th grade (except the first Sunday of the month). Safety is our top priority.", "Plan a visit", "longtext"));
  f.push(text("visit.online", "Plan a visit: Online", "Can't make it? Worship with us on the live stream.", "Plan a visit", "longtext"));
  f.push(text("about.welcome", "About page: Welcome paragraph", "We are Beverly Boulevard Foursquare Church, a community committed to following Jesus and sharing His love with everyone around us. Each Sunday we gather for fellowship, uplifting worship and practical, Bible-centered teaching that helps you live your faith every day.", "About", "longtext"));
  B.forEach((b, i) => f.push(text(`belief.${i + 1}`, `What we believe ${i + 1}`, b, "About", "longtext")));
  f.push(text("footer.note", "Footer note", "Beverly Boulevard is a local church of The Foursquare Church.", "Footer"));
  f.push(text("footer.sunday", "Footer: Sunday time", "Sundays 11:00 AM", "Footer"));
  M.forEach((m) => {
    const g = `Ministry: ${m.title}`, p = `min.${m.id}`;
    f.push(text(`${p}.title`, "Name", m.title, g));
    f.push(text(`${p}.tagline`, "Tagline", m.tagline, g));
    f.push(text(`${p}.blurb`, "Short description (homepage card)", m.blurb, g, "longtext"));
    f.push(text(`${p}.when`, "When (homepage card)", m.when, g));
    f.push(text(`${p}.scriptureText`, "Scripture", m.scripture.text, g, "longtext"));
    f.push(text(`${p}.scriptureRef`, "Scripture reference", m.scripture.ref, g));
    f.push(text(`${p}.about`, "Full description (blank line between paragraphs)", m.about.join("\n\n"), g, "longtext"));
    f.push(text(`${p}.schedule`, "Schedule (one per line, like: Where | Church Social Hall)", m.schedule.map(([k, v]) => `${k} | ${v}`).join("\n"), g, "longtext"));
    f.push(text(`${p}.newsTitle`, "Announcement headline (leave empty to hide)", m.news?.title || "", g));
    f.push(text(`${p}.newsNote`, "Announcement details", m.news?.note || "", g));
  });
  return f;
};
export const FIELDS = mkFields();
const DEFAULTS = Object.fromEntries(FIELDS.map((f) => [f.key, f.def]));

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const { items, reload } = useCollection("SiteSetting", [], "key", 500);
  useEffect(() => {
    window.addEventListener("site-settings-changed", reload);
    return () => window.removeEventListener("site-settings-changed", reload);
  }, [reload]);
  const value = useMemo(() => {
    const over = {};
    for (const r of items) if (r.key && typeof r.value === "string") over[r.key] = r.value;
    const t = (key) => (key in over && over[key] !== "" ? over[key] : DEFAULTS[key] ?? "");
    const tAllowEmpty = (key) => (key in over ? over[key] : DEFAULTS[key] ?? "");
    const church = {
      ...C,
      name: t("church.name"), mission: t("church.mission"), tagline: t("church.tagline"), phone: t("church.phone"),
      email: t("church.email"), office: t("church.office"), address: [t("church.address1"), t("church.address2")],
      mapUrl: t("church.mapUrl"), giveUrl: t("church.giveUrl"), liveUrl: t("church.liveUrl"),
      textGive: { word: t("church.textWord"), number: t("church.textNumber") },
    };
    const services = S.map((_, i) => ({ time: t(`service.${i + 1}.time`), name: t(`service.${i + 1}.name`), note: t(`service.${i + 1}.note`) }));
    const beliefs = B.map((_, i) => t(`belief.${i + 1}`));
    const ministries = M.map((m) => {
      const p = `min.${m.id}`;
      const news = tAllowEmpty(`${p}.newsTitle`);
      return {
        ...m,
        title: t(`${p}.title`), tagline: t(`${p}.tagline`), blurb: t(`${p}.blurb`), when: t(`${p}.when`),
        scripture: { text: t(`${p}.scriptureText`), ref: t(`${p}.scriptureRef`) },
        about: t(`${p}.about`).split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean),
        schedule: t(`${p}.schedule`).split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
          const i = l.indexOf("|");
          return i < 0 ? ["", l] : [l.slice(0, i).trim(), l.slice(i + 1).trim()];
        }),
        news: news ? { title: news, note: tAllowEmpty(`${p}.newsNote`) } : null,
      };
    });
    return { t, church, services, beliefs, ministries, overrides: over };
  }, [items]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSite = () => {
  const v = useContext(SiteContext);
  if (!v) throw new Error("useSite must be used inside <SiteProvider>");
  return v;
};

import { Fragment, useEffect, useState } from "react";
import {
  Menu, X, Sun, Moon, MapPin, Clock, Phone, Mail, Play, Heart, HandHeart, Users, Baby,
  BookOpen, Radio, Send, ArrowUpRight, MessageSquare,
} from "lucide-react";
import { church, services, sermons as sermonsFallback, events as eventsFallback, ministries, team as teamFallback, beliefs } from "./data.js";
import { useCollection, submit } from "./api.js";
import Admin from "./Admin.jsx";
import { Symbol, IconRow, Logo } from "./Brand.jsx";

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
const upcoming = (list) => list.filter((e) => e.date >= today()).sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));

const NAV = [
  ["home", "Home"], ["about", "About"], ["ministries", "Ministries"], ["events", "Events"],
  ["sermons", "Sermons"], ["contact", "Contact"],
];

const fmt = (iso, opts) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", opts);
const useRoute = () => {
  const get = () => location.hash.replace(/^#\/?/, "") || "home";
  const [r, setR] = useState(get);
  useEffect(() => {
    const on = () => { setR(get()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return r;
};
const Link = ({ to, className, children }) => <a className={className} href={`#/${to}`}>{children}</a>;

// The "four squares": Savior, Baptizer, Healer, Coming King
// The four symbols of the Foursquare: Savior (cross), Baptizer (dove), Healer (cup), Coming King (crown).
const sym = (name) => (p) => <Symbol name={name} size={p.size || 28} />;
const SQUARES = [
  { label: "Savior", icon: sym("cross"), cls: "sq-coral" },
  { label: "Baptizer", icon: sym("dove"), cls: "sq-yellow" },
  { label: "Healer", icon: sym("cup"), cls: "sq-blue" },
  { label: "Coming King", icon: sym("crown"), cls: "sq-ink" },
];
const Mark = () => <span className="mark" aria-hidden="true"><IconRow height={20} /></span>;

const useTheme = () => {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch { /* storage unavailable */ }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
};

function Header({ route }) {
  const [theme, toggle] = useTheme();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [route]);
  return (
    <header className="header">
      <div className="topbar">
        <div className="wrap topbar-in">
          <span><Clock size={14} /> Sundays 10 AM Bible Study · 11 AM Worship</span>
          <span className="tb-right">
            <a href={`tel:${church.phone}`}><Phone size={14} /> {church.phone}</a>
            <Link to="live"><Radio size={14} /> Watch live</Link>
          </span>
        </div>
      </div>
      <div className="wrap header-in">
        <Link to="home" className="brand"><span className="wm"><b>Beverly Blvd.</b><small>Foursquare Church</small></span><Mark /></Link>
        <nav className={`nav ${open ? "open" : ""}`}>
          {NAV.map(([id, label]) => <Link key={id} to={id} className={route === id ? "active" : ""}>{label}</Link>)}
          <Link to="visit" className="btn btn-line">Plan a visit</Link>
          <Link to="give" className="btn btn-ink">Give</Link>
        </nav>
        <div className="hdr-tools">
          <button className="theme-btn" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title="Light / dark mode">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
  );
}

function Countdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const la = new Date(new Date(now).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const target = new Date(la);
  target.setHours(11, 0, 0, 0);
  target.setDate(la.getDate() + ((7 - la.getDay()) % 7));
  if (target <= la) target.setDate(target.getDate() + 7);
  const d = Math.max(0, target - la);
  const parts = [["Days", Math.floor(d / 864e5)], ["Hours", Math.floor(d / 36e5) % 24], ["Min", Math.floor(d / 6e4) % 60], ["Sec", Math.floor(d / 1e3) % 60]];
  return (
    <div className="countdown">
      <span className="cd-label">Next service in</span>
      <div className="cd-nums">{parts.map(([l, n]) => <div key={l}><b>{String(n).padStart(2, "0")}</b><small>{l}</small></div>)}</div>
    </div>
  );
}

function Home() {
  const { items: sermons } = useCollection("Sermon", sermonsFallback);
  const { items: allEvents } = useCollection("Event", eventsFallback, "date");
  const events = upcoming(allEvents);
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="kicker">Montebello, California</p>
            <h1>Welcome <span className="circled"><em>home</em>
              <svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true"><path d="M20 70 C 10 25, 120 5, 215 14 C 290 22, 300 70, 235 98 C 160 125, 30 115, 18 72 C 14 55, 40 38, 80 30" /></svg>
            </span>.</h1>
            <p className="lead">{church.tagline}. A Foursquare church family following Jesus together, and there's a seat for you.</p>
            <div className="cta">
              <Link to="visit" className="btn btn-red">Plan your visit <ArrowUpRight size={18} /></Link>
              <Link to="live" className="btn btn-line"><Play size={16} /> Watch live</Link>
            </div>
          </div>
          <div className="hero-panel">
            <p className="kicker">Join us this Sunday</p>
            <div className="big-time">11:00 <span>AM</span></div>
            <p className="addr"><MapPin size={16} /> {church.address.join(", ")}</p>
            <Countdown />
            <a className="btn btn-red" href={church.mapUrl} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={18} /></a>
          </div>
        </div>
      </section>

      <section className="wrap bento">
        <div className="tile tile-big">
          <p className="kicker">This Sunday</p>
          <h2>Join us for worship</h2>
          <ul className="times">
            {services.map((s) => <li key={s.name}><b>{s.time}</b><span>{s.name}<small>{s.note}</small></span></li>)}
          </ul>
        </div>
        <a className="tile tile-live" href="#/live">
          <span className="live-badge"><i /> LIVE STREAM</span>
          <Play size={44} />
          <h3>Watch from anywhere</h3>
          <p>Sundays at 11 AM</p>
        </a>
        <a className="tile tile-map" href={church.mapUrl} target="_blank" rel="noreferrer">
          <MapPin />
          <h3>{church.address[0]}</h3>
          <p>{church.address[1]}</p>
          <span className="link">Get directions <ArrowUpRight size={16} /></span>
        </a>
        <a className="tile tile-prayer" href="#/prayer">
          <HandHeart size={30} />
          <h3>Need prayer?</h3>
          <p>We'd love to pray for you.</p>
          <span className="link">Send a request <ArrowUpRight size={16} /></span>
        </a>
      </section>
      <Divider kind="crown" />

      <section className="wrap section">
        <div className="sec-head"><h2>Latest messages</h2><Link to="sermons" className="link">All sermons <ArrowUpRight size={16} /></Link></div>
        <div className="scroller">
          {sermons.slice(0, 5).map((s, i) => <SermonCard key={s.id || s.title} s={s} i={i} />)}
        </div>
      </section>
      <Divider kind="sun" />

      <section className="wrap section">
        <div className="sec-head"><h2>What's on</h2><Link to="events" className="link">Full calendar <ArrowUpRight size={16} /></Link></div>
        <EventList items={events.slice(0, 5)} />
      </section>
      <Divider kind="sea" band />

      <section className="wrap section">
        <div className="sec-head"><h2>Find your place</h2><Link to="ministries" className="link">All ministries <ArrowUpRight size={16} /></Link></div>
        <div className="grid3"><MinistryTiles /></div>
      </section>
      <Divider kind="ember" />

      <section className="wrap section">
        <div className="verse-block">
          <p>"Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need."</p>
          <cite>Hebrews 4:16</cite>
        </div>
      </section>
    </>
  );
}

const COLORS = ["sq-coral", "sq-blue", "sq-yellow", "sq-ink", "sq-coral"];
function SermonCard({ s, i }) {
  return (
    <article className="sermon">
      <div className={`art ${COLORS[i % COLORS.length]}`}><Play size={28} /><b>{fmt(s.date, { day: "numeric" })}<span>{fmt(s.date, { month: "short" })}</span></b></div>
      <small>{fmt(s.date, { year: "numeric" })}{s.speaker && ` · ${s.speaker}`}</small>
      <h3>{s.title}</h3>
    </article>
  );
}

function EventList({ items }) {
  return (
    <div className="events">
      {items.map((e) => (
        <div className="ev" key={e.title + e.date}>
          <div className="ev-date"><b>{fmt(e.date, { day: "numeric" })}</b><span>{fmt(e.date, { month: "short" })}</span></div>
          <h3>{e.title}</h3>
          <small>{e.time} · {e.place}</small>
        </div>
      ))}
    </div>
  );
}

const GRAD = { children: "sun", men: "sky", ladies: "ember" };
const ICONS = { children: Baby, men: Users, ladies: Heart };
const MCOL = { children: "sq-yellow", men: "sq-blue", ladies: "sq-coral" };
function MinistryTiles() {
  return ministries.map((m) => {
    const I = ICONS[m.id];
    return (
      <div className={`mtile ${MCOL[m.id]}`} key={m.id}>
        <I size={32} />
        <h3>{m.title}</h3>
        <p>{m.blurb}</p>
        <small>{m.when}</small>
      </div>
    );
  });
}

// Gradient dividers use the official gradient pairs from the brand guide.
const Divider = ({ kind = "sun", band = false }) => <div className={`wrap divider ${band ? "band" : "line"} g-${kind}`} aria-hidden="true" />;

const PageHead = ({ title, sub, kicker }) => (
  <section className="wrap page-head">
    {kicker && <p className="kicker">{kicker}</p>}
    <h1>{title}<span className="accent">.</span></h1>
    {sub && <p className="lead">{sub}</p>}
  </section>
);

function About() {
  const { items: team } = useCollection("TeamMember", teamFallback, "sort_order", 50);
  return (
    <>
      <PageHead kicker="About us" title="A family of believers" sub={church.mission} />
      <section className="wrap section two">
        <div className="prose">
          <h2>Welcome</h2>
          <p>We are Beverly Boulevard Foursquare Church, a community committed to following Jesus and sharing His love with everyone around us. Each Sunday we gather for fellowship, uplifting worship and practical, Bible-centered teaching that helps you live your faith every day.</p>
          <p>Learn more about the <a href="https://www.foursquare.org/" target="_blank" rel="noreferrer">International Church of the Foursquare Gospel</a>.</p>
        </div>
        <div className="squares small">
          {SQUARES.map(({ label, icon: I, cls }) => <div className={`sq ${cls}`} key={label}><I size={24} /><span>{label}</span></div>)}
        </div>
      </section>
      <Divider kind="crown" />
      <section className="wrap section">
        <h2>What we believe</h2>
        <div className="grid2">{beliefs.map((b, i) => <div className="belief" key={b}><b>0{i + 1}</b><p>{b}</p></div>)}</div>
      </section>
      <Divider kind="sun" />
      <section className="wrap section">
        <h2>Meet our team</h2>
        <div className="grid3 team-grid">
          {team.map((p, i) => (
            <div className="person" key={p.name}>
              <div className={`avatar ${COLORS[i % COLORS.length]}`}>{p.name.split(" ").map((w) => w[0]).join("")}</div>
              <h3>{p.name}</h3><small>{p.role}</small>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Visit() {
  const items = [
    [Clock, "When", "Adult Bible Study at 10 AM, Main Service at 11 AM."],
    [MapPin, "Where", church.address.join(", ")],
    [Baby, "Kids", "Nursery every Sunday. Littles & Middles for pre-K to 8th grade (except the first Sunday of the month). Safety is our top priority."],
    [Radio, "Online", "Can't make it? Worship with us on the live stream."],
  ];
  return (
    <>
      <PageHead kicker="New here?" title="Plan your visit" sub="Everything you need to know before Sunday." />
      <section className="wrap section grid2">
        {items.map(([I, h, t]) => <div className="info-card" key={h}><I /><h3>{h}</h3><p>{t}</p></div>)}
      </section>
    </>
  );
}

function Ministries() {
  const { items } = useCollection("Event", eventsFallback, "date");
  const coming = upcoming(items);
  return (
    <>
      <PageHead kicker="Get involved" title="Ministries" sub="Find your place to belong and grow." />
      {ministries.map((m, idx) => {
        const I = ICONS[m.id];
        const list = coming.filter((e) => m.match.some((k) => e.title.toLowerCase().includes(k)));
        return (
          <Fragment key={m.id}>
          {idx > 0 && <Divider kind={GRAD[m.id]} />}
          <section className="wrap section ministry">
            <div className={`ministry-side ${MCOL[m.id]}`}>
              <I size={34} />
              <h2>{m.title}</h2>
              <p className="tagline">{m.tagline}</p>
              <p className="scripture">{/[\u201c"]/.test(m.scripture.text) ? m.scripture.text : `\u201c${m.scripture.text}\u201d`}</p>
              <cite>{m.scripture.ref}</cite>
            </div>
            <div className="ministry-body">
              {m.about.map((t) => <p key={t}>{t}</p>)}
              <dl className="schedule">
                {m.schedule.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              </dl>
              {m.news && <div className="callout"><b>{m.news.title}</b><span>{m.news.note}</span></div>}
              {list.length > 0 && (<><h3>Upcoming</h3><EventList items={list} /></>)}
            </div>
          </section>
          </Fragment>
        );
      })}
    </>
  );
}

function Events() {
  const { items } = useCollection("Event", eventsFallback, "date");
  const list = upcoming(items);
  return (
    <>
      <PageHead kicker="Calendar" title="Events" sub="Mark your calendar." />
      <section className="wrap section">{list.length ? <EventList items={list} /> : <p>No upcoming events right now. Check back soon!</p>}</section>
    </>
  );
}

function Sermons() {
  const { items: sermons } = useCollection("Sermon", sermonsFallback);
  const [q, setQ] = useState("");
  const list = sermons.filter((s) => (s.title + s.speaker + s.series).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead kicker="Messages" title="Sermons" sub="Catch up on recent messages." />
      <section className="wrap section">
        <input className="search" placeholder="Search by title, speaker or series" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="grid3">{list.map((s, i) => <SermonCard key={s.id || s.title} s={s} i={i} />)}</div>
        {!list.length && <p>No sermons match your search.</p>}
      </section>
    </>
  );
}

const Live = () => (
  <>
    <PageHead kicker="Sundays 11 AM Pacific" title="Watch live" />
    <section className="wrap section">
      <div className="player"><Play size={56} /><p>The live stream appears here during services.</p></div>
      <a className="btn btn-coral" href={church.liveUrl} target="_blank" rel="noreferrer">Open the live page <ArrowUpRight size={18} /></a>
    </section>
  </>
);

function FormPage({ kicker, title, sub, fields, button, entity }) {
  const [state, setState] = useState("idle");
  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setState("sending");
    try { await submit(entity, data); setState("sent"); }
    catch { setState("error"); }
  };
  return (
    <>
      <PageHead kicker={kicker} title={title} sub={sub} />
      <section className="wrap section narrow">
        {state === "sent" ? (
          <div className="info-card"><Send /><h3>Thank you!</h3><p>We received your message and will be in touch.</p></div>
        ) : (
          <form className="form" onSubmit={onSubmit}>
            {fields.map((f) => (
              <label key={f.name}>{f.label}
                {f.type === "textarea" ? <textarea name={f.name} rows={5} required={f.required} />
                  : f.type === "select" ? <select name={f.name}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
                  : <input name={f.name} type={f.type || "text"} required={f.required} />}
              </label>
            ))}
            <button className="btn btn-coral" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : button}</button>
            {state === "error" && <p className="form-error">Sorry, that didn't go through. Please try again, or call us at {church.phone}.</p>}
          </form>
        )}
      </section>
    </>
  );
}

const Contact = () => (
  <>
    <FormPage entity="ContactMessage" kicker="Say hello" title="Contact us" sub="We'd love to hear from you." button="Send message"
      fields={[{ name: "name", label: "Name", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }]} />
    <section className="wrap section grid3 info-row">
      <div><Phone /><b>{church.phone}</b></div>
      <div><Mail /><b>{church.email}</b></div>
      <div><MapPin /><b>{church.address.join(", ")}</b><small>Office: {church.office}</small></div>
    </section>
  </>
);

const Give = () => (
  <>
    <PageHead kicker="Generosity" title="Give" sub="Your generosity changes lives." />
    <section className="wrap section grid3">
      <div className="info-card"><Heart /><h3>Give online</h3><p>One-time or recurring gifts through our secure giving page.</p><a className="btn btn-coral" href={church.giveUrl} target="_blank" rel="noreferrer">Give now <ArrowUpRight size={18} /></a></div>
      <div className="info-card"><MessageSquare /><h3>Text to give</h3><p>Text <b>"{church.textGive.word}"</b> to <b>{church.textGive.number}</b>, then text an amount.</p></div>
      <div className="info-card"><BookOpen /><h3>Mobile app</h3><p>Download our church app to give and stay connected.</p></div>
    </section>
  </>
);

const Prayer = () => (
  <FormPage entity="PrayerRequest" kicker="We're listening" title="Prayer requests" sub="Are you in need of prayer? We would love to pray for you." button="Send request"
    fields={[{ name: "name", label: "Name (optional)" }, { name: "email", label: "Email (optional)", type: "email" },
      { name: "privacy", label: "Sharing", type: "select", options: ["Private. Pastors only", "OK to share with the congregation"] },
      { name: "request", label: "Your request", type: "textarea", required: true }]} />
);

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot-in">
        <div><Logo width={230} /><p className="foot-note">Beverly Boulevard is a local church of The Foursquare Church.</p><b>{church.name}</b><p>{church.mission}</p></div>
        <div><b>Visit</b><p>{church.address.join(", ")}<br />Sundays 11:00 AM</p></div>
        <div><b>Contact</b><p>{church.phone}<br />{church.email}<br />Office: {church.office}</p></div>
      </div>
      <div className="wrap huge">BB4S</div>
      <div className="wrap copy">© {new Date().getFullYear()} {church.name} · <a href="#/admin">Staff</a></div>
    </footer>
  );
}

const PAGES = { home: Home, about: About, visit: Visit, ministries: Ministries, events: Events, sermons: Sermons, live: Live, give: Give, contact: Contact, prayer: Prayer, admin: Admin };

export default function App() {
  const route = useRoute();
  const Page = PAGES[route] || Home;
  return (<><Header route={route} /><main><Page /></main><Footer /></>);
}

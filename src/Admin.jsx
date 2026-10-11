import { useCallback, useEffect, useState } from "react";
import { Trash2, Lock, LogOut, Check, Mail, Phone } from "lucide-react";
import { base44, currentUser } from "./api.js";

const SECTIONS = [
  { entity: "Sermon", label: "Sermons", sort: "-date", title: (r) => r.title, sub: (r) => [r.date, r.speaker, r.series].filter(Boolean).join(" · "),
    fields: [["title", "Title", "text", true], ["date", "Date", "date", true], ["speaker", "Speaker"], ["series", "Series"], ["scripture", "Scripture"], ["video_url", "Video link"], ["audio_url", "Audio link"]] },
  { entity: "Event", label: "Events", sort: "-date", title: (r) => r.title, sub: (r) => [r.date, r.time, r.place].filter(Boolean).join(" · "),
    fields: [["title", "Title", "text", true], ["date", "Date", "date", true], ["time", "Time (e.g. 11:00 AM)"], ["place", "Place"], ["description", "Details"]] },
  { entity: "TeamMember", label: "Team", sort: "sort_order", title: (r) => r.name, sub: (r) => r.role,
    fields: [["name", "Name", "text", true], ["role", "Role"], ["sort_order", "Order (1 = first)", "number"], ["photo_url", "Photo link"]] },
];


// Everything visitors send through the website lands here.
const QUEUES = [
  { entity: "PrayerRequest", label: "Prayer requests", empty: "No prayer requests yet.", doneLabel: "Mark as prayed",
    isNew: (r) => (r.status || "new") === "new", done: { status: "prayed" }, reopen: { status: "new" },
    title: (r) => r.request, meta: (r) => [r.name || "Anonymous", r.privacy] },
  { entity: "ContactMessage", label: "Messages", empty: "No messages yet.", doneLabel: "Mark as handled",
    isNew: (r) => !r.handled, done: { handled: true }, reopen: { handled: false },
    title: (r) => r.message, meta: (r) => [r.name] },
  { entity: "VisitorSignup", label: "Planning to visit", empty: "No visitor sign-ups yet.", doneLabel: "Mark as contacted",
    isNew: (r) => (r.status || "new") === "new", done: { status: "contacted" }, reopen: { status: "new" },
    title: (r) => `${r.name}${r.party_size ? ` (${r.party_size} coming)` : ""}${r.visit_date ? ` on ${r.visit_date}` : ""}`, meta: (r) => [r.notes] },
];

const when = (r) => (r.created_date ? new Date(r.created_date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "");

function Inbox({ onCount }) {
  const [data, setData] = useState({});
  const [err, setErr] = useState("");
  const [showDone, setShowDone] = useState(false);
  const load = useCallback(async () => {
    try {
      const out = {};
      for (const q of QUEUES) out[q.entity] = await base44.entities[q.entity].list("-created_date", 200);
      setData(out); setErr("");
      onCount?.(QUEUES.reduce((n, q) => n + (out[q.entity] || []).filter(q.isNew).length, 0));
    } catch (e) { setErr("Couldn't load the inbox. " + (e?.message || "")); }
  }, [onCount]);
  useEffect(() => { load(); }, [load]);

  const patch = async (q, r, changes) => {
    try { await base44.entities[q.entity].update(r.id, changes); await load(); }
    catch (e) { setErr("Couldn't save. " + (e?.message || "")); }
  };
  const remove = async (q, r) => {
    if (!window.confirm("Delete this item for good?")) return;
    try { await base44.entities[q.entity].delete(r.id); await load(); }
    catch (e) { setErr("Couldn't delete. " + (e?.message || "")); }
  };

  return (
    <div>
      <div className="inbox-top">
        <div className="stat-row">
          {QUEUES.map((q) => <div className="stat" key={q.entity}><b>{(data[q.entity] || []).filter(q.isNew).length}</b><span>New {q.label.toLowerCase()}</span></div>)}
        </div>
        <label className="check"><input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> Show finished items</label>
      </div>
      {err && <p className="form-error">{err}</p>}
      {QUEUES.map((q) => {
        const rows = (data[q.entity] || []).filter((r) => showDone || q.isNew(r));
        return (
          <section className="queue" key={q.entity}>
            <h3>{q.label}</h3>
            {!rows.length && <p className="muted">{showDone ? q.empty : "Nothing new. You're all caught up."}</p>}
            {rows.map((r) => (
              <article className={`inbox-item ${q.isNew(r) ? "is-new" : "is-done"}`} key={r.id}>
                <div>
                  <p className="inbox-title">{q.title(r)}</p>
                  <small>{[...q.meta(r), when(r)].filter(Boolean).join(" · ")}</small>
                  <div className="contact-links">
                    {r.email && <a href={`mailto:${r.email}`}><Mail size={14} /> {r.email}</a>}
                    {r.phone && <a href={`tel:${r.phone}`}><Phone size={14} /> {r.phone}</a>}
                  </div>
                </div>
                <div className="inbox-actions">
                  {q.isNew(r)
                    ? <button className="btn btn-red" onClick={() => patch(q, r, q.done)}><Check size={16} /> {q.doneLabel}</button>
                    : <button className="btn btn-line" onClick={() => patch(q, r, q.reopen)}>Reopen</button>}
                  <button className="icon-btn" aria-label="Delete" onClick={() => remove(q, r)}><Trash2 size={18} /></button>
                </div>
              </article>
            ))}
          </section>
        );
      })}
    </div>
  );
}

function Manager({ section }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try { setRows(await base44.entities[section.entity].list(section.sort, 200)); setErr(""); }
    catch (e) { setErr("Couldn't load. " + (e?.message || "")); }
  }, [section]);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {};
    for (const [k, , type] of section.fields) {
      const v = f.get(k);
      if (v !== "" && v != null) data[k] = type === "number" ? Number(v) : v;
    }
    setBusy(true);
    try { await base44.entities[section.entity].create(data); e.currentTarget.reset(); await load(); }
    catch (e2) { setErr("Couldn't save. " + (e2?.message || "")); }
    setBusy(false);
  };
  const remove = async (r) => {
    if (!window.confirm("Delete this item?")) return;
    try { await base44.entities[section.entity].delete(r.id); await load(); }
    catch (e) { setErr("Couldn't delete. " + (e?.message || "")); }
  };

  return (
    <div>
      {!section.readOnly && (
        <form className="form admin-form" onSubmit={add}>
          <h3>Add to {section.label.toLowerCase()}</h3>
          {section.fields.map(([k, label, type = "text", req]) => (
            <label key={k}>{label}<input name={k} type={type} required={!!req} /></label>
          ))}
          <button className="btn btn-red" disabled={busy}>{busy ? "Saving…" : "Add"}</button>
        </form>
      )}
      {err && <p className="form-error">{err}</p>}
      <div className="admin-list">
        {rows.map((r) => (
          <div className="admin-row" key={r.id}>
            <div><b>{section.title(r)}</b><small>{section.sub(r)}</small></div>
            <button className="icon-btn" aria-label="Delete" onClick={() => remove(r)}><Trash2 size={18} /></button>
          </div>
        ))}
        {!rows.length && !err && <p>Nothing here yet.</p>}
      </div>
    </div>
  );
}

export default function Admin() {
  const [user, setUser] = useState(undefined);
  const [tab, setTab] = useState(0);            // 0 = Inbox, then the content sections
  const [newCount, setNewCount] = useState(0);
  useEffect(() => { currentUser().then(setUser); }, []);

  if (user === undefined) return <section className="wrap section"><p>Loading…</p></section>;
  if (!user) {
    return (
      <section className="wrap section narrow">
        <div className="info-card"><Lock /><h3>Staff sign-in</h3><p>Sign in to add sermons and events and read prayer requests.</p>
          <button className="btn btn-red" onClick={() => base44.auth.redirectToLogin(window.location.href)}>Sign in</button></div>
      </section>
    );
  }
  if (user.role !== "admin") {
    return (
      <section className="wrap section narrow">
        <div className="info-card"><Lock /><h3>Not an admin</h3><p>{user.email} doesn't have staff access. Ask the site owner to make you an admin.</p>
          <button className="btn btn-line" onClick={() => base44.auth.logout(window.location.href)}>Sign out</button></div>
      </section>
    );
  }
  return (
    <>
      <section className="wrap page-head">
        <p className="kicker">Staff area</p>
        <h1>Manage <em>content</em></h1>
        <p className="lead">Signed in as {user.email}. <button className="link-btn" onClick={() => base44.auth.logout(window.location.href)}><LogOut size={14} /> Sign out</button></p>
      </section>
      <section className="wrap section">
        <div className="tabs">
          <button className={tab === 0 ? "on" : ""} onClick={() => setTab(0)}>Inbox{newCount > 0 && <span className="badge">{newCount}</span>}</button>
          {SECTIONS.map((s, i) => <button key={s.entity} className={i + 1 === tab ? "on" : ""} onClick={() => setTab(i + 1)}>{s.label}</button>)}
        </div>
        {tab === 0 ? <Inbox onCount={setNewCount} /> : <Manager key={SECTIONS[tab - 1].entity} section={SECTIONS[tab - 1]} />}
      </section>
    </>
  );
}

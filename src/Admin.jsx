import { useCallback, useEffect, useState } from "react";
import { Trash2, Lock, LogOut } from "lucide-react";
import { base44, currentUser } from "./api.js";

const SECTIONS = [
  { entity: "Sermon", label: "Sermons", sort: "-date", title: (r) => r.title, sub: (r) => [r.date, r.speaker, r.series].filter(Boolean).join(" · "),
    fields: [["title", "Title", "text", true], ["date", "Date", "date", true], ["speaker", "Speaker"], ["series", "Series"], ["scripture", "Scripture"], ["video_url", "Video link"], ["audio_url", "Audio link"]] },
  { entity: "Event", label: "Events", sort: "-date", title: (r) => r.title, sub: (r) => [r.date, r.time, r.place].filter(Boolean).join(" · "),
    fields: [["title", "Title", "text", true], ["date", "Date", "date", true], ["time", "Time (e.g. 11:00 AM)"], ["place", "Place"], ["description", "Details"]] },
  { entity: "TeamMember", label: "Team", sort: "sort_order", title: (r) => r.name, sub: (r) => r.role,
    fields: [["name", "Name", "text", true], ["role", "Role"], ["sort_order", "Order (1 = first)", "number"], ["photo_url", "Photo link"]] },
  { entity: "PrayerRequest", label: "Prayer requests", sort: "-created_date", readOnly: true, title: (r) => r.request, sub: (r) => [r.name, r.email, r.privacy].filter(Boolean).join(" · ") },
  { entity: "ContactMessage", label: "Messages", sort: "-created_date", readOnly: true, title: (r) => r.message, sub: (r) => [r.name, r.email].filter(Boolean).join(" · ") },
];

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
  const [tab, setTab] = useState(0);
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
        <div className="tabs">{SECTIONS.map((s, i) => <button key={s.entity} className={i === tab ? "on" : ""} onClick={() => setTab(i)}>{s.label}</button>)}</div>
        <Manager key={SECTIONS[tab].entity} section={SECTIONS[tab]} />
      </section>
    </>
  );
}

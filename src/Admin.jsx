import { useCallback, useEffect, useState } from "react";
import { Trash2, Lock, LogOut, Check, Mail, Phone } from "lucide-react";
import { base44, currentUser } from "./api.js";
import { FIELDS } from "./content.jsx";
import Messages from "./Messages.jsx";
import EmailStaff from "./EmailStaff.jsx";

const PEOPLE = { entity: "StaffMember", label: "Staff & volunteers", sort: "name", title: (r) => r.name, sub: (r) => [r.team_role, r.email, r.ministries].filter(Boolean).join(" · "),
  fields: [["name", "Name", "text", true], ["email", "Sign-in email", "email", true], ["team_role", "Role", "select", true, ["Volunteer", "Ministry leader", "Staff", "Pastor"]], ["ministries", "Ministries (optional)"]] };

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


// "Website text": staff edit what the site says. Saved values override the built-in defaults.
const GROUPS = [...new Set(FIELDS.map((f) => f.group))];

function SiteEditor() {
  const [records, setRecords] = useState([]);       // saved overrides
  const [draft, setDraft] = useState({});           // unsaved edits, key -> text
  const [saving, setSaving] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const load = useCallback(async () => {
    try { setRecords(await base44.entities.SiteSetting.list("key", 500)); setErr(""); }
    catch (e) { setErr("Couldn't load the saved text. " + (e?.message || "")); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const saved = Object.fromEntries(records.map((r) => [r.key, r]));
  const current = (f) => (saved[f.key] && saved[f.key].value !== "" ? saved[f.key].value : f.def);
  const shown = (f) => (f.key in draft ? draft[f.key] : current(f));

  const saveGroup = async (group) => {
    setSaving(group); setMsg(""); setErr("");
    try {
      for (const f of FIELDS.filter((x) => x.group === group && x.key in draft)) {
        const value = draft[f.key], rec = saved[f.key];
        if (value === f.def) { if (rec) await base44.entities.SiteSetting.delete(rec.id); }   // back to the built-in text
        else if (rec) await base44.entities.SiteSetting.update(rec.id, { value });
        else await base44.entities.SiteSetting.create({ key: f.key, value });
      }
      setDraft((d) => Object.fromEntries(Object.entries(d).filter(([k]) => !FIELDS.find((f) => f.key === k && f.group === group))));
      await load();
      window.dispatchEvent(new Event("site-settings-changed"));   // refresh the public pages right away
      setMsg(`Saved. The website now shows your changes (${group}).`);
    } catch (e) { setErr("Couldn't save. " + (e?.message || "")); }
    setSaving("");
  };

  return (
    <div className="site-editor">
      <p className="muted">Change what the website says. Edits appear on the live site as soon as you save. Clear a box and save to go back to the original wording.</p>
      {msg && <p className="ok-msg">{msg}</p>}
      {err && <p className="form-error">{err}</p>}
      {GROUPS.map((g, gi) => {
        const fields = FIELDS.filter((f) => f.group === g);
        const dirty = fields.some((f) => f.key in draft && draft[f.key] !== current(f));
        return (
          <details className="edit-group" key={g} open={gi === 0}>
            <summary>{g}{dirty && <span className="dirty">unsaved</span>}</summary>
            <div className="edit-fields">
              {fields.map((f) => (
                <label key={f.key}>{f.label}
                  {f.type === "longtext"
                    ? <textarea rows={Math.min(10, Math.max(3, Math.ceil(shown(f).length / 70) + shown(f).split("\n").length - 1))} value={shown(f)} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
                    : <input type={f.type === "url" ? "url" : "text"} value={shown(f)} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />}
                  {saved[f.key] && <small>Edited from the original. <button type="button" className="link-btn" onClick={() => setDraft({ ...draft, [f.key]: f.def })}>Use original wording</button></small>}
                </label>
              ))}
              <div className="edit-actions">
                <button className="btn btn-red" disabled={!dirty || saving === g} onClick={() => saveGroup(g)}>{saving === g ? "Saving…" : "Save changes"}</button>
                <a className="link" href="#/home" target="_blank" rel="noreferrer">View the website</a>
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}

function Manager({ section, onChanged }) {
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
    const form = e.currentTarget;          // keep a reference: it's gone once the save starts
    const f = new FormData(form);
    const data = {};
    for (const [k, , type] of section.fields) {
      const v = f.get(k);
      if (v !== "" && v != null) data[k] = type === "number" ? Number(v) : v;
    }
    setBusy(true);
    try { await base44.entities[section.entity].create(data); form.reset(); await load(); onChanged?.(); }
    catch (e2) { setErr("Couldn't save. " + (e2?.message || "")); }
    setBusy(false);
  };
  const remove = async (r) => {
    if (!window.confirm("Delete this item?")) return;
    try { await base44.entities[section.entity].delete(r.id); await load(); onChanged?.(); }
    catch (e) { setErr("Couldn't delete. " + (e?.message || "")); }
  };

  return (
    <div>
      {!section.readOnly && (
        <form className="form admin-form" onSubmit={add}>
          <h3>Add to {section.label.toLowerCase()}</h3>
          {section.fields.map(([k, label, type = "text", req, opts]) => (
            <label key={k}>{label}
              {type === "select" ? <select name={k} required={!!req}>{opts.map((o) => <option key={o}>{o}</option>)}</select> : <input name={k} type={type} required={!!req} />}
            </label>
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
  const [team, setTeam] = useState(null);           // staff & volunteers list (null = loading)
  const [tab, setTab] = useState("messages");
  const [newCount, setNewCount] = useState(0);
  const [unread, setUnread] = useState(0);
  useEffect(() => { currentUser().then(setUser); }, []);

  const loadTeam = useCallback(async () => {
    try { setTeam(await base44.entities.StaffMember.list("name", 500)); } catch { setTeam([]); }
  }, []);
  useEffect(() => { if (user) loadTeam(); }, [user, loadTeam]);

  // keep the "Everyone" channel in step with the staff list
  const syncEveryone = useCallback(async () => {
    try {
      const list = await base44.entities.StaffMember.list("name", 500);
      setTeam(list);
      const all = (await base44.entities.Conversation.list("-last_at", 100)).find((c) => c.kind === "all");
      if (!all) return;
      const members = [...new Set([user.email, ...list.map((t) => t.email)])];
      if (members.length !== all.members.length || members.some((m) => !all.members.includes(m))) await base44.entities.Conversation.update(all.id, { members });
    } catch { /* the list still updated */ }
  }, [user]);

  if (user === undefined || (user && team === null)) return <section className="wrap section"><p>Loading…</p></section>;
  if (!user) {
    return (
      <section className="wrap section narrow">
        <div className="info-card"><Lock /><h3>Staff sign-in</h3><p>Sign in with the email an admin added for you, to use team messages{" "}and, for admins, to manage the website.</p>
          <button className="btn btn-red" onClick={() => base44.auth.redirectToLogin(window.location.href)}>Sign in</button></div>
      </section>
    );
  }
  const isAdmin = user.role === "admin";
  const me = { ...user, ...(team.find((t) => t.email?.toLowerCase() === user.email?.toLowerCase()) || {}) };
  const onTeam = isAdmin || team.some((t) => t.email?.toLowerCase() === user.email?.toLowerCase());
  if (!onTeam) {
    return (
      <section className="wrap section narrow">
        <div className="info-card"><Lock /><h3>You're signed in, but not on the team list</h3><p>{user.email} hasn't been added yet. Ask an admin to add this email under "Staff & volunteers".</p>
          <button className="btn btn-line" onClick={() => base44.auth.logout(window.location.href)}>Sign out</button></div>
      </section>
    );
  }

  const tabs = isAdmin
    ? [
        { id: "inbox", label: "Inbox", badge: newCount },
        { id: "messages", label: "Messages", badge: unread },
        { id: "email", label: "Email" },
        { id: "site", label: "Website text" },
        { id: "people", label: "Staff & volunteers" },
        ...SECTIONS.map((x) => ({ id: x.entity, label: x.label === "Team" ? "Team page" : x.label })),
      ]
    : [{ id: "messages", label: "Messages", badge: unread }];
  const current = tabs.some((t) => t.id === tab) ? tab : "messages";

  return (
    <>
      <section className="wrap page-head">
        <p className="kicker">{isAdmin ? "Staff area" : "Team area"}</p>
        <h1>{isAdmin ? <>Staff <em>area</em></> : <>Team <em>messages</em></>}</h1>
        <p className="lead">Signed in as {user.email}. <button className="link-btn" onClick={() => base44.auth.logout(window.location.href)}><LogOut size={14} /> Sign out</button></p>
      </section>
      <section className="wrap section">
        <div className="tabs">
          {tabs.map((t) => <button key={t.id} className={t.id === current ? "on" : ""} onClick={() => setTab(t.id)}>{t.label}{t.badge > 0 && <span className="badge">{t.badge}</span>}</button>)}
        </div>
        {isAdmin && <div hidden={current !== "inbox"}><Inbox onCount={setNewCount} /></div>}
        {isAdmin && current === "site" && <SiteEditor />}
        {isAdmin && current === "email" && <EmailStaff me={me} team={team} />}
        {isAdmin && current === "people" && <Manager key="people" section={PEOPLE} onChanged={syncEveryone} />}
        {isAdmin && SECTIONS.map((x) => current === x.entity && <Manager key={x.entity} section={x} />)}
        <div hidden={current !== "messages"}><Messages me={me} team={team.filter((t) => t.email)} isAdmin={isAdmin} onUnread={setUnread} /></div>
      </section>
    </>
  );
}

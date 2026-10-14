import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, Plus, Users, User as UserIcon, Megaphone, X } from "lucide-react";
import { base44, sendEmail } from "./api.js";

// Team chat for staff and volunteers: direct messages, groups, and an everyone channel with announcements.
const POLL_MS = 5000;
const when = (iso) => (iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "");
const link = () => `${window.location.origin}${window.location.pathname}#/admin`;

export default function Messages({ me, team, isAdmin, onUnread }) {
  const [convs, setConvs] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [text, setText] = useState("");
  const [announce, setAnnounce] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pick, setPick] = useState([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const bottom = useRef(null);

  const nameOf = useMemo(() => {
    const m = Object.fromEntries(team.map((t) => [t.email?.toLowerCase(), t.name]));
    return (email) => m[email?.toLowerCase()] || email;
  }, [team]);

  const load = useCallback(async () => {
    try {
      const [c, m, r] = await Promise.all([
        base44.entities.Conversation.list("-last_at", 100),
        base44.entities.ChatMessage.list("-created_date", 500),
        base44.entities.ReadReceipt.list("-updated_date", 200),
      ]);
      setConvs(c); setMsgs(m); setReceipts(r); setErr("");
    } catch (e) { setErr("Couldn't load messages. " + (e?.message || "")); }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, POLL_MS); return () => clearInterval(t); }, [load]);

  const receiptFor = (id) => receipts.find((r) => r.conversation_id === id);
  const unreadIn = useCallback((id) => {
    const last = receipts.find((r) => r.conversation_id === id)?.last_read || "";
    return msgs.filter((m) => m.conversation_id === id && m.sender_email?.toLowerCase() !== me.email.toLowerCase() && (m.created_date || "") > last).length;
  }, [msgs, receipts, me.email]);
  const totalUnread = convs.reduce((n, c) => n + (c.id === activeId ? 0 : unreadIn(c.id)), 0);
  useEffect(() => { onUnread?.(totalUnread); }, [totalUnread, onUnread]);

  const active = convs.find((c) => c.id === activeId);
  const thread = useMemo(() => msgs.filter((m) => m.conversation_id === activeId).sort((a, b) => (a.created_date || "").localeCompare(b.created_date || "")), [msgs, activeId]);
  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [thread.length, activeId]);

  // opening a conversation marks it read
  useEffect(() => {
    if (!active || !thread.length) return;
    const latest = thread[thread.length - 1].created_date;
    const rec = receiptFor(active.id);
    if (rec && rec.last_read >= latest) return;
    (async () => {
      try {
        if (rec) await base44.entities.ReadReceipt.update(rec.id, { last_read: latest });
        else await base44.entities.ReadReceipt.create({ conversation_id: active.id, user_email: me.email, last_read: latest });
        load();
      } catch { /* try again next poll */ }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, thread.length]);

  const label = (c) => c.kind === "direct"
    ? nameOf(c.members.find((e) => e.toLowerCase() !== me.email.toLowerCase()) || me.email)
    : c.title || "Group";

  const startConversation = async () => {
    if (!pick.length && !isAdmin) return;
    const others = pick.map((e) => e.toLowerCase());
    const members = [me.email, ...pick];
    if (others.length === 1) {   // reuse an existing direct message
      const found = convs.find((c) => c.kind === "direct" && c.members.length === 2 && c.members.some((e) => e.toLowerCase() === others[0]));
      if (found) { setActiveId(found.id); setCreating(false); setPick([]); return; }
    }
    try {
      const c = await base44.entities.Conversation.create({
        title: others.length === 1 ? "" : title || "New group", kind: others.length === 1 ? "direct" : "group", members, last_at: new Date().toISOString(),
      });
      await load(); setActiveId(c.id); setCreating(false); setPick([]); setTitle("");
    } catch (e) { setErr("Couldn't start the conversation. " + (e?.message || "")); }
  };

  const createEveryone = async () => {
    try {
      const members = [...new Set([me.email, ...team.map((t) => t.email)])];
      const c = await base44.entities.Conversation.create({ title: "Everyone", kind: "all", members, last_at: new Date().toISOString() });
      await load(); setActiveId(c.id);
    } catch (e) { setErr("Couldn't create the Everyone channel. " + (e?.message || "")); }
  };

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !active) return;
    setText(""); setNote("");
    try {
      await base44.entities.ChatMessage.create({
        conversation_id: active.id, members: active.members, sender_email: me.email,
        sender_name: me.full_name || nameOf(me.email), body, announcement: announce,
      });
      await base44.entities.Conversation.update(active.id, { last_message: body.slice(0, 120), last_at: new Date().toISOString() });
      load();
      // email people: always for announcements, and for direct messages
      if (announce || active.kind === "direct") {
        const wants = active.members.filter((m) => m.toLowerCase() !== me.email.toLowerCase())
          .filter((m) => team.find((t) => t.email?.toLowerCase() === m.toLowerCase())?.email_alerts !== false || announce);
        const subject = announce ? `Announcement from ${me.full_name || nameOf(me.email)}` : `New message from ${me.full_name || nameOf(me.email)}`;
        const mail = `${body}\n\n— ${me.full_name || nameOf(me.email)}\n\nReply in the staff area: ${link()}`;
        const results = await Promise.allSettled(wants.map((to) => sendEmail({ to, subject, body: mail })));
        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed) setNote(`Sent, but ${failed} email${failed > 1 ? "s" : ""} didn't go out. They'll still see it here.`);
      }
      setAnnounce(false);
    } catch (e2) { setErr("Couldn't send. " + (e2?.message || "")); setText(body); }
  };

  const others = team.filter((t) => t.email?.toLowerCase() !== me.email.toLowerCase());
  const hasEveryone = convs.some((c) => c.kind === "all");

  return (
    <div className="chat">
      <aside className="chat-list">
        <button className="btn btn-red" onClick={() => { setCreating(true); setActiveId(null); }}><Plus size={16} /> New message</button>
        {isAdmin && !hasEveryone && <button className="btn btn-line" onClick={createEveryone}><Megaphone size={16} /> Create "Everyone" channel</button>}
        {convs.map((c) => (
          <button key={c.id} className={`chat-item ${c.id === activeId ? "on" : ""}`} onClick={() => { setActiveId(c.id); setCreating(false); }}>
            <span className="chat-ic">{c.kind === "direct" ? <UserIcon size={16} /> : c.kind === "all" ? <Megaphone size={16} /> : <Users size={16} />}</span>
            <span className="chat-meta"><b>{label(c)}</b><small>{c.last_message || "No messages yet"}</small></span>
            {c.id !== activeId && unreadIn(c.id) > 0 && <span className="badge">{unreadIn(c.id)}</span>}
          </button>
        ))}
        {!convs.length && <p className="muted">No conversations yet. Start one with "New message".</p>}
      </aside>

      <section className="chat-main">
        {err && <p className="form-error">{err}</p>}
        {creating && (
          <div className="chat-new">
            <div className="chat-new-head"><h3>New message</h3><button className="icon-btn" aria-label="Cancel" onClick={() => setCreating(false)}><X size={18} /></button></div>
            <p className="muted">Pick one person for a direct message, or several for a group.</p>
            <div className="chat-people">
              {others.map((t) => (
                <label key={t.id || t.email} className="check">
                  <input type="checkbox" checked={pick.includes(t.email)} onChange={(e) => setPick(e.target.checked ? [...pick, t.email] : pick.filter((x) => x !== t.email))} />
                  {t.name} <small>{t.team_role}</small>
                </label>
              ))}
              {!others.length && <p className="muted">No one else is on the team list yet. An admin adds people under "Staff & volunteers".</p>}
            </div>
            {pick.length > 1 && <label className="field">Group name<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sunday greeters" /></label>}
            <button className="btn btn-red" disabled={!pick.length} onClick={startConversation}>Start</button>
          </div>
        )}
        {!creating && !active && <div className="chat-empty"><Send size={30} /><p>Choose a conversation, or start a new one.</p></div>}
        {active && (
          <>
            <header className="chat-head"><h3>{label(active)}</h3><small>{active.kind === "direct" ? "Direct message" : `${active.members.length} people`}</small></header>
            <div className="chat-thread">
              {thread.map((m) => {
                const mine = m.sender_email?.toLowerCase() === me.email.toLowerCase();
                return (
                  <div key={m.id} className={`bubble ${mine ? "mine" : ""} ${m.announcement ? "ann" : ""}`}>
                    <small>{m.announcement && <Megaphone size={12} />} {mine ? "You" : m.sender_name || nameOf(m.sender_email)} · {when(m.created_date)}</small>
                    <p>{m.body}</p>
                  </div>
                );
              })}
              {!thread.length && <p className="muted">No messages yet. Say hello!</p>}
              <div ref={bottom} />
            </div>
            {note && <p className="muted">{note}</p>}
            <form className="chat-compose" onSubmit={send}>
              <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e); } }} />
              <div className="chat-actions">
                {(isAdmin || active.kind !== "direct") && (
                  <label className="check"><input type="checkbox" checked={announce} onChange={(e) => setAnnounce(e.target.checked)} /> Announcement (also emails everyone here)</label>
                )}
                <button className="btn btn-red" type="submit" disabled={!text.trim()}><Send size={16} /> Send</button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

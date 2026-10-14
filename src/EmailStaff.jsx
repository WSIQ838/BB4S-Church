import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { sendEmail } from "./api.js";

const GROUPS = ["Pastor", "Staff", "Ministry leader", "Volunteer"];

// Staff compose an email to one person, a role group, or everyone on the team.
export default function EmailStaff({ me, team }) {
  const [groups, setGroups] = useState([]);
  const [people, setPeople] = useState([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [state, setState] = useState("idle");
  const [result, setResult] = useState("");

  const recipients = useMemo(() => {
    const set = new Set(people.map((e) => e.toLowerCase()));
    for (const t of team) if (groups.includes("Everyone") || groups.includes(t.team_role)) set.add(t.email.toLowerCase());
    return [...set].filter(Boolean);
  }, [groups, people, team]);

  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const send = async (e) => {
    e.preventDefault();
    if (!recipients.length) return;
    setState("sending"); setResult("");
    const text = `${body}\n\n— ${me.full_name || me.email}\nBeverly Boulevard Foursquare Church`;
    const out = await Promise.allSettled(recipients.map((to) => sendEmail({ to, subject, body: text })));
    const ok = out.filter((r) => r.status === "fulfilled").length;
    setState(ok === out.length ? "done" : "partial");
    setResult(`${ok} of ${out.length} emails sent.${ok < out.length ? " Some didn't go out. Check the addresses and try again." : ""}`);
    if (ok === out.length) { setSubject(""); setBody(""); }
  };

  return (
    <form className="form email-form" onSubmit={send}>
      <p className="muted">Emails go out one by one from the church's no-reply address, so nobody sees anyone else's address. Replies don't come back here.</p>
      <fieldset><legend>Send to</legend>
        <label className="check"><input type="checkbox" checked={groups.includes("Everyone")} onChange={() => toggle(groups, setGroups, "Everyone")} /> Everyone on the team</label>
        {GROUPS.map((g) => (
          <label className="check" key={g}><input type="checkbox" checked={groups.includes(g)} onChange={() => toggle(groups, setGroups, g)} /> All {g.toLowerCase()}s</label>
        ))}
        <details><summary>Or choose people</summary>
          {team.map((t) => (
            <label className="check" key={t.email}><input type="checkbox" checked={people.includes(t.email)} onChange={() => toggle(people, setPeople, t.email)} /> {t.name} <small>{t.team_role}</small></label>
          ))}
        </details>
      </fieldset>
      <label>Subject<input value={subject} onChange={(e) => setSubject(e.target.value)} required /></label>
      <label>Message<textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} required /></label>
      <div className="chat-actions">
        <small>{recipients.length ? `Will be sent to ${recipients.length} ${recipients.length === 1 ? "person" : "people"}.` : "Choose who to send it to."}</small>
        <button className="btn btn-red" disabled={!recipients.length || state === "sending"}><Send size={16} /> {state === "sending" ? "Sending…" : "Send email"}</button>
      </div>
      {result && <p className={state === "done" ? "ok-msg" : "form-error"}>{result}</p>}
    </form>
  );
}

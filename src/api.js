import { useCallback, useEffect, useState } from "react";
import { createClient } from "@base44/sdk";

// Base44 app that stores the church's sermons, events, team, prayer requests and messages.
export const APP_ID = "6acc071ecc184f151157af6d";
export const base44 = createClient({ appId: APP_ID, requiresAuth: false });

/**
 * Load a list from Base44. Until the data exists (or if Base44 can't be reached),
 * the built-in content from data.js is shown so the site never looks empty.
 */
export function useCollection(entity, fallback, sort = "-date", limit = 200) {
  const [items, setItems] = useState(fallback);
  const [live, setLive] = useState(false);
  const reload = useCallback(async () => {
    try {
      const rows = await base44.entities[entity].list(sort, limit);
      const shown = (rows || []).filter((r) => r.published !== false);
      if (shown.length) { setItems(shown); setLive(true); }
    } catch {
      /* keep fallback content */
    }
  }, [entity, sort, limit]);
  useEffect(() => { reload(); }, [reload]);
  return { items, live, reload };
}

export const submit = (entity, data) => base44.entities[entity].create(data);

export async function currentUser() {
  try { return await base44.auth.me(); } catch { return null; }
}

// ==========================================
// MODULE 1: DATABASE ADAPTER & OFFLINE CACHE
// ==========================================
const QAREN_CONFIG = {
  // Paste your deployed Google Apps Script Web App URL (/exec) below
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbzbNqv6SvzmWBRiYmOqLSFDL9ZCwAX855isGxa-M7qXlbRkIeA2NBcCYVRbTBnUvQTsRg/exec",
  cachePrefix: "qaren_lb_cache_v1_"
};

window.QarenDB = {
  async fetchTable(tableName) {
    const cacheKey = QAREN_CONFIG.cachePrefix + tableName;
    try {
      const url = `${QAREN_CONFIG.appsScriptUrl}?table=${encodeURIComponent(tableName)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.data)) {
        localStorage.setItem(cacheKey, JSON.stringify({ updatedAt: Date.now(), rows: json.data }));
        this.setSyncBadge("Live Synced", "bg-emerald-100 text-emerald-800");
        return json.data;
      }
      throw new Error(json.message || "Unexpected API response");
    } catch (err) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        this.setSyncBadge("Offline Cache", "bg-amber-100 text-amber-800");
        return JSON.parse(cached).rows || [];
      }
      this.setSyncBadge("Offline (No Cache)", "bg-rose-100 text-rose-800");
      return [];
    }
  },

  async upsertRow(tableName, idField, idValue, rowData) {
    const payload = {
      action: "upsert",
      table: tableName,
      idField,
      idValue,
      rowData
    };
    await fetch(QAREN_CONFIG.appsScriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  },

  setSyncBadge(text, classes) {
    const el = document.getElementById("sync-status");
    if (!el) return;
    el.textContent = text;
    el.className = `text-xs px-3 py-1 rounded-full font-medium ${classes}`;
  }
};

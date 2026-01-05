/**
 * topic-page-loader.js
 * Loads /data/topics.json and auto-fills topic pages based on:
 *  - year folder name: /year7/, /year8/, /year9/
 *  - topic filename slug: e.g. developing-vector-graphics.html -> "developing-vector-graphics"
 *
 * Expected placeholders in HTML:
 *  [data-topic-kicker]
 *  [data-topic-title]
 *  [data-topic-intro]
 *  [data-topic-tags]
 *  [data-topic-keywords]
 *  [data-learning-goals]  (ul/ol)
 *  [data-mastery]         (ul/ol)
 *  [data-lessons-grid]    (section/div for weekly lesson cards)
 */

async function loadTopicsJson() {
  // Topic pages live in /yearX/ so we go up one level to /data/
  const res = await fetch("../data/topics.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Could not load ../data/topics.json (HTTP ${res.status})`);
  }
  return await res.json();
}

function pill(text, withDot = false) {
  const safe = escapeHtml(text);
  return `
    <span class="pill">
      ${withDot ? '<span class="dot"></span>' : ""}
      ${safe}
    </span>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el && typeof text === "string") el.textContent = text;
}

function setHTML(selector, html) {
  const el = document.querySelector(selector);
  if (el && typeof html === "string") el.innerHTML = html;
}

function setList(selector, items) {
  const el = document.querySelector(selector);
  if (!el) return;

  if (!Array.isArray(items) || items.length === 0) {
    el.innerHTML = "<li>Coming soon.</li>";
    return;
  }

  el.innerHTML = items.map(x => `<li>${escapeHtml(x)}</li>`).join("");
}

function renderLessons(lessons) {
  const grid = document.querySelector("[data-lessons-grid]");
  if (!grid) return;

  if (!Array.isArray(lessons) || lessons.length === 0) {
    grid.innerHTML = `
      <div class="card">
        <h3>Lessons</h3>
        <p>No lesson breakdown added yet.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = lessons.map(l => {
    const week = l.week ?? "";
    const title = escapeHtml(l.title ?? "");
    const outcome = escapeHtml(l.outcome ?? "");
    const url = l.sourceUrl ? String(l.sourceUrl) : null;

    return `
      <div class="card">
        <h3>Week ${escapeHtml(week)}: ${title}</h3>
        <p>${outcome}</p>
        <div class="meta">
          ${url ? `<span class="pill"><span class="dot"></span><a href="${escapeHtml(url)}" target="_blank" rel="noopener">Oak lesson</a></span>` : ""}
          <span class="pill">Lesson outcome</span>
        </div>
      </div>
    `;
  }).join("");
}

(async () => {
  try {
    const data = await loadTopicsJson();

    // Determine year folder and topic slug from URL
    const parts = window.location.pathname.split("/").filter(Boolean);
    const yearId = parts.find(p => p.startsWith("year"));
    const file = parts[parts.length - 1] || "";
    const slug = file.replace(/\.html?$/i, "");

    if (!yearId || !slug) return;

    const yearData = (data.years || []).find(y => y.id === yearId);
    if (!yearData) return;

    const topic = (yearData.topics || []).find(t => t.slug === slug);
    if (!topic) return;

    // Update document title
    document.title = `${yearData.label} • ${topic.title}`;

    // Hero content
    setText("[data-topic-kicker]", `${yearData.label} • Topic`);
    setText("[data-topic-title]", topic.title);
    setText("[data-topic-intro]", topic.intro || topic.summary || "");

    // Tags (chips)
    if (Array.isArray(topic.tags) && topic.tags.length) {
      const tagsHtml = topic.tags.map((t, i) => pill(t, i === 0)).join(" ");
      setHTML("[data-topic-tags]", tagsHtml);
    } else {
      setHTML("[data-topic-tags]", "");
    }

    // Keywords (chips)
    if (Array.isArray(topic.keywords) && topic.keywords.length) {
      const kwHtml = topic.keywords.map((k, i) => pill(k, i === 0)).join(" ");
      setHTML("[data-topic-keywords]", kwHtml);
    } else {
      setHTML("[data-topic-keywords]", pill("Coming soon", true));
    }

    // Lists
    setList("[data-learning-goals]", topic.learningGoals);
    setList("[data-mastery]", topic.mastery);

    // Weekly breakdown
    renderLessons(topic.lessons);

  } catch (err) {
    console.error("Topic page load failed:", err);

    // Optional: show a visible hint on the page (only if a container exists)
    const grid = document.querySelector("[data-lessons-grid]");
    if (grid) {
      grid.innerHTML = `
        <div class="card">
          <h3>Couldn’t load topic data</h3>
          <p>Check that you are running the site from a web server and that <code>../data/topics.json</code> exists.</p>
        </div>
      `;
    }
  }
})();

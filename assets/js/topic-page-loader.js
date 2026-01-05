async function loadTopicsJson() {
  const res = await fetch("../data/topics.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load ../data/topics.json");
  return await res.json();
}

function pill(text, withDot = false) {
  return `
    <span class="pill">
      ${withDot ? '<span class="dot"></span>' : ""}
      ${text}
    </span>
  `;
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
  el.innerHTML = items.map(x => `<li>${x}</li>`).join("");
}

(async () => {
  try {
    const data = await loadTopicsJson();

    const parts = window.location.pathname.split("/").filter(Boolean);
    const yearId = parts.find(p => p.startsWith("year"));
    const file = parts[parts.length - 1] || "";
    const slug = file.replace(/\.html?$/i, "");

    if (!yearId || !slug) return;

    const yearData = data.years.find(y => y.id === yearId);
    if (!yearData) return;

    const topic = (yearData.topics || []).find(t => t.slug === slug);
    if (!topic) return;

    // Page <title>
    document.title = `${yearData.label} • ${topic.title}`;

    // Hero bits
    setText("[data-topic-kicker]", `${yearData.label} • Topic`);
    setText("[data-topic-title]", topic.title);
    setText("[data-topic-intro]", topic.intro || topic.summary || "");

    // Chips / tags
    if (Array.isArray(topic.tags)) {
      const tagsHtml = topic.tags.map((t, i) => pill(t, i === 0)).join(" ");
      setHTML("[data-topic-tags]", tagsHtml);
    }

    // Keywords chips
    if (Array.isArray(topic.keywords)) {
      const kwHtml = topic.keywords.map((k, i) => pill(k, i === 0)).join(" ");
      setHTML("[data-topic-keywords]", kwHtml);
    }

    // Lists
    setList("[data-learning-goals]", topic.learningGoals);
    setList("[data-mastery]", topic.mastery);

  } catch (err) {
    console.error(err);
  }
})();

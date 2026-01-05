async function loadTopics() {
  const res = await fetch("../data/topics.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load topics.json");
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

function renderYearPage(yearData) {
  // Optional bits (if you add these placeholders to your HTML)
  const kickerEl = document.querySelector("[data-year-kicker]");
  const titleEl = document.querySelector("[data-year-title]");
  const overviewEl = document.querySelector("[data-year-overview]");

  if (kickerEl) kickerEl.textContent = yearData.kicker || yearData.label;
  if (titleEl) titleEl.textContent = `${yearData.label} topics`;
  if (overviewEl) overviewEl.textContent = yearData.overview || "";

  const grid = document.querySelector("[data-topic-grid]");
  if (!grid) return;

  grid.innerHTML = yearData.topics.map(t => {
    const href = `${t.slug}.html`;
    const tags = (t.tags || []).slice(0, 4).map((x, i) => pill(x, i === 0)).join(" ");
    return `
      <a class="card" href="${href}">
        <h3>${t.title}</h3>
        <p>${t.summary || ""}</p>
        <div class="meta">
          ${tags}
        </div>
      </a>
    `;
  }).join("");
}

(async () => {
  try {
    const data = await loadTopics();

    // Figure out which year we’re on from the folder name: /year7/, /year8/, /year9/
    const parts = window.location.pathname.split("/").filter(Boolean);
    const yearId = parts.find(p => p.startsWith("year"));

    if (!yearId) return;

    const yearData = data.years.find(y => y.id === yearId);
    if (!yearData) return;

    renderYearPage(yearData);
  } catch (err) {
    console.error(err);
  }
})();

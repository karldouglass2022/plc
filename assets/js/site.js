(() => {
  const path = window.location.pathname.replace(/\/+$/, "");
  document.querySelectorAll(".nav a").forEach(a => {
    const href = a.getAttribute("href");
    if (!href) return;

    const normHref = href.replace(/\/+$/, "");
    if (path.endsWith(normHref) || path.endsWith(normHref + "/index.html")) {
      a.classList.add("active");
    }
  });
})();

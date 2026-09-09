import Script from "next/script";

// Runs before hydration to avoid a flash of the wrong theme. Reads the
// SAME "sprout-theme" localStorage key the landing page writes — same
// origin via the /app rewrite, so a theme choice made on either side
// carries straight over. Mirrors site/index.html's inline theme script
// 1:1: default is always light, dark only once someone opts in.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem('sprout-theme');
    document.documentElement.dataset.theme = (saved === 'dark') ? 'dark' : 'light';
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
`;

export function ThemeInit() {
  return (
    <Script id="theme-init" strategy="beforeInteractive">
      {THEME_INIT_SCRIPT}
    </Script>
  );
}

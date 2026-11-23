// Собирает демо-версию для показа клиенту в ОДИН html-файл (без сервера).
// Запуск: node scripts/build-demo.mjs  →  demo-dist/avtonyanya-demo.html
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('demo-dist/.web');
fs.rmSync(out, { recursive: true, force: true });
execSync(`npx expo export --platform web --clear --output-dir "${out}"`, {
  stdio: 'inherit',
  env: { ...process.env, EXPO_PUBLIC_DEMO: '1' },
});

const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
let js = scripts.map((src) => fs.readFileSync(path.join(out, src), 'utf8')).join('\n;\n');

// Картинки (иконки навигации) встраиваем прямо в код как data:-ссылки.
js = js.replace(/"\/assets\/[^"]+?\.png"/g, (m) => {
  const file = path.join(out, m.slice(2, -1));
  if (!fs.existsSync(file)) return m;
  return JSON.stringify('data:image/png;base64,' + fs.readFileSync(file).toString('base64'));
});
js = js.replace(/<\/script/gi, '<\\/script');

const page = `<title>Автоняня Москва</title>
<meta name="description" content="Демо-версия приложения Автоняня (Москва)">
<style>
  html, body { height: 100%; margin: 0; background: #F1E6E1; }
  body { overflow: hidden; }
  #root { display: flex; height: 100%; flex: 1; }
</style>
<script>
  // Роутер приложения ожидает адрес "/". При показе по ссылке страница может
  // открываться по другому пути — приводим его к "/".
  try { if (location.pathname !== '/') history.replaceState(null, '', '/'); } catch (e) {}
</script>
<div id="root"></div>
<script>
${js}
</script>
`;
fs.mkdirSync('demo-dist', { recursive: true });
fs.writeFileSync('demo-dist/avtonyanya-demo.html', page);
fs.rmSync(out, { recursive: true, force: true });
console.log('Готово: demo-dist/avtonyanya-demo.html', (page.length / 1024 / 1024).toFixed(2), 'MB');

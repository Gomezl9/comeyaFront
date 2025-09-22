const path = require('path');
const fs = require('fs');

async function run() {
  const tests = [
    'dashboard-test.js',
    'registrarse-test.js',
    'reservas-test.js',
    'map-test.js',
    'donaciones-alimentos-test.js',
  ];

  if (process.argv.includes('--headless')) {
    process.env.HEADLESS = '1';
  }

  const results = [];
  const startedAt = new Date();
  for (const testFile of tests) {
    const abs = path.join(__dirname, testFile);
    console.log(`\n=== Ejecutando: ${testFile} ===`);
    const testStart = Date.now();
    try {
      await require(abs)();
      const durationMs = Date.now() - testStart;
      console.log(`✔ ${testFile} OK (${durationMs} ms)`);
      results.push({ file: testFile, status: 'passed', durationMs });
    } catch (err) {
      const durationMs = Date.now() - testStart;
      console.error(`✖ ${testFile} FALLÓ (${durationMs} ms)`);
      console.error(err && err.stack ? err.stack : err);
      process.exitCode = 1;
      results.push({ file: testFile, status: 'failed', durationMs, error: String(err && err.stack ? err.stack : err) });
    }
  }

  const endedAt = new Date();
  const summary = {
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    total: results.length,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    results,
  };

  const reportDir = path.join(__dirname);
  fs.writeFileSync(path.join(reportDir, 'report.json'), JSON.stringify(summary, null, 2), 'utf8');

  const rows = results.map(r => `
      <tr>
        <td>${r.file}</td>
        <td style="color:${r.status==='passed'?'#2e7d32':'#c62828'}">${r.status.toUpperCase()}</td>
        <td>${r.durationMs} ms</td>
      </tr>
      ${r.error ? `<tr><td colspan="3"><pre style="white-space:pre-wrap;background:#fafafa;border:1px solid #eee;padding:8px">${escapeHtml(r.error)}</pre></td></tr>` : ''}
    `).join('');

  const html = `<!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reporte Selenium</title>
    <style>
      body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 24px; }
      h1 { margin: 0 0 8px; }
      .muted { color: #666; font-size: 14px; }
      table { border-collapse: collapse; width: 100%; margin-top: 16px; }
      th, td { border: 1px solid #e0e0e0; padding: 8px 10px; text-align: left; }
      th { background: #f5f5f5; }
      .kpi { display: inline-block; margin-right: 16px; padding: 6px 10px; border-radius: 6px; background:#f5f5f5 }
      .ok { color: #2e7d32; }
      .fail { color: #c62828; }
      .small { font-size: 13px; }
    </style>
  </head>
  <body>
    <h1>Reporte de Pruebas Selenium</h1>
    <div class="muted small">Inicio: ${summary.startedAt} · Fin: ${summary.endedAt}</div>
    <div style="margin-top:10px">
      <span class="kpi">Total: <strong>${summary.total}</strong></span>
      <span class="kpi ok">Pasaron: <strong>${summary.passed}</strong></span>
      <span class="kpi fail">Fallaron: <strong>${summary.failed}</strong></span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Archivo</th>
          <th>Estado</th>
          <th>Duración</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </body>
  </html>`;

  fs.writeFileSync(path.join(reportDir, 'report.html'), html, 'utf8');
}

module.exports = run;

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

if (require.main === module) {
  run();
}



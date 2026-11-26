/* Squirrelock Holmes — draws the case checker's report on validate.html. */
'use strict';
(function (SQH) {
  const { $, h } = SQH;
  SQH.loadScripts(SQH.CASE_FILES, (failed) => {
    const rep = SQH.Validate.run();
    const sum = $('#v-summary');
    const n = rep.results.length;
    if (failed.length) rep.failed++;
    sum.textContent = (failed.length ? `Could not load: ${failed.join(', ')}. ` : '') + (rep.ok && !failed.length ? `PASS: all ${n} cases and ${rep.storyChecks.length} stories passed every check.` : `FAIL: ${rep.failed} problem group(s). See below.`);
    sum.classList.add(rep.ok && !failed.length ? 'is-pass' : 'is-fail');
    const st = $('#v-stories');
    st.append(h('h2', { text: 'Stories' }));
    const tbl = h('table', { class: 'vtable' }, h('thead', {}, h('tr', {}, ['Story', 'Level', 'Versions', 'Result'].map((t) => h('th', { text: t })))));
    const tb = h('tbody', {});
    rep.storyChecks.forEach((s) => tb.append(h('tr', {}, h('td', { text: s.title }), h('td', { text: s.tier }), h('td', { text: String(s.versions) }), h('td', { class: s.errors.length ? 'bad' : 'good', text: s.errors.length ? 'FAIL: ' + s.errors.join(' ') : 'PASS' }))));
    tbl.append(tb); st.append(tbl);
    const res = $('#v-results');
    res.append(h('h2', { text: 'Cases' }));
    const t2 = h('table', { class: 'vtable' }, h('thead', {}, h('tr', {}, ['Case', 'Level', 'Clues', 'Red herrings', 'Lock depth', 'Deductions needed', 'Result'].map((t) => h('th', { text: t })))));
    const tb2 = h('tbody', {});
    rep.results.forEach((r) => {
      const cell = h('td', { class: r.errors.length ? 'bad' : 'good' });
      cell.append(r.errors.length ? 'FAIL' : 'PASS');
      if (r.errors.length) cell.append(h('ul', {}, r.errors.map((e) => h('li', { text: e }))));
      if (r.warnings.length) cell.append(h('ul', { class: 'warn' }, r.warnings.map((e) => h('li', { text: 'Note: ' + e }))));
      tb2.append(h('tr', {}, h('td', { text: r.id }), h('td', { text: r.tier || '' }), h('td', { text: String(r.clues || 0) }), h('td', { text: String(r.herrings || 0) }), h('td', { text: String(r.depth || 0) }), h('td', { text: String(r.deductions || 0) }), cell));
    });
    t2.append(tb2); res.append(t2);
    window.SQH_REPORT = rep;
  });
})(window.SQH);

// Fixed scenes for screenshots. `?shot=editor` shows the editor with a
// sample photo loaded; `?shot=cover` shows the exported cover alone, drawn
// at its full export size. `photo` picks the sample (boulevard or pier),
// `caption` the title, `subtitle` the subtitle, `size` the export size and
// `layout` the panel layout. window.__shotReady is set once painted.

export async function runShot(shot, query, api) {
  const photo = query.get('photo') ?? 'boulevard';
  const title = query.get('caption') ?? 'Vice City Nights';
  const subtitle = query.get('subtitle') ?? 'Neon nights · Est. 2026';
  const size = query.get('size') ?? (shot === 'cover' ? 'landscape' : 'landscape');
  const layout = query.get('layout') ?? 'hero';
  const grade = query.get('grade') ?? 'sunset';
  api.setSize(size);
  api.setLayout(layout);
  api.setGrade(grade);
  api.setTitle(title);
  api.setSubtitle(subtitle);
  await api.loadSample(photo);
  if (shot === 'cover') api.enterCoverMode(size);
  api.redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

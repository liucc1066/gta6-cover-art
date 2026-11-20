// Wires Vice City Cover Maker: photos, panels, caption, grade and export.
// Photos are read on this machine with FileReader and never uploaded.
// A `?shot=` query sets up a fixed scene for a screenshot (see shots.js).

import { drawCover } from './cover.js';
import { GRADES } from './grades.js';
import { LAYOUTS, PREVIEW, SIZES, layoutRects, panelAt } from './panels.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const gradeSelect = document.getElementById('grade');
const panelControls = document.getElementById('panel-controls');
const photoList = document.getElementById('photo-list');

const state = {
  layout: 'hero',
  size: 'landscape',
  grade: 'sunset',
  title: 'Vice City Nights',
  subtitle: 'Neon nights · Est. 2026',
  palms: true,
  halftone: true,
  scanlines: false,
  vignette: true,
  photos: [],
  photoNames: [],
  panels: [
    { photo: 0, zoom: 1, ox: 0, oy: 0 },
    { photo: 0, zoom: 1, ox: 0, oy: 0 },
    { photo: 0, zoom: 1, ox: 0, oy: 0 },
  ],
};

let selectedPanel = 0;
let coverMode = false;
let dragging = null;

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** Keeps the panel list the right length for the current layout. */
export function syncPanels() {
  const count = LAYOUTS[state.layout].panels;
  while (state.panels.length < count) state.panels.push({ photo: 0, zoom: 1, ox: 0, oy: 0 });
  state.panels.length = count;
  if (selectedPanel >= count) selectedPanel = 0;
}

/** Adds a photo and returns its index. */
export function addPhoto(img, name) {
  state.photos.push(img);
  state.photoNames.push(name);
  renderPhotoList();
  return state.photos.length - 1;
}

/** Loads a bundled sample photo, adding it once, and returns its index. */
export async function loadSample(name) {
  const label = `Sample: ${name}`;
  const existing = state.photoNames.indexOf(label);
  if (existing !== -1) return existing;
  const img = await loadImage(`samples/${name}.jpg`);
  return addPhoto(img, label);
}

function renderPhotoList() {
  photoList.textContent = state.photoNames.length
    ? `Loaded: ${state.photoNames.join(' · ')}`
    : 'No photo yet — upload one or use a sample below.';
}

/** Rebuilds the per-panel rows: photo picker, zoom slider, reset. */
export function renderPanelControls() {
  panelControls.replaceChildren();
  state.panels.forEach((panel, i) => {
    const row = document.createElement('div');
    row.className = `panel-row${i === selectedPanel ? ' selected' : ''}`;
    const label = document.createElement('span');
    label.className = 'panel-name';
    label.textContent = `Panel ${i + 1}`;
    const pick = document.createElement('select');
    pick.setAttribute('aria-label', `Photo for panel ${i + 1}`);
    state.photoNames.forEach((name, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = name;
      if (idx === panel.photo) opt.selected = true;
      pick.appendChild(opt);
    });
    pick.addEventListener('change', () => {
      panel.photo = Number(pick.value);
      selectedPanel = i;
      renderPanelControls();
      redraw();
    });
    const zoom = document.createElement('input');
    zoom.type = 'range';
    zoom.min = '1';
    zoom.max = '3';
    zoom.step = '0.01';
    zoom.value = String(panel.zoom);
    zoom.setAttribute('aria-label', `Zoom for panel ${i + 1}`);
    zoom.addEventListener('input', () => {
      panel.zoom = Number(zoom.value);
      selectedPanel = i;
      redraw();
    });
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'mini';
    reset.textContent = 'Centre';
    reset.addEventListener('click', () => {
      panel.zoom = 1;
      panel.ox = 0;
      panel.oy = 0;
      selectedPanel = i;
      renderPanelControls();
      redraw();
    });
    row.addEventListener('click', () => { selectedPanel = i; renderPanelControls(); redraw(); });
    row.append(label, pick, zoom, reset);
    panelControls.appendChild(row);
  });
}

/** Draws the live preview (or the full-size cover in shot-cover mode). */
export function redraw() {
  if (!coverMode) {
    const preview = PREVIEW[state.size];
    if (canvas.width !== preview.w || canvas.height !== preview.h) {
      canvas.width = preview.w;
      canvas.height = preview.h;
    }
  }
  drawCover(ctx, canvas.width, canvas.height, state);
  const note = document.getElementById('preview-note');
  if (note) note.textContent = `Live preview · ${SIZES[state.size].label} · ${LAYOUTS[state.layout].label} · panel ${selectedPanel + 1} selected`;
}

/** Renders the cover at an export size and downloads it as a PNG. */
export function exportCover(sizeKey) {
  const size = SIZES[sizeKey] ?? SIZES.square;
  return new Promise((resolve, reject) => {
    const off = document.createElement('canvas');
    off.width = size.w;
    off.height = size.h;
    drawCover(off.getContext('2d'), size.w, size.h, state);
    off.toBlob((blob) => {
      if (!blob) { reject(new Error('export failed')); return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-city-cover-${size.w}x${size.h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      status.textContent = `Saved vice-city-cover-${size.w}x${size.h}.png (${size.w} × ${size.h})`;
      window.__lastExport = { w: size.w, h: size.h, bytes: blob.size };
      resolve(window.__lastExport);
    }, 'image/png');
  });
}

// --- Controls -------------------------------------------------------------

Object.entries(GRADES).forEach(([key, grade]) => {
  const opt = document.createElement('option');
  opt.value = key;
  opt.textContent = grade.label;
  gradeSelect.appendChild(opt);
});
gradeSelect.value = state.grade;

document.getElementById('layout-seg').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-layout]');
  if (!btn) return;
  state.layout = btn.dataset.layout;
  syncPanels();
  document.querySelectorAll('#layout-seg button').forEach((b) => b.classList.toggle('active', b === btn));
  renderPanelControls();
  redraw();
});

document.getElementById('size-seg').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-size]');
  if (!btn) return;
  state.size = btn.dataset.size;
  document.querySelectorAll('#size-seg button').forEach((b) => b.classList.toggle('active', b === btn));
  redraw();
});

document.querySelectorAll('[data-export]').forEach((btn) => {
  btn.addEventListener('click', () => exportCover(btn.dataset.export).catch((err) => { status.textContent = err.message; }));
});

titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
gradeSelect.addEventListener('change', () => { state.grade = gradeSelect.value; redraw(); });

[['fx-palms', 'palms'], ['fx-halftone', 'halftone'], ['fx-scanlines', 'scanlines'], ['fx-vignette', 'vignette']]
  .forEach(([id, key]) => {
    document.getElementById(id).addEventListener('change', (e) => { state[key] = e.target.checked; redraw(); });
  });

document.getElementById('upload').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  for (const file of files) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const img = await loadImage(dataUrl);
    const idx = addPhoto(img, file.name);
    state.panels[selectedPanel].photo = idx;
  }
  renderPanelControls();
  redraw();
  status.textContent = `${files.length} photo${files.length === 1 ? '' : 's'} loaded — they never leave this machine.`;
});

async function useSample(name) {
  const idx = await loadSample(name);
  if (state.photos.length === 1) state.panels.forEach((p) => { p.photo = idx; });
  else state.panels[selectedPanel].photo = idx;
  renderPanelControls();
  redraw();
  status.textContent = `Sample photo loaded into panel ${selectedPanel + 1}.`;
}
document.getElementById('sample-boulevard').addEventListener('click', () => useSample('boulevard'));
document.getElementById('sample-pier').addEventListener('click', () => useSample('pier'));

document.getElementById('fill-all').addEventListener('click', () => {
  const photo = state.panels[0].photo;
  state.panels.forEach((p) => { p.photo = photo; });
  renderPanelControls();
  redraw();
  status.textContent = 'One photo now fills every panel.';
});

// --- Drag to pan, scroll to zoom ------------------------------------------

function canvasPoint(e) {
  const box = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - box.left) * (canvas.width / box.width),
    y: (e.clientY - box.top) * (canvas.height / box.height),
  };
}

canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const hit = panelAt(layoutRects(state.layout, canvas.width, canvas.height), p.x, p.y);
  if (hit === -1) return;
  selectedPanel = hit;
  renderPanelControls();
  dragging = { x: p.x, y: p.y, ox: state.panels[hit].ox, oy: state.panels[hit].oy };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const p = canvasPoint(e);
  const rects = layoutRects(state.layout, canvas.width, canvas.height);
  const rect = rects.panels[selectedPanel];
  const panel = state.panels[selectedPanel];
  panel.ox = dragging.ox + (p.x - dragging.x) / rect.w;
  panel.oy = dragging.oy + (p.y - dragging.y) / rect.h;
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const panel = state.panels[selectedPanel];
  panel.zoom = Math.max(1, Math.min(3, panel.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  renderPanelControls();
  redraw();
}, { passive: false });

// --- Shot mode and first paint ---------------------------------------------

window.__viceCity = { state, exportCover, redraw, loadSample };

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, {
    setSize: (key) => { state.size = key; },
    setLayout: (key) => { state.layout = key; syncPanels(); },
    setGrade: (key) => { state.grade = key; gradeSelect.value = key; },
    setTitle: (text) => { state.title = text; titleInput.value = text; },
    setSubtitle: (text) => { state.subtitle = text; subtitleInput.value = text; },
    loadSample: async (name) => {
      const idx = await loadSample(name);
      state.panels.forEach((p) => { p.photo = idx; });
      renderPanelControls();
    },
    enterCoverMode: (sizeKey) => {
      coverMode = true;
      const size = SIZES[sizeKey] ?? SIZES.landscape;
      canvas.width = size.w;
      canvas.height = size.h;
      document.body.classList.add('shot-cover');
    },
    redraw,
  });
} else {
  renderPhotoList();
  renderPanelControls();
  redraw();
  loadSample('boulevard').then((idx) => {
    state.panels.forEach((p) => { p.photo = idx; });
    renderPanelControls();
    redraw();
  }).catch(() => { /* sample missing: empty panels still draw */ });
}

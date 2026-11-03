'use strict';
const lessons = window.DSP_LESSONS;
const $ = id => document.getElementById(id);
const video = $('video');
const storage = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem('dsp-web-' + key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem('dsp-web-' + key, JSON.stringify(value)); } catch {} }
};
let year = 'all';
let selected = 0;
let loading = false;
let loadVersion = 0;
let lastSave = 0;
const done = storage.get('done', {});
const positions = storage.get('positions', {});
const time = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

function drawList() {
  const word = $('search').value.trim().toLowerCase();
  const rows = lessons.filter(q => (year === 'all' || String(q.year) === year) && `${q.title} ${q.question} ${q.tag}`.toLowerCase().includes(word));
  $('count').textContent = `顯示 ${rows.length} / ${lessons.length} 單元 · 已完成 ${lessons.filter(q => done[q.id]).length} 題`;
  const fragment = document.createDocumentFragment();
  for (const q of rows) {
    const button = document.createElement('button');
    button.className = 'lesson';
    button.setAttribute('aria-current', String(lessons[selected].id === q.id));
    button.append(`${done[q.id] ? '✓ ' : ''}${q.title}`);
    const info = document.createElement('small');
    info.textContent = `${time(q.duration)} · ${q.segments.length} 個步驟`;
    button.append(info);
    button.addEventListener('click', () => choose(lessons.indexOf(q), true));
    fragment.append(button);
  }
  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = '沒有符合的單元。可以清除關鍵字，或切換到「全部」。';
    fragment.append(empty);
  }
  $('list').replaceChildren(fragment);
}

function savePosition() {
  if (loading || !video.currentSrc || !Number.isFinite(video.currentTime)) return;
  positions[lessons[selected].id] = video.currentTime;
  storage.set('positions', positions);
}

function loadSource(position = 0) {
  loading = true;
  const version = ++loadVersion;
  video.pause();
  $('error').hidden = true;
  const q = lessons[selected];
  const source = q[$('format').value];
  video.classList.toggle('portrait', $('format').value === 'phone');
  video.onloadedmetadata = () => {
    if (version !== loadVersion) return;
    video.currentTime = Math.min(position, Math.max(0, video.duration - 0.05));
    video.playbackRate = Number($('speed').value);
    loading = false;
    update();
  };
  video.src = source;
  video.load();
  $('download').href = source;
}

function choose(index, moveToPlayer = false) {
  savePosition();
  selected = Math.max(0, Math.min(lessons.length - 1, index));
  const q = lessons[selected];
  $('quickSelect').value = q.id;
  $('currentTitle').textContent = q.title;
  $('unitLabel').textContent = q.year ? `${q.year} · ${q.tag} · ${time(q.duration)}` : `入門準備 · ${time(q.duration)}`;
  $('question').textContent = q.question || '先準備解題會用到的觀念，再進入兩份考卷。';
  $('pdf').href = `${q.pdf}#page=${q.page}`;
  $('done').checked = !!done[q.id];
  $('prev').disabled = selected === 0;
  $('next').disabled = selected === lessons.length - 1;
  $('segments').replaceChildren(...q.segments.map(segment => {
    const button = document.createElement('button');
    button.textContent = `${time(segment.start)} ${segment.title}`;
    button.addEventListener('click', () => {
      if (loading) return;
      video.currentTime = segment.start;
      $('resumeStatus').textContent = '';
      update();
      savePosition();
    });
    return button;
  }));
  let position = Number(positions[q.id]) || 0;
  if (position > q.duration - 2 || position < 1) position = 0;
  $('resumeStatus').textContent = position ? `已回到上次觀看的 ${time(position)}，點選播放即可繼續。` : '';
  loadSource(position);
  drawList();
  update(0);
  storage.set('selected', q.id);
  history.replaceState(null, '', '#' + q.id);
  if (moveToPlayer && innerWidth <= 900) $('main').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function update(forcedTime) {
  const q = lessons[selected];
  const t = typeof forcedTime === 'number' ? forcedTime : video.currentTime || 0;
  let index = 0;
  for (let i = 0; i < q.segments.length; i++) if (t + 0.001 >= q.segments[i].start) index = i;
  $('nowStage').textContent = `${time(t)} / ${time(q.duration)} · ${q.segments[index].title}`;
  $('progress').style.width = Math.min(100, 100 * t / q.duration) + '%';
  [...$('segments').children].forEach((button, i) => {
    button.classList.toggle('active', i === index);
    button.setAttribute('aria-current', String(i === index));
    button.disabled = loading;
  });
}

function play() {
  if (video.paused) video.play().catch(error => {
    if (error.name !== 'AbortError') $('error').hidden = false;
  });
  else video.pause();
}
for (const q of lessons) {
  const option = document.createElement('option');
  option.value = q.id;
  option.textContent = `${q.year || '入門'} · ${q.title}`;
  $('quickSelect').append(option);
}
$('quickSelect').addEventListener('change', () => choose(lessons.findIndex(q => q.id === $('quickSelect').value)));
$('search').addEventListener('input', drawList);
document.querySelectorAll('[data-year]').forEach(button => button.addEventListener('click', () => {
  year = button.dataset.year;
  document.querySelectorAll('[data-year]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  drawList();
}));
$('play').addEventListener('click', play);
$('replay').addEventListener('click', () => {
  if (loading) return;
  video.currentTime = 0;
  $('resumeStatus').textContent = '';
  savePosition();
  video.play().catch(error => { if (error.name !== 'AbortError') $('error').hidden = false; });
});
$('prev').addEventListener('click', () => choose(selected - 1));
$('next').addEventListener('click', () => choose(selected + 1));
$('speed').addEventListener('change', () => {
  video.playbackRate = Number($('speed').value);
  storage.set('speed', $('speed').value);
});
$('format').addEventListener('change', () => {
  savePosition();
  storage.set('format', $('format').value);
  loadSource(video.currentTime);
});
$('done').addEventListener('change', () => {
  done[lessons[selected].id] = $('done').checked;
  storage.set('done', done);
  drawList();
});
video.addEventListener('timeupdate', () => {
  update();
  if (Date.now() - lastSave > 3000) { savePosition(); lastSave = Date.now(); }
});
video.addEventListener('pause', savePosition);
video.addEventListener('ended', savePosition);
video.addEventListener('error', () => { $('error').hidden = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden) savePosition(); });
window.addEventListener('pagehide', savePosition);
const savedSpeed = String(storage.get('speed', '1'));
if (['0.75', '1', '1.25', '1.5', '2'].includes(savedSpeed)) $('speed').value = savedSpeed;
const savedFormat = storage.get('format', innerWidth > 900 ? 'wide' : 'phone');
if (['phone', 'wide'].includes(savedFormat)) $('format').value = savedFormat;
const startId = lessons.some(q => '#' + q.id === location.hash) ? location.hash.slice(1) : storage.get('selected', 'F00');
choose(Math.max(0, lessons.findIndex(q => q.id === startId)));

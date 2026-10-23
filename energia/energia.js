(() => {
  'use strict';
  const c = window.ENERGIA;
  if (!c) return;
  const el = id => document.getElementById(id);
  const pageUrl = 'https://ekatsin.ru/energia/';
  const shareText = 'Екатерина Сенотрусова · «Энергия избранной»\nТри практики после встречи: Большой энергетический сброс, Калибровка биополя и «Крылья».';
  const shareUrl = new URL('https://t.me/share/url');
  shareUrl.search = new URLSearchParams({ url: pageUrl, text: shareText }).toString();
  document.querySelectorAll('[data-share]').forEach(a => { a.href = shareUrl.href; });
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      const block = button.closest('[data-save]');
      const status = block.querySelector('[data-copy-status]');
      const fallback = block.querySelector('[data-copy-fallback]');
      status.textContent = '';
      fallback.hidden = true;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(pageUrl);
        status.textContent = 'Ссылка скопирована';
      } catch {
        fallback.hidden = false;
        const input = fallback.querySelector('input');
        input.focus();
        input.select();
      }
    });
  });
  const safe = value => {
    if (typeof value !== 'string' || !value.trim()) return '';
    try { const u = new URL(value, location.href); return ['http:', 'https:', 'file:'].includes(u.protocol) ? value : ''; } catch { return ''; }
  };
  const link = (id, url) => { if (safe(url)) { el(id).href = url; el(id).hidden = false; } };
  for (const [key, id] of [['cleansing', 'cleansing'], ['protection', 'protection']]) {
    const item = c[key];
    if (!item || !safe(item.video) || !safe(item.poster)) continue;
    const section = el(id);
    const video = document.createElement('video');
    video.controls = true; video.playsInline = true; video.preload = 'metadata';
    video.poster = item.poster; video.setAttribute('aria-label', section.querySelector('h2').textContent);
    // Source is attached only when the section approaches the viewport.
    const attach = () => { video.src = item.video; };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { attach(); observer.disconnect(); } }, { rootMargin: '200px' });
      observer.observe(video);
    } else attach();
    if (safe(item.captions)) { const track = document.createElement('track'); track.kind = 'captions'; track.src = item.captions; track.srclang = 'ru'; track.label = 'Русские субтитры'; video.append(track); }
    section.querySelector('.video-slot').append(video);
    section.hidden = false;
  }
  if (safe(c.audio?.src)) {
    const audio = el('audio');
    audio.src = c.audio.src;
    el('krylya').hidden = false; el('listen').hidden = false;
    link('audio-download', c.audio.src);
    const duration = Number(c.audio.duration);
    if (duration > 0) el('duration').textContent = `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`;
    if ('mediaSession' in navigator && 'MediaMetadata' in window) {
      const session = navigator.mediaSession;
      const position = () => { if (session.setPositionState && Number.isFinite(audio.duration) && audio.duration > 0) session.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate, position: Math.min(audio.currentTime, audio.duration) }); };
      audio.addEventListener('play', () => { session.metadata = new MediaMetadata({ title: 'Крылья', artist: 'Екатерина Сенотрусова', album: 'Три опоры вашей энергии' }); session.playbackState = 'playing'; });
      audio.addEventListener('pause', () => { session.playbackState = 'paused'; });
      audio.addEventListener('ended', () => { session.playbackState = 'none'; });
      for (const event of ['timeupdate', 'loadedmetadata', 'ratechange']) audio.addEventListener(event, position);
      const seek = seconds => { if (Number.isFinite(audio.duration)) audio.currentTime = Math.max(0, Math.min(audio.duration, seconds)); };
      const actions = { play: () => audio.play().catch(() => {}), pause: () => audio.pause(), seekto: d => seek(d.seekTime), seekbackward: d => seek(audio.currentTime - (d.seekOffset || 10)), seekforward: d => seek(audio.currentTime + (d.seekOffset || 10)) };
      for (const [action, handler] of Object.entries(actions)) { try { session.setActionHandler(action, handler); } catch { /* Unsupported action. */ } }
    }
    // A media-loading error must never remove the practice or its download.
    audio.addEventListener('error', () => {
      el('audio-status').hidden = false;
    });
    audio.addEventListener('loadedmetadata', () => {
      el('audio-status').hidden = true;
    });
  }
  link('max', c.max);
  link('vk', c.vk);
  // A new recording pauses all other recordings, including audio.
  const recordings = [...document.querySelectorAll('audio, video')];
  recordings.forEach(current => current.addEventListener('play', () => {
    recordings.forEach(other => { if (other !== current) other.pause(); });
  }));
  if (safe(c.telegram)) document.querySelectorAll('[data-telegram]').forEach(a => { a.href = c.telegram; });
  if (safe(c.about)) el('about').href = c.about;
})();

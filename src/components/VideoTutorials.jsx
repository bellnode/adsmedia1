import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';

/** Extract YouTube video id from common URL shapes; null if not YouTube. */
export function youtubeIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const u = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?[^#]*v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = u.match(re);
    if (m) return m[1];
  }
  return null;
}

export function VideoEmbed({ url, title }) {
  const { t } = useI18n();
  const yt = youtubeIdFromUrl(url);
  if (yt) {
    return (
      <div className="vt-embed">
        <iframe
          src={`https://www.youtube.com/embed/${yt}`}
          title={title || 'Tutorial'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }
  if (url) {
    return (
      <div className="vt-embed">
        <video src={url} controls playsInline preload="metadata" title={title || 'Tutorial'} />
      </div>
    );
  }
  return (
    <div className="vt-embed vt-embed-empty">
      <span>{t('videoComingSoon')}</span>
    </div>
  );
}

function TutorialList({ tutorials }) {
  return (
    <div className="vt-list">
      {tutorials.map(v => (
        <article className="vt-card" key={v._id}>
          <h4 className="vt-card-title">{v.title}</h4>
          {v.description ? <p className="vt-card-desc">{v.description}</p> : null}
          <VideoEmbed url={v.videoUrl} title={v.title} />
        </article>
      ))}
    </div>
  );
}

export function VideoTutorialsSection() {
  const { t } = useI18n();
  const [tutorials, setTutorials] = useState(null);

  useEffect(() => {
    api('/api/public/tutorials').then(d => setTutorials(d.tutorials || [])).catch(() => setTutorials([]));
  }, []);

  if (!tutorials || tutorials.length === 0) return null;

  return (
    <section className="vt-section" id="video-tutorials">
      <div className="section-row home-section-row">
        <span className="t">{t('videoTutorials')}</span>
      </div>
      <p className="vt-section-sub">{t('videoTutorialsSub')}</p>
      <TutorialList tutorials={tutorials} />
    </section>
  );
}

export function VideoHelpFab() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [tutorials, setTutorials] = useState([]);

  useEffect(() => {
    api('/api/public/tutorials').then(d => setTutorials(d.tutorials || [])).catch(() => {});
  }, []);

  if (!tutorials.length) return null;

  return (
    <>
      <button
        type="button"
        className="vt-fab"
        onClick={() => setOpen(true)}
        aria-label={t('videoHelp')}
      >
        <span className="vt-fab-ic">?</span>
        <span className="vt-fab-txt">{t('help')}</span>
      </button>

      {open && (
        <div className="vt-modal-backdrop" onClick={() => setOpen(false)} role="presentation">
          <div className="vt-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t('videoTutorials')}>
            <div className="vt-modal-head">
              <div>
                <div className="vt-modal-title">{t('videoTutorials')}</div>
                <div className="vt-modal-sub">{t('videoTutorialsSub')}</div>
              </div>
              <button type="button" className="vt-modal-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="vt-modal-body">
              <TutorialList tutorials={tutorials} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import DitherLogo from './components/DitherLogo';
import TrailerPlayer from './components/TrailerPlayer';
import { currentIncubator, previousIncubators } from './data/incubators';

const projectParagraphs = [
  'The Gloup Soup Incubator is a gathering of crew, filmmakers and artists. The aim is to create something based on a single loose theme within two weeks. The key is pitching something small, something you could film in half a day.',
  'Take on a role that you might not usually occupy. Forget about your personal brand, being audience facing, or how this might sell. This is a space to practice and mess about, without stakes, and without judgement.',
  'Remember all those ideas that grew to unmanageable proportions and ended up in the drawer? This is an excuse to play with a low resolution version.',
  'After two weeks the fruits of our labour will be screened in theglitch.co in Hackney Wick. When the credits roll, we decide on the next theme.',
];

const ethos = [
  {
    lead: 'This is more about process than a definitive result.',
    detail: 'Attempt to step outside conventional filmmaking, in form and practice.',
  },
  {
    lead: 'Let the restrictions of time and feasibility embolden your creativity.',
    detail: 'Your budget is zero, use what you can get for free.',
  },
  {
    lead: 'Embrace that an idea that might fail, and that it does not matter.',
    detail: 'Because nothing does.',
  },
  {
    lead: 'Bring ideas to the development session and be open minded about others.',
    detail:
      'This does not need to be a fully formed piece. It can be a prop, a set piece, a technique, or simply a mood. The egg can grow from there.',
  },
  {
    lead: 'Work across groups. Share and update everyone with the progress and problems of production.',
    detail: 'We are all here to help the ideas, we are not competing.',
  },
  {
    lead: 'Have fun.',
    detail: '',
  },
];

const getDirectorNames = (director) => director.split('&').map((name) => name.trim());

const archiveStats = [
  {
    target: 9,
    label: 'Volumes',
  },
  {
    target: 78,
    label: 'Films',
  },
  {
    target: 250,
    label: 'Runtime',
    formatValue: (value) => `${Math.floor(value / 60)}h ${value % 60}min`,
  },
  {
    target: 41,
    suffix: '+',
    label: 'Filmmakers',
  },
];

const directorCounts = previousIncubators.reduce((counts, incubator) => {
  incubator.films?.forEach((film) => {
    getDirectorNames(film.director).forEach((name) => {
      counts[name] = (counts[name] ?? 0) + 1;
    });
  });

  return counts;
}, {});

const getDirectorWeightClass = (name) => {
  const count = directorCounts[name] ?? 1;
  return `director-weight-${count === 1 ? 'single' : 'multi'}`;
};

const getDirectorStyle = (name) => {
  const count = directorCounts[name] ?? 1;
  const intensity = Math.max(0, count - 1);

  return {
    '--director-accent': `hsl(${Math.max(0, 190 - intensity * 22)} 92% ${Math.max(68, 84 - intensity * 2)}%)`,
    '--director-scale': `${(1.04 + intensity * 0.028).toFixed(3)}`,
    '--director-tilt': `${(1.1 + intensity * 0.42).toFixed(2)}deg`,
    '--director-wiggle-speed': `${Math.max(0.58, 1.9 - intensity * 0.18).toFixed(2)}s`,
    '--director-pop-distance': `${Math.min(7, 2 + intensity)}px`,
    '--director-glow-blur': `${Math.min(24, 8 + intensity * 3)}px`,
  };
};

const getYouTubeEmbedUrl = (url) => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === 'youtu.be') {
      const videoId = parsedUrl.pathname.replace('/', '');
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0` : null;
    }

    if (parsedUrl.hostname.includes('youtube.com')) {
      const videoId = parsedUrl.searchParams.get('v');
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0` : null;
    }
  } catch {
    return null;
  }

  return null;
};

export default function App() {
  const currentYear = new Date().getFullYear();
  const [activeMedia, setActiveMedia] = useState(null);
  const [statsProgress, setStatsProgress] = useState(0);
  const statsRef = useRef(null);

  useEffect(() => {
    if (!activeMedia) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveMedia(null);
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMedia]);

  useEffect(() => {
    const element = statsRef.current;

    if (!element) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setStatsProgress(1);
      return undefined;
    }

    let animationFrame;
    let hasAnimated = false;

    const runAnimation = () => {
      const startedAt = performance.now();
      const duration = 1200;

      const tick = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const easedProgress = 1 - (1 - progress) ** 3;

        setStatsProgress(easedProgress);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(tick);
        }
      };

      animationFrame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          runAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="site-shell">
      <div className="logo-background">
        <div className="logo-anchor">
          <DitherLogo />
        </div>
      </div>

      <main className="page" id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Gloup Soup Incubator</p>
            <h1>Come and make films.</h1>
            <p className="hero-subcopy">
              <span>One-word theme.</span> <span>Two weeks deadline.</span>
            </p>
          </div>

          <div className="hero-panel">
            <p className="panel-heading">
              VOLUME <span className="panel-heading-x">X</span> IN PROGRESS
            </p>
            <dl className="detail-grid">
              <div>
                <dt>Title</dt>
                <dd>{currentIncubator.title}</dd>
              </div>
              <div>
                <dt>Start Date</dt>
                <dd>{currentIncubator.startDate}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{currentIncubator.duration}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{currentIncubator.location}</dd>
              </div>
              <div>
                <dt>Instagram</dt>
                <dd>
                  <a
                    className="inline-link"
                    href="https://www.instagram.com/gloup.soup/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {currentIncubator.instagram}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="trailer-section">
          <TrailerPlayer />
        </section>

        <section className="content-grid">
          <article className="copy-panel">
            <p className="panel-heading">Overview</p>
            {projectParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>

          <aside className="copy-panel">
            <p className="panel-heading">Ethos</p>
            <ul className="ethos-list">
              {ethos.map((item, index) => (
                <li
                  key={item.lead}
                  className={[
                    index % 2 === 1 ? 'ethos-item ethos-item-alt' : 'ethos-item',
                    item.lead === 'Have fun.' ? 'ethos-item-fun' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {item.lead === 'Have fun.' ? (
                    <span className="fun-letters" aria-label="Have fun.">
                      {'Have fun.'.split('').map((character, characterIndex) => (
                        <span
                          key={`${character}-${characterIndex}`}
                          className="fun-letter"
                          style={{ '--fun-index': characterIndex }}
                          aria-hidden="true"
                        >
                          {character === ' ' ? '\u00A0' : character}
                        </span>
                      ))}
                    </span>
                  ) : (
                    item.lead
                  )}
                  {item.detail ? ` ${item.detail}` : ''}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="stats-section" aria-label="Archive totals" ref={statsRef}>
          <dl className="stats-grid">
            {archiveStats.map((stat) => {
              const value = Math.round(stat.target * statsProgress);

              return (
                <div className="stat-card" key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.formatValue ? stat.formatValue(value) : `${value}${stat.suffix ?? ''}`}</dd>
                </div>
              );
            })}
          </dl>
        </section>

        <section className="archive-section">
          <div className="section-heading">
            <p className="eyebrow">Previous Incubators</p>
          </div>

          <div className="accordion-list">
            {previousIncubators.map((incubator) => (
              <details
                className="accordion-item"
                key={incubator.volume}
                style={{
                  '--volume-accent': incubator.accent,
                  '--volume-accent-soft': `${incubator.accent}33`,
                }}
              >
                <summary>
                  <span>{incubator.volume}</span>
                  <span className="accordion-title">{incubator.title}</span>
                  <span>{incubator.period}</span>
                </summary>
                <div className="accordion-body">
                  <div className="archive-overview">
                    <div className="archive-copy">
                      <p>{incubator.description}</p>

                      <dl className="archive-meta-grid">
                        {incubator.workshopDate ? (
                          <div>
                            <dt>Workshop</dt>
                            <dd>{incubator.workshopDate}</dd>
                          </div>
                        ) : null}

                        {incubator.screeningDate ? (
                          <div>
                            <dt>Screening</dt>
                            <dd>{incubator.screeningDate}</dd>
                          </div>
                        ) : null}

                        {incubator.runtime ? (
                          <div>
                            <dt>Runtime</dt>
                            <dd>{incubator.runtime}</dd>
                          </div>
                        ) : null}

                        {incubator.films?.length ? (
                          <div>
                            <dt>Films</dt>
                            <dd>{incubator.films.length}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>

                    {incubator.posters?.length ? (
                      <aside className="poster-dock" aria-label={`${incubator.volume} posters`}>
                        {incubator.posters.map((poster) => (
                          <button
                            type="button"
                            key={`${incubator.volume}-${poster.label || poster.src}`}
                            className="poster-card"
                            onClick={() =>
                              setActiveMedia({
                                type: 'poster',
                                src: poster.src,
                                label: poster.label,
                                volume: incubator.volume,
                              })
                            }
                            aria-label={poster.label ? `${incubator.volume} ${poster.label}` : `${incubator.volume} poster`}
                          >
                            <span className="poster-thumb-frame">
                              <img
                                className="poster-thumb"
                                src={poster.src}
                                alt={poster.label ? `${incubator.volume} ${poster.label}` : `${incubator.volume} poster`}
                                loading="lazy"
                              />
                            </span>
                            {poster.label ? <span className="poster-card-label">{poster.label}</span> : null}
                            <span className="poster-preview" aria-hidden="true">
                              <img src={poster.src} alt="" loading="lazy" />
                            </span>
                          </button>
                        ))}
                      </aside>
                    ) : null}
                  </div>

                  {incubator.films?.length ? (
                    <div className="filmography">
                      <ul className="filmography-list">
                        {incubator.films.map((film) => (
                          <li key={`${incubator.volume}-${film.title}`}>
                            <span className={film.uncertain ? 'film-title film-title-uncertain' : 'film-title'}>
                              {film.watchLink ? (
                                <button
                                  type="button"
                                  className="film-title-link"
                                  onClick={() =>
                                    setActiveMedia({
                                      type: 'video',
                                      volume: incubator.volume,
                                      label: film.title,
                                      src: film.watchLink,
                                      embedSrc: getYouTubeEmbedUrl(film.watchLink),
                                    })
                                  }
                                >
                                  {film.title}
                                </button>
                              ) : (
                                <span>{film.title}</span>
                              )}
                              {film.uncertain ? (
                                <span className="film-title-question" aria-hidden="true">
                                  ?
                                </span>
                              ) : null}
                            </span>
                            <span className="film-director">
                              Directed by{' '}
                              {getDirectorNames(film.director).map((name, index, names) => (
                                <span key={`${film.title}-${name}`}>
                                  <span
                                    className={`director-name ${getDirectorWeightClass(name)}`}
                                    style={getDirectorStyle(name)}
                                  >
                                    {name}
                                  </span>
                                  {index < names.length - 1 ? ' & ' : ''}
                                </span>
                              ))}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </section>

        <footer className="site-footer">
          <p>
            made in hackney wick, london, ooze from{' '}
            <a
              className="inline-link"
              href="https://theglitch.co/"
              target="_blank"
              rel="noreferrer"
            >
              theglitch.co
            </a>
            , {currentYear}
          </p>
        </footer>
      </main>

      {activeMedia ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activeMedia.label ? `${activeMedia.volume} ${activeMedia.label}` : `${activeMedia.volume} media`}
          onClick={() => setActiveMedia(null)}
        >
          <button
            type="button"
            className="lightbox-close"
            aria-label={activeMedia.type === 'video' ? 'Close video player' : 'Close poster preview'}
            onClick={() => setActiveMedia(null)}
          >
            Close
          </button>
          <div className="lightbox-frame" onClick={(event) => event.stopPropagation()}>
            {activeMedia.type === 'video' && activeMedia.embedSrc ? (
              <div className="lightbox-video-shell">
                <iframe
                  className="lightbox-video"
                  src={activeMedia.embedSrc}
                  title={`${activeMedia.volume} ${activeMedia.label}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : (
              <img
                className="lightbox-image"
                src={activeMedia.src}
                alt={activeMedia.label ? `${activeMedia.volume} ${activeMedia.label}` : `${activeMedia.volume} poster`}
              />
            )}
            <p className="lightbox-caption">
              <span>{activeMedia.volume}</span>
              {activeMedia.label ? <span>{activeMedia.label}</span> : null}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

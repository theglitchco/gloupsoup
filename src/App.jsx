import { useEffect, useRef, useState } from 'react';
import DitherLogo from './components/DitherLogo';
import TrailerPlayer from './components/TrailerPlayer';
import { contactInfo, ongoingProjects, previousIncubators } from './data/incubators';

const projectParagraphs = [
  'The Gloup Soup Incubator is a gathering of crew, filmmakers and artists. The aim is to create something based on a single loose theme within two weeks. The key is pitching something small, something you could film in half a day.',
  'Take on a role that you might not usually occupy. Forget about your personal brand, being audience facing, or how this might sell. This is a space to practice and mess about, without stakes, and without judgement.',
  'Remember all those ideas that grew to unmanageable proportions and ended up in the drawer? This is an excuse to play with a low resolution version.',
  'After two weeks the fruits of our labour will be screened in theglitch.co in Hackney Wick. When the credits roll, we decide on the next theme.',
  'The incubator series has concluded (for now). It led to the birth of many projects that now require a little parenting before laying more eggs.',
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

const getDirectorNames = (director) => director.split(/\s*(?:&|,)\s*/).map((name) => name.trim()).filter(Boolean);

const parseRuntimeSeconds = (runtime) => {
  const [minutes, seconds] = runtime.split(':').map(Number);

  return minutes * 60 + seconds;
};

const formatRuntime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (!hours) {
    return `${minutes}min`;
  }

  return `${hours}h ${minutes}min`;
};

const getVolumeNumber = (volume) => Number(volume.replace(/\D/g, ''));

const parseArchiveDate = (date) => {
  if (!date) {
    return null;
  }

  const [day, month, shortYear] = date.split('.').map(Number);

  if (!day || !month || Number.isNaN(shortYear)) {
    return null;
  }

  return new Date(2000 + shortYear, month - 1, day);
};

const formatArchiveDate = (date) =>
  date
    ? new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        year: 'numeric',
      }).format(date)
    : '';

const archiveTotals = previousIncubators.reduce(
  (totals, incubator) => ({
    volumes: totals.volumes + 1,
    films: totals.films + (incubator.films?.length ?? 0),
    runtimeSeconds: totals.runtimeSeconds + (incubator.runtime ? parseRuntimeSeconds(incubator.runtime) : 0),
  }),
  {
    volumes: 0,
    films: 0,
    runtimeSeconds: 0,
  },
);

const volumeStats = previousIncubators.map((incubator) => {
  const filmCount = incubator.films?.length ?? 0;
  const directorNames = new Set();
  let publishedFilms = incubator.watchLink ? 1 : 0;

  incubator.films?.forEach((film) => {
    getDirectorNames(film.director).forEach((name) => directorNames.add(name));

    if (film.watchLink) {
      publishedFilms += 1;
    }
  });

  return {
    volume: incubator.volume,
    volumeNumber: getVolumeNumber(incubator.volume),
    title: incubator.title.replace(/[“”"]/g, ''),
    period: incubator.period.replace(/[()]/g, ''),
    dateLabel: formatArchiveDate(parseArchiveDate(incubator.screeningDate)),
    accent: incubator.accent,
    films: filmCount,
    filmmakers: directorNames.size,
    runtimeSeconds: incubator.runtime ? parseRuntimeSeconds(incubator.runtime) : 0,
    publishedFilms,
  };
});

const cumulativeStats = volumeStats.reduce((stats, volume) => {
  const previous = stats[stats.length - 1] ?? {
    films: 0,
    runtimeSeconds: 0,
    publishedFilms: 0,
  };

  stats.push({
    ...volume,
    films: previous.films + volume.films,
    runtimeSeconds: previous.runtimeSeconds + volume.runtimeSeconds,
    publishedFilms: previous.publishedFilms + volume.publishedFilms,
  });

  return stats;
}, []);

const statsMaximums = {
  films: Math.max(...volumeStats.map((volume) => volume.films), 1),
  filmmakers: Math.max(...volumeStats.map((volume) => volume.filmmakers), 1),
  runtimeSeconds: Math.max(...volumeStats.map((volume) => volume.runtimeSeconds), 1),
  publishedFilms: Math.max(...volumeStats.map((volume) => volume.publishedFilms), 1),
  cumulativeFilms: Math.max(...cumulativeStats.map((volume) => volume.films), 1),
};

const archiveStats = [
  {
    target: archiveTotals.volumes,
    label: 'Volumes',
  },
  {
    target: archiveTotals.films,
    label: 'Films',
  },
  {
    target: 50,
    suffix: '+',
    label: 'Filmmakers',
  },
  {
    target: Math.round(archiveTotals.runtimeSeconds / 60),
    label: 'Runtime',
    formatValue: (value) => `${Math.floor(value / 60)}h ${value % 60}min`,
  },
];

const creditEntries = Array.from(
  previousIncubators
    .reduce((credits, incubator) => {
      incubator.films?.forEach((film) => {
        getDirectorNames(film.director).forEach((name) => {
          const credit = credits.get(name) ?? {
            name,
            films: [],
          };

          credit.films.push({
            title: film.title,
            volume: incubator.volume,
            volumeTitle: incubator.title,
            watchLink: film.watchLink,
          });

          credits.set(name, credit);
        });
      });

      return credits;
    }, new Map())
    .values(),
).sort((a, b) => a.name.localeCompare(b.name));

const directorCounts = previousIncubators.reduce((counts, incubator) => {
  incubator.films?.forEach((film) => {
    getDirectorNames(film.director).forEach((name) => {
      counts[name] = (counts[name] ?? 0) + 1;
    });
  });

  return counts;
}, {});

const topDirectorStats = Object.entries(directorCounts)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  .slice(0, 8);

const statsPageMetrics = [
  {
    label: 'Volumes',
    value: archiveTotals.volumes,
  },
  {
    label: 'Films',
    value: archiveTotals.films,
  },
  {
    label: 'Filmmakers',
    value: creditEntries.length,
  },
  {
    label: 'Runtime',
    value: formatRuntime(archiveTotals.runtimeSeconds),
  },
  {
    label: 'Published Links',
    value: volumeStats.reduce((total, volume) => total + volume.publishedFilms, 0),
  },
  {
    label: 'Average Per Vol',
    value: (archiveTotals.films / archiveTotals.volumes).toFixed(1),
  },
];

const busiestVolume = volumeStats.reduce(
  (busiest, volume) => (volume.films > busiest.films ? volume : busiest),
  volumeStats[0],
);

const longestRuntimeVolume = volumeStats.reduce(
  (longest, volume) => (volume.runtimeSeconds > longest.runtimeSeconds ? volume : longest),
  volumeStats[0],
);

const getDirectorWeightClass = (name) => {
  const count = directorCounts[name] ?? 1;
  return `director-weight-${count === 1 ? 'single' : 'multi'}`;
};

const getDirectorAccent = (name) => {
  const count = directorCounts[name] ?? 1;
  const intensity = Math.max(0, count - 1);

  return `hsl(${Math.max(0, 190 - intensity * 22)} 92% ${Math.max(68, 84 - intensity * 2)}%)`;
};

const getDirectorStyle = (name) => {
  const count = directorCounts[name] ?? 1;
  const intensity = Math.max(0, count - 1);

  return {
    '--director-accent': getDirectorAccent(name),
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

const getInitialRoute = () => {
  if (window.location.hash === '#/credits') {
    return 'credits';
  }

  if (window.location.hash === '#/stats') {
    return 'stats';
  }

  return 'home';
};

const renderProjectParagraph = (paragraph) => {
  if (!paragraph.includes('When the credits roll')) {
    return paragraph;
  }

  return (
    <>
      After two weeks the fruits of our labour will be screened in theglitch.co in Hackney Wick. When the{' '}
      <a className="inline-link" href="#/credits">
        credits
      </a>{' '}
      roll, we decide on the next theme.
    </>
  );
};

const createCreditLayouts = (entries) => {
  const columns = 5;
  const rows = Math.ceil(entries.length / columns) || 1;
  const slots = Array.from({ length: columns * rows }, (_, index) => index);

  for (let index = slots.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [slots[index], slots[swapIndex]] = [slots[swapIndex], slots[index]];
  }

  const xStep = columns > 1 ? 80 / (columns - 1) : 0;
  const yStep = rows > 1 ? 64 / (rows - 1) : 0;

  return entries.map((credit, index) => {
    const slot = slots[index];
    const column = slot % columns;
    const row = Math.floor(slot / columns);
    const x = 10 + column * xStep + (Math.random() - 0.5) * 4.2;
    const y = 23 + row * yStep + (Math.random() - 0.5) * 3.6;

    return {
      name: credit.name,
      x,
      y,
      '--credit-x': `${x}%`,
      '--credit-y': `${y}%`,
      '--credit-delay': `${(index % 12) * -0.31}s`,
      '--credit-drift': `${10 + (index % 7)}px`,
      '--credit-size': `${0.76 + (index % 4) * 0.04}rem`,
      '--credit-accent': getDirectorAccent(credit.name),
    };
  });
};

export default function App() {
  const [activeMedia, setActiveMedia] = useState(null);
  const [activeCreditName, setActiveCreditName] = useState(null);
  const [hoveredCreditName, setHoveredCreditName] = useState(null);
  const [route, setRoute] = useState(getInitialRoute);
  const [statsProgress, setStatsProgress] = useState(0);
  const [creditLayouts] = useState(() => createCreditLayouts(creditEntries));
  const statsRef = useRef(null);
  const activeCredit = activeCreditName ? creditEntries.find((credit) => credit.name === activeCreditName) : null;
  const hoveredCredit = hoveredCreditName ? creditLayouts.find((credit) => credit.name === hoveredCreditName) : null;

  const openCreditFilm = (film) => {
    if (!film.watchLink) {
      return;
    }

    const embedSrc = getYouTubeEmbedUrl(film.watchLink);
    setActiveCreditName(null);

    if (!embedSrc) {
      window.open(film.watchLink, '_blank', 'noopener,noreferrer');
      return;
    }

    setActiveMedia({
      type: 'video',
      volume: film.volume,
      label: film.title,
      src: film.watchLink,
      embedSrc,
    });
  };

  const renderCreditFilmTitle = (film) => {
    if (!film.watchLink) {
      return <span>{film.title}</span>;
    }

    return (
      <button type="button" className="credit-film-link" onClick={() => openCreditFilm(film)}>
        {film.title}
      </button>
    );
  };

  const getCreditFieldStyle = (credit) => {
    const { name, x, y, ...baseStyle } = credit;

    if (!hoveredCredit) {
      return baseStyle;
    }

    if (name === hoveredCredit.name) {
      return {
        ...baseStyle,
        '--credit-scale': '1.24',
        '--credit-opacity': '1',
        '--credit-repel-x': '0px',
        '--credit-repel-y': '0px',
      };
    }

    const dx = x - hoveredCredit.x;
    const dy = y - hoveredCredit.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const force = Math.max(0, 1 - distance / 36);
    const length = distance || 1;
    const repel = force * 96;

    return {
      ...baseStyle,
      '--credit-scale': `${1 - force * 0.08}`,
      '--credit-opacity': `${Math.max(0.28, 0.92 - force * 0.58)}`,
      '--credit-repel-x': `${(dx / length) * repel}px`,
      '--credit-repel-y': `${(dy / length) * repel}px`,
    };
  };

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getInitialRoute());
      setActiveCreditName(null);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (!activeMedia && !activeCreditName) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveMedia(null);
        setActiveCreditName(null);
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMedia, activeCreditName]);

  useEffect(() => {
    if (route !== 'home') {
      return undefined;
    }

    setStatsProgress(0);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setStatsProgress(1);
      return undefined;
    }

    let animationFrame;
    let animationTimeout;

    const runAnimation = () => {
      const startedAt = performance.now();
      const duration = 1200;

      const tick = (now) => {
        const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));
        const easedProgress = 1 - (1 - progress) ** 3;

        setStatsProgress(easedProgress);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(tick);
        } else {
          clearTimeout(animationTimeout);
        }
      };

      animationTimeout = window.setTimeout(() => {
        setStatsProgress(1);
      }, duration + 160);
      animationFrame = requestAnimationFrame(tick);
    };

    runAnimation();

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(animationTimeout);
    };
  }, [route]);

  const mediaOverlay = activeMedia ? (
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
  ) : null;

  const creditOverlay = activeCredit ? (
    <div
      className="credit-popover"
      role="dialog"
      aria-modal="true"
      aria-label={`${activeCredit.name} credits`}
      onClick={() => setActiveCreditName(null)}
    >
      <div className="credit-popover-panel" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="lightbox-close"
          aria-label="Close credit"
          onClick={() => setActiveCreditName(null)}
        >
          Close
        </button>
        <p className="panel-heading">{activeCredit.name}</p>
        <ul className="credit-film-list">
          {activeCredit.films.map((film) => (
            <li key={`${activeCredit.name}-${film.volume}-${film.title}`}>
              {renderCreditFilmTitle(film)}
              <span>
                {film.volume} {film.volumeTitle}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ) : null;

  const homePage = (
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
            <p className="panel-heading">Other Projects</p>
            <dl className="detail-grid">
              <div>
                <dt>Now Cooking</dt>
                <dd>
                  <span className="project-list">{ongoingProjects.join(' / ')}</span>
                </dd>
              </div>
              <div>
                <dt>DM, Call, Help!</dt>
                <dd>Producers, art dpt, runners, writers, sfx, h&m</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a className="inline-link" href={`mailto:${contactInfo.email}`}>
                    {contactInfo.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Instagram</dt>
                <dd>
                  <a
                    className="inline-link"
                    href={contactInfo.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {contactInfo.instagram}
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
              <p key={paragraph}>{renderProjectParagraph(paragraph)}</p>
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
                                src={poster.thumbSrc ?? poster.src}
                                alt={poster.label ? `${incubator.volume} ${poster.label}` : `${incubator.volume} poster`}
                                loading="lazy"
                              />
                            </span>
                            {poster.label ? <span className="poster-card-label">{poster.label}</span> : null}
                            <span className="poster-preview" aria-hidden="true">
                              <img src={poster.thumbSrc ?? poster.src} alt="" loading="lazy" />
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
                                  <button
                                    type="button"
                                    className={`director-name ${getDirectorWeightClass(name)}`}
                                    style={getDirectorStyle(name)}
                                    onClick={() => setActiveCreditName(name)}
                                  >
                                    {name}
                                  </button>
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
            <a className="inline-link" href="#/credits">
              credits
            </a>
            {' / '}
            made in hackney wick, london, ooze from{' '}
            <a
              className="inline-link"
              href="https://theglitch.co/"
              target="_blank"
              rel="noreferrer"
            >
              theglitch.co
            </a>
            , 2025-2026
          </p>
        </footer>
      </main>

      {mediaOverlay}
      {creditOverlay}
    </div>
  );

  const creditsPage = (
    <div className="site-shell">
      <main className="page credits-page">
        <section className="credits-section" aria-labelledby="credits-heading">
          <div className="credits-heading">
            <p className="eyebrow">People Who Made It Possible</p>
            <h1 id="credits-heading">Credits</h1>
          </div>

          <div className="credits-orbit" aria-label="Gloup Soup filmmaker credits">
            {creditEntries.map((credit, index) => (
              <button
                type="button"
                className="credit-name"
                key={credit.name}
                style={getCreditFieldStyle(creditLayouts[index])}
                onPointerEnter={() => setHoveredCreditName(credit.name)}
                onPointerLeave={() => setHoveredCreditName(null)}
                onFocus={() => setHoveredCreditName(credit.name)}
                onBlur={() => setHoveredCreditName(null)}
                onClick={() => setActiveCreditName(credit.name)}
              >
                {credit.name}
              </button>
            ))}
          </div>
        </section>

        <footer className="site-footer credits-footer">
          <p>
            <a className="inline-link" href="#top">
              back to homepage
            </a>
          </p>
        </footer>
      </main>

      {mediaOverlay}
      {creditOverlay}
    </div>
  );

  const statsPage = (
    <div className="site-shell stats-shell">
      <main className="page stats-page">
        <section className="stats-page-hero">
          <p className="eyebrow">Hidden Stat Page</p>
          <h1>Incubator in Numbers</h1>
          <p>
            Ten volumes of small films, recurring hands, short deadlines and gradually increasing soup density.
          </p>
        </section>

        <section className="stats-summary-grid" aria-label="Incubator totals">
          {statsPageMetrics.map((metric) => (
            <article className="stats-summary-card" key={metric.label}>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </section>

        <section className="stats-panel timeline-panel" aria-labelledby="timeline-heading">
          <div className="stats-panel-heading">
            <p className="eyebrow">Across Time</p>
            <h2 id="timeline-heading">Volume Pulse</h2>
          </div>

          <div className="timeline-chart">
            {volumeStats.map((volume) => (
              <article
                className="timeline-row"
                key={volume.volume}
                style={{
                  '--volume-accent': volume.accent,
                }}
              >
                <header>
                  <span>{volume.volume}</span>
                  <span>{volume.title}</span>
                  <span>{volume.dateLabel || volume.period}</span>
                </header>

                <div className="timeline-metrics">
                  <div className="timeline-metric">
                    <span>Films</span>
                    <span className="timeline-track">
                      <span style={{ '--bar-width': `${(volume.films / statsMaximums.films) * 100}%` }} />
                    </span>
                    <strong>{volume.films}</strong>
                  </div>
                  <div className="timeline-metric">
                    <span>Runtime</span>
                    <span className="timeline-track">
                      <span
                        style={{
                          '--bar-width': `${(volume.runtimeSeconds / statsMaximums.runtimeSeconds) * 100}%`,
                        }}
                      />
                    </span>
                    <strong>{formatRuntime(volume.runtimeSeconds)}</strong>
                  </div>
                  <div className="timeline-metric">
                    <span>Filmmakers</span>
                    <span className="timeline-track">
                      <span style={{ '--bar-width': `${(volume.filmmakers / statsMaximums.filmmakers) * 100}%` }} />
                    </span>
                    <strong>{volume.filmmakers}</strong>
                  </div>
                  <div className="timeline-metric">
                    <span>Published</span>
                    <span className="timeline-track">
                      <span
                        style={{ '--bar-width': `${(volume.publishedFilms / statsMaximums.publishedFilms) * 100}%` }}
                      />
                    </span>
                    <strong>{volume.publishedFilms}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="stats-columns" aria-label="Incubator derived statistics">
          <article className="stats-panel">
            <div className="stats-panel-heading">
              <p className="eyebrow">Accumulation</p>
              <h2>Films Made So Far</h2>
            </div>
            <div className="cumulative-chart">
              {cumulativeStats.map((volume) => (
                <div
                  className="cumulative-row"
                  key={`cumulative-${volume.volume}`}
                  style={{
                    '--volume-accent': volume.accent,
                    '--bar-width': `${(volume.films / statsMaximums.cumulativeFilms) * 100}%`,
                  }}
                >
                  <span>{volume.volume}</span>
                  <span className="timeline-track">
                    <span />
                  </span>
                  <strong>{volume.films}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="stats-panel">
            <div className="stats-panel-heading">
              <p className="eyebrow">Repeat Offenders</p>
              <h2>Most Films Directed</h2>
            </div>
            <ol className="director-stats-list">
              {topDirectorStats.map((director) => (
                <li key={director.name} style={{ '--director-accent': getDirectorAccent(director.name) }}>
                  <button type="button" onClick={() => setActiveCreditName(director.name)}>
                    <span>{director.name}</span>
                    <strong>{director.count}</strong>
                  </button>
                </li>
              ))}
            </ol>
          </article>
        </section>

        <section className="stats-footnotes">
          <article>
            <p className="eyebrow">Most Crowded Soup</p>
            <p>
              {busiestVolume.volume} {busiestVolume.title} with {busiestVolume.films} films.
            </p>
          </article>
          <article>
            <p className="eyebrow">Longest Screening</p>
            <p>
              {longestRuntimeVolume.volume} {longestRuntimeVolume.title} at{' '}
              {formatRuntime(longestRuntimeVolume.runtimeSeconds)}.
            </p>
          </article>
        </section>

        <footer className="site-footer credits-footer">
          <p>
            <a className="inline-link" href="#top">
              back to homepage
            </a>
          </p>
        </footer>
      </main>

      {mediaOverlay}
      {creditOverlay}
    </div>
  );

  if (route === 'credits') {
    return creditsPage;
  }

  if (route === 'stats') {
    return statsPage;
  }

  return homePage;
}

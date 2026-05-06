import DitherLogo from './components/DitherLogo';
import TrailerPlayer from './components/TrailerPlayer';
import { currentIncubator, previousIncubators } from './data/incubators';

const projectParagraphs = [
  'The Gloup Soup Incubator is a gathering of crew, filmmakers, artists, etc. The aim is to create something based on a one word theme within two weeks. The key to this is pitching something small, something that you could film in half a day.',
  'Put yourself in a role that you might not usually take on, try out an idea that you are not certain about. Forget about your personal brand, being audience facing, or how this might sell. This is a space to practice and mess about, without stakes, and without judgement. Remember all those times you knew you had a good idea but it grew to unmanageable proportions and ended up in a drawer? This gives you the excuse to play with a low resolution version of it to see what the process and the final result could be.',
  'At the end of the two weeks all of the films will be screened in theglitch.co in Hackney Wick, and we will decide on the next theme.',
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

export default function App() {
  const currentYear = new Date().getFullYear();

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
            <p className="panel-heading">VOLUME X SOON</p>
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
                  className={index % 2 === 1 ? 'ethos-item ethos-item-alt' : 'ethos-item'}
                >
                  {item.lead}
                  {item.detail ? ` ${item.detail}` : ''}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="archive-section">
          <div className="section-heading">
            <p className="eyebrow">Previous Incubators</p>
          </div>

          <div className="accordion-list">
            {previousIncubators.map((incubator) => (
              <details className="accordion-item" key={incubator.volume}>
                <summary>
                  <span>{incubator.volume}</span>
                  <span>{incubator.title}</span>
                  <span>{incubator.period}</span>
                </summary>
                <p>{incubator.description}</p>
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
    </div>
  );
}

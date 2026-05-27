import { useState } from 'react';
import trailerPoster from '../assets/incubator-trailer-poster.jpg';

const TRAILER_SRC = '/media/incubator-trailer-v2.mp4';

export default function TrailerPlayer() {
  const [status, setStatus] = useState('loading');

  if (status === 'missing') {
    return (
      <div className="trailer-fallback" role="status" aria-live="polite">
        <p>Trailer slot is ready.</p>
        <p>Add the film to <code>public/media/incubator-trailer-v2.mp4</code> to enable autoplay and controls.</p>
      </div>
    );
  }

  return (
    <video
      className="trailer-video"
      src={TRAILER_SRC}
      poster={trailerPoster}
      loop
      playsInline
      controls
      preload="metadata"
      onLoadedMetadata={() => setStatus('ready')}
      onLoadedData={() => setStatus('ready')}
      onError={(event) => {
        if (event.currentTarget.readyState === 0) {
          setStatus('missing');
        }
      }}
    />
  );
}

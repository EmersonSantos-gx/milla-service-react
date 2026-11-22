import { CONFIG } from '../data/config';

export default function BackgroundLayers() {
  return (
    <>
      <div className="bg-scene" aria-hidden="true" />
      <div
        className="bg-custom-image"
        aria-hidden="true"
        style={
          CONFIG.backgroundUrl
            ? { backgroundImage: `url('${CONFIG.backgroundUrl}')` }
            : undefined
        }
      />
      <div className="bg-grid-overlay" aria-hidden="true" />
    </>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

export default function HeroVideo() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const followMotionPreference = () => {
      if (motionQuery.matches) {
        video?.pause();
        setIsPlaying(false);
      }
    };

    followMotionPreference();
    motionQuery.addEventListener('change', followMotionPreference);
    return () => motionQuery.removeEventListener('change', followMotionPreference);
  }, []);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    video.pause();
    setIsPlaying(false);
  };

  return (
    <figure className="hero-film">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster="/pindaricoders-hero-poster.png"
        preload="metadata"
        aria-label="Abou Bakar and Muhammad Abdullah building PindariCoders together"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src="/pindaricoders-hero.mp4" type="video/mp4" />
      </video>
      <figcaption>
        <span><b>Abou Bakar</b> + <b>Muhammad Abdullah</b></span>
        <span>building a place for curious minds</span>
      </figcaption>
      <button className="hero-film-toggle" type="button" onClick={togglePlayback} aria-label={isPlaying ? 'Pause hero video' : 'Play hero video'}>
        <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>
      </button>
    </figure>
  );
}

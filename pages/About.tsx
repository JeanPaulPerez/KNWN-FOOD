import React from 'react';
import AboutHero      from '../components/about/AboutHero';
import HowWeFixLunch  from '../components/about/HowWeFixLunch';
import FoundersStory  from '../components/about/FoundersStory';
import KitchenHero    from '../components/about/KitchenHero';
import ZipCode        from '../components/ZipCode';

export default function About() {
  return (
    <div style={{ background: '#F5F3FF', minHeight: '100vh', overflowX: 'hidden' }}>
      <AboutHero />
      <HowWeFixLunch />
      <FoundersStory />
      <KitchenHero />
    </div>
  );
}

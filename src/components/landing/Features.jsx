'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Image,
  Music,
  Lock,
  Zap,
  Eye,
  Shield,
  Fingerprint,
  Layers,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Image,
    title: 'Image Steganography',
    description:
      'Embed secret messages within images using advanced LSB encoding. Your photos look identical but carry hidden data.',
    color: 'neon-blue',
    gradient: 'from-neon-blue to-neon-cyan',
  },
  {
    icon: Music,
    title: 'Audio Steganography',
    description:
      'Hide messages in audio files without affecting sound quality. Perfect for podcasts, music, or voice recordings.',
    color: 'neon-purple',
    gradient: 'from-neon-purple to-neon-pink',
  },
  {
    icon: Lock,
    title: 'AES-256 Encryption',
    description:
      'Military-grade encryption protects your hidden messages. Even if detected, your secrets remain unreadable.',
    color: 'neon-green',
    gradient: 'from-neon-green to-neon-cyan',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Process files in milliseconds with our optimized algorithms. No waiting, no uploads to external servers.',
    color: 'neon-pink',
    gradient: 'from-neon-pink to-neon-purple',
  },
  {
    icon: Eye,
    title: 'Visually Identical',
    description:
      'Output files are indistinguishable from originals. No artifacts, no quality loss, no suspicion.',
    color: 'neon-cyan',
    gradient: 'from-neon-cyan to-neon-blue',
  },
  {
    icon: Fingerprint,
    title: '100% Private',
    description:
      'Everything happens in your browser. No data ever leaves your device. Complete privacy guaranteed.',
    color: 'neon-blue',
    gradient: 'from-neon-blue to-neon-purple',
  },
];

function FeatureCard({ feature, index }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => ctx.revert();
  }, [index]);

  const Icon = feature.icon;

  return (
    <div
      ref={cardRef}
      className="group relative glass-card p-6 rounded-2xl hover:border-glass-highlight transition-all duration-500 hover:-translate-y-2"
    >
      {/* Gradient Glow on Hover */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
      />

      {/* Icon */}
      <div
        className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-7 h-7 text-white" />
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300`}
        />
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-gradient transition-all duration-300">
        {feature.title}
      </h3>
      <p className="text-text-secondary leading-relaxed">{feature.description}</p>

      {/* Corner Accent */}
      <div
        className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl blur-2xl transition-opacity duration-500`}
      />
    </div>
  );
}

export default function Features() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-neon-purple/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass-bg border border-glass-border mb-8">
            <Layers className="w-4 h-4 text-neon-purple" />
            <span className="text-sm text-text-secondary">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.15] tracking-tight">
            Everything You Need to
            <br />
            <span className="text-gradient">Hide & Reveal</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            NEBULA combines cutting-edge steganography techniques with beautiful
            design to give you the ultimate secret-keeping tool.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

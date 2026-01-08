'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, Heart, Code2, Rocket, Globe, Lock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const values = [
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your data never leaves your device. We believe privacy is a fundamental right.',
  },
  {
    icon: Code2,
    title: 'Open Philosophy',
    description: 'Built with modern, transparent technologies. Nothing hidden in our code.',
  },
  {
    icon: Rocket,
    title: 'Innovation',
    description: 'Pushing the boundaries of steganography with cutting-edge algorithms.',
  },
];

export default function About() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        imageRef.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          scrollTrigger: {
            trigger: imageRef.current,
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
      id="about"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-neon-purple/5 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div ref={contentRef}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass-bg border border-glass-border mb-8">
              <Heart className="w-4 h-4 text-neon-pink" />
              <span className="text-sm text-text-secondary">About NEBULA</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-[1.15] tracking-tight">
              Protecting Your
              <br />
              <span className="text-gradient">Digital Privacy</span>
            </h2>

            <p className="text-text-secondary text-lg mb-8 leading-relaxed">
              NEBULA was born from a simple belief: everyone deserves the right to
              private communication. In a world of increasing surveillance, we
              provide tools that put you back in control of your data.
            </p>

            <p className="text-text-secondary mb-10 leading-relaxed">
              Our steganography tool uses state-of-the-art algorithms to hide
              encrypted messages within ordinary-looking files. No trace, no
              suspicion, complete privacy.
            </p>

            {/* Values */}
            <div className="space-y-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-glass-bg border border-glass-border flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-neon-blue" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary mb-1">
                        {value.title}
                      </h4>
                      <p className="text-text-secondary text-sm">
                        {value.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual */}
          <div ref={imageRef} className="relative">
            <div className="glass-card-elevated p-8 rounded-3xl">
              {/* Abstract Visual */}
              <div className="relative aspect-square rounded-2xl bg-dark-surface overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 via-neon-purple/10 to-neon-pink/10" />

                {/* Central Element */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Pulsing Rings */}
                    <div className="absolute inset-0 -m-8">
                      <div className="w-full h-full rounded-full border border-neon-blue/20 animate-ping" style={{ animationDuration: '3s' }} />
                    </div>
                    <div className="absolute inset-0 -m-16">
                      <div className="w-full h-full rounded-full border border-neon-purple/20 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                    </div>

                    {/* Shield Icon */}
                    <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-2xl">
                      <Shield className="w-16 h-16 text-white" />
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-neon-blue to-neon-purple opacity-50 blur-2xl" />
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-8 left-8 glass-card p-3 rounded-xl animate-float">
                  <Globe className="w-6 h-6 text-neon-cyan" />
                </div>
                <div className="absolute bottom-8 right-8 glass-card p-3 rounded-xl animate-float" style={{ animationDelay: '-2s' }}>
                  <Code2 className="w-6 h-6 text-neon-pink" />
                </div>
                <div className="absolute top-8 right-8 glass-card p-3 rounded-xl animate-float" style={{ animationDelay: '-1s' }}>
                  <Lock className="w-6 h-6 text-neon-green" />
                </div>
              </div>

              {/* Info Bar */}
              <div className="mt-6 p-4 rounded-xl bg-dark-surface border border-glass-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse" />
                    <span className="text-sm text-text-secondary">
                      All processing happens locally
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">No servers</span>
                </div>
              </div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute -inset-8 bg-gradient-to-r from-neon-blue/5 via-neon-purple/10 to-neon-pink/5 rounded-3xl blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

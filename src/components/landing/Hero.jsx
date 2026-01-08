'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Shield, ArrowRight, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const floatingRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial animation timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1 }
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.5'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        );

      // Floating animation for decorative elements
      gsap.to(floatingRef.current, {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 md:pt-32"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass-bg border border-glass-border mb-8">
          <Sparkles className="w-4 h-4 text-neon-blue" />
          <span className="text-sm text-text-secondary">
            Next-gen Steganography Tool
          </span>
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tight"
        >
          Hide Secrets in
          <br />
          <span className="text-gradient">Plain Sight</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10"
        >
          Transform your images and audio files into secure vessels for hidden
          messages. Military-grade encryption meets beautiful design.
        </p>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/app" className="btn-neon px-8 py-4 text-lg flex items-center gap-2 group">
            Start Hiding Secrets
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="btn-ghost px-8 py-4 text-lg flex items-center gap-2">
            <Play className="w-5 h-5" />
            Watch Demo
          </button>
        </div>

        {/* Floating Visual Element */}
        <div ref={floatingRef} className="mt-16 relative">
          <div className="relative w-full max-w-3xl mx-auto">
            {/* Main Preview Card */}
            <div className="glass-card-elevated p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="bg-dark-surface rounded-xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-glass-border flex items-center justify-center">
                    <Shield className="w-12 h-12 text-neon-blue" />
                  </div>
                  <p className="text-text-muted text-sm">
                    Your secrets are safe with NEBULA
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -top-4 -right-4 glass-card px-4 py-3 rounded-xl animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neon-green" />
                <span className="text-sm text-text-secondary">256-bit AES</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 glass-card px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neon-purple" />
                <span className="text-sm text-text-secondary">Undetectable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 rounded-full border-2 border-glass-border flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-neon-blue animate-bounce" />
        </div>
      </div>
    </section>
  );
}

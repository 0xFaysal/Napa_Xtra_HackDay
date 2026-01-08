'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

export default function CTA() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div
          ref={contentRef}
          className="relative glass-card-elevated p-12 md:p-16 rounded-3xl text-center overflow-hidden"
        >
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />

          {/* Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass-bg border border-glass-border mb-6">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm text-text-secondary">
                Start For Free
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-[1.15] tracking-tight">
              Ready to Hide Your
              <br />
              <span className="text-gradient">First Secret?</span>
            </h2>

            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-10">
              Join thousands of privacy-conscious users who trust NEBULA to
              protect their confidential communications. No sign-up required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app"
                className="btn-neon px-10 py-4 text-lg flex items-center gap-2 group"
              >
                Launch NEBULA
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-2 text-text-secondary">
                <div className="w-2 h-2 rounded-full bg-neon-green" />
                <span className="text-sm">No account needed</span>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-glass-border">
              <div className="flex flex-wrap items-center justify-center gap-8 text-text-muted text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>End-to-End Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Instant Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>100% Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

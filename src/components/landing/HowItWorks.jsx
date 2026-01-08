'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Upload, Key, Sparkles, Download, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload Your File',
    description:
      'Choose an image or audio file as your carrier. Drag & drop or click to select.',
    color: 'neon-blue',
  },
  {
    number: '02',
    icon: Key,
    title: 'Enter Your Secret',
    description:
      'Type your hidden message and set a strong password for encryption.',
    color: 'neon-purple',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Process & Encrypt',
    description:
      'NEBULA embeds your encrypted message into the file using advanced algorithms.',
    color: 'neon-pink',
  },
  {
    number: '04',
    icon: Download,
    title: 'Download & Share',
    description:
      'Get your steganographic file. Share it anywhere—only you know the secret.',
    color: 'neon-green',
  },
];

function StepCard({ step, index, isLast }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          delay: index * 0.15,
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top bottom-=80',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => ctx.revert();
  }, [index]);

  const Icon = step.icon;

  return (
    <div ref={cardRef} className="relative flex items-start gap-6">
      {/* Step Number & Icon */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-16 h-16 rounded-2xl bg-${step.color}/10 border border-${step.color}/30 flex items-center justify-center`}
        >
          <Icon className={`w-8 h-8 text-${step.color}`} />
        </div>
        <span
          className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-${step.color} flex items-center justify-center text-xs font-bold text-white`}
        >
          {step.number.slice(-1)}
        </span>

        {/* Connecting Line */}
        {!isLast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-0.5 h-20 bg-gradient-to-b from-glass-border to-transparent" />
        )}
      </div>

      {/* Content */}
      <div className="pt-2">
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          {step.title}
        </h3>
        <p className="text-text-secondary leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const visualRef = useRef(null);

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

      gsap.fromTo(
        visualRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          scrollTrigger: {
            trigger: visualRef.current,
            start: 'top bottom-=50',
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
      id="how-it-works"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-surface/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass-bg border border-glass-border mb-8">
            <Sparkles className="w-4 h-4 text-neon-pink" />
            <span className="text-sm text-text-secondary">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.15] tracking-tight">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Hiding secrets has never been easier. Follow these simple steps to
            protect your confidential information.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => (
              <StepCard
                key={step.number}
                step={step}
                index={index}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>

          {/* Visual */}
          <div ref={visualRef} className="relative">
            <div className="glass-card-elevated p-8 rounded-3xl">
              {/* Animated Visual */}
              <div className="relative aspect-square rounded-2xl bg-dark-surface overflow-hidden">
                {/* Animated Layers */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Outer Ring */}
                  <div className="absolute w-64 h-64 rounded-full border border-neon-blue/20 animate-spin-slow" />
                  <div
                    className="absolute w-48 h-48 rounded-full border border-neon-purple/20 animate-spin-slow"
                    style={{ animationDirection: 'reverse', animationDuration: '15s' }}
                  />
                  <div className="absolute w-32 h-32 rounded-full border border-neon-pink/20 animate-spin-slow" />

                  {/* Center Icon */}
                  <div className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>

                  {/* Orbiting Elements */}
                  <div className="absolute w-full h-full animate-spin-slow">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-neon-blue" />
                    </div>
                  </div>
                  <div
                    className="absolute w-full h-full animate-spin-slow"
                    style={{ animationDelay: '-5s' }}
                  >
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center">
                      <Key className="w-4 h-4 text-neon-purple" />
                    </div>
                  </div>
                  <div
                    className="absolute w-full h-full animate-spin-slow"
                    style={{ animationDelay: '-10s' }}
                  >
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg bg-neon-green/20 border border-neon-green/40 flex items-center justify-center">
                      <Download className="w-4 h-4 text-neon-green" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Process Flow */}
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="text-neon-blue">Input</span>
                <ArrowRight className="w-4 h-4 text-text-muted" />
                <span className="text-neon-purple">Process</span>
                <ArrowRight className="w-4 h-4 text-text-muted" />
                <span className="text-neon-green">Output</span>
              </div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-neon-pink/10 rounded-3xl blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

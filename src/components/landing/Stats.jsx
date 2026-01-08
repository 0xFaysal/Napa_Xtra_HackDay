'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, Users, FileImage, Lock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  {
    icon: Shield,
    value: 256,
    suffix: '-bit',
    label: 'AES Encryption',
    color: 'neon-blue',
  },
  {
    icon: FileImage,
    value: 100,
    suffix: '%',
    label: 'Client-Side Processing',
    color: 'neon-purple',
  },
  {
    icon: Lock,
    value: 0,
    suffix: '',
    label: 'Data Sent to Servers',
    color: 'neon-green',
  },
  {
    icon: Users,
    value: 99.9,
    suffix: '%',
    label: 'Undetectable Rate',
    color: 'neon-pink',
  },
];

function StatCard({ stat, index }) {
  const cardRef = useRef(null);
  const valueRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Card entrance animation
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top bottom-=50',
            toggleActions: 'play none none reverse',
            onEnter: () => {
              if (!hasAnimated) {
                // Counter animation
                gsap.fromTo(
                  valueRef.current,
                  { innerText: 0 },
                  {
                    innerText: stat.value,
                    duration: 2,
                    ease: 'power2.out',
                    snap: { innerText: stat.value % 1 === 0 ? 1 : 0.1 },
                  }
                );
                setHasAnimated(true);
              }
            },
          },
        }
      );
    });

    return () => ctx.revert();
  }, [index, stat.value, hasAnimated]);

  const Icon = stat.icon;

  return (
    <div
      ref={cardRef}
      className="relative glass-card p-8 rounded-2xl text-center group hover:border-glass-highlight transition-all duration-500"
    >
      {/* Glow Effect */}
      <div
        className={`absolute inset-0 rounded-2xl bg-${stat.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Icon */}
      <div
        className={`relative w-14 h-14 mx-auto mb-4 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}
      >
        <Icon className={`w-7 h-7 text-${stat.color}`} />
      </div>

      {/* Value */}
      <div className="relative mb-2">
        <span
          ref={valueRef}
          className="text-4xl md:text-5xl font-bold text-gradient"
        >
          {stat.value}
        </span>
        <span className="text-2xl md:text-3xl font-bold text-text-secondary">
          {stat.suffix}
        </span>
      </div>

      {/* Label */}
      <p className="text-text-secondary">{stat.label}</p>
    </div>
  );
}

export default function Stats() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-purple/5" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

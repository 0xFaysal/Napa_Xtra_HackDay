"use client";

import {
    Navbar,
    Hero,
    Features,
    HowItWorks,
    Stats,
    About,
    CTA,
    Footer,
} from "@/components/landing";

export default function Home() {
    return (
        <main className='relative min-h-screen bg-deep-black overflow-x-hidden'>
            {/* Subtle grid pattern background */}
            <div className='fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none' />

            {/* Subtle top gradient accent */}
            <div className='fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-neon-blue/[0.03] to-transparent pointer-events-none' />

            {/* Navigation */}
            <Navbar />

            {/* Content */}
            <div className='relative'>
                <Hero />
                <Features />
                <Stats />
                <HowItWorks />
                <About />
                <CTA />
                <Footer />
            </div>
        </main>
    );
}

"use client";

import Link from "next/link";
import type { Metadata } from "next";
import { projects } from "./project-data";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ExternalLink, Calendar, Code2 } from 'lucide-react';

// Particle system (matching main page exactly)
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'mouse' | 'click' | 'ambient' | 'hover' | 'clickconnect' | 'air';
}

const colors = [
  '#8b5cf6', '#a855f7', '#9333ea', '#7c3aed', '#6d28d9',
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'
];

const ParticleSystem = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | undefined>(undefined);
  const lastParticleTime = useRef(0);

  const createParticle = useCallback((x: number, y: number, type: 'mouse' | 'click' | 'ambient' | 'hover' | 'clickconnect' | 'air' = 'ambient'): Particle => {
    const baseVelocity = type === 'click' ? 8 : type === 'mouse' ? 3 : type === 'hover' ? 2 : type === 'clickconnect' ? 1.5 : type === 'air' ? 0.8 : 1;
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * baseVelocity + (type === 'clickconnect' ? 0.5 : type === 'air' ? 0.2 : 1);
    
    const baseLife = type === 'click' ? 180 : type === 'mouse' ? 90 : type === 'hover' ? 80 : type === 'clickconnect' ? 270 : type === 'air' ? 160 : 300; // Increased ambient life
    const lifeVariation = baseLife * 0.2;
    const randomLife = baseLife + (Math.random() - 0.5) * 2 * lifeVariation;
    const finalLife = Math.max(Math.floor(randomLife), Math.floor(baseLife * 0.5));
    
    return {
      id: Math.random(),
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      size: Math.random() * (type === 'click' ? 6 : type === 'mouse' ? 4 : type === 'clickconnect' ? 4 : type === 'air' ? 2.5 : 3) + (type === 'clickconnect' ? 1.5 : type === 'air' ? 1 : 1),
      life: finalLife,
      maxLife: finalLife,
      color: type === 'air' ? '#f59e0b' : colors[Math.floor(Math.random() * colors.length)],
      type
    };
  }, []);

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cache per-frame values
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const mouseWorldX = mouseRef.current.x + scrollX;
    const mouseWorldY = mouseRef.current.y + scrollY;
    
    // Compute document dimensions once per frame
    const documentWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const documentHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);

    particlesRef.current = particlesRef.current.filter(particle => {
      // Update position based on particle type (matching main page exactly)
      if (particle.type === 'clickconnect') {
        // Click-connect particles - attracted to mouse using squared distance
        const mouseDistanceSquared = (particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2;
        const attractionRadiusSquared = 150 ** 2;
        
        if (mouseDistanceSquared < attractionRadiusSquared) {
          const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
          const attractionStrength = (150 - mouseDistance) / 150 * 0.08;
          const angleToMouse = Math.atan2(mouseWorldY - particle.y, mouseWorldX - particle.x);
          particle.vx += Math.cos(angleToMouse) * attractionStrength;
          particle.vy += Math.sin(angleToMouse) * attractionStrength;
        }
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.vy += 0.05;
      } else if (particle.type === 'air') {
        // Air particles - drift towards mouse with stronger attraction using squared distance
        const mouseDistanceSquared = (particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2;
        const attractionRadiusSquared = 300 ** 2;
        
        if (mouseDistanceSquared < attractionRadiusSquared) {
          const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
          const attractionStrength = (300 - mouseDistance) / 300 * 0.08;
          const angleToMouse = Math.atan2(mouseWorldY - particle.y, mouseWorldX - particle.x);
          particle.vx += Math.cos(angleToMouse) * attractionStrength;
          particle.vy += Math.sin(angleToMouse) * attractionStrength;
        }
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.vy += 0.005; // Much lighter gravity
      } else if (particle.type === 'hover') {
        // Hover particles attraction to mouse using squared distance
        const mouseDistanceSquared = (particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2;
        const attractionRadiusSquared = 150 ** 2;
        
        if (mouseDistanceSquared < attractionRadiusSquared) {
          const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
          const attractionStrength = (150 - mouseDistance) / 150 * 0.05;
          const angleToMouse = Math.atan2(mouseWorldY - particle.y, mouseWorldX - particle.x);
          particle.vx += Math.cos(angleToMouse) * attractionStrength;
          particle.vy += Math.sin(angleToMouse) * attractionStrength;
        }
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        particle.vy += 0.05;
      } else if (particle.type === 'ambient') {
        // Ambient particles gentle attraction to mouse using squared distance
        const mouseDistanceSquared = (particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2;
        const attractionRadiusSquared = 120 ** 2;
        
        if (mouseDistanceSquared < attractionRadiusSquared) {
          const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
          const attractionStrength = (120 - mouseDistance) / 120 * 0.03;
          const angleToMouse = Math.atan2(mouseWorldY - particle.y, mouseWorldX - particle.x);
          particle.vx += Math.cos(angleToMouse) * attractionStrength;
          particle.vy += Math.sin(angleToMouse) * attractionStrength;
        }
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.02; // Lighter gravity for ambient particles
        particle.vx *= 0.995; // Less friction
        particle.vy *= 0.995;
      } else {
        // Regular particle behavior (mouse, click)
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Normal gravity
        particle.vx *= 0.99;
        particle.vy *= 0.99;
      }
      
      // Decrease life
      particle.life--;
      
      // Bounce off edges
      if (particle.x <= 0 || particle.x >= documentWidth) {
        particle.vx *= -0.8;
        particle.x = Math.max(0, Math.min(documentWidth, particle.x));
      }
      if (particle.y <= 0 || particle.y >= documentHeight) {
        particle.vy *= -0.8;
        particle.y = Math.max(0, Math.min(documentHeight, particle.y));
      }
      
      return particle.life > 0;
    });
  }, []);

  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Cache per-frame values
    const now = performance.now();
    const w = canvas.width;
    const h = canvas.height;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    ctx.clearRect(0, 0, w, h);
    
    particlesRef.current.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const size = particle.size * alpha;
      
      const screenX = particle.x - scrollX;
      const screenY = particle.y - scrollY;
      
      if (screenX < -50 || screenX > w + 50 || screenY < -50 || screenY > h + 50) {
        return;
      }
      
      const gradient = ctx.createRadialGradient(
        screenX, screenY, 0,
        screenX, screenY, size
      );
      gradient.addColorStop(0, `${particle.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${particle.color}00`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add special effects for different particle types (matching main page)
      if (particle.type === 'click' && alpha > 0.5) {
        ctx.strokeStyle = `${particle.color}${Math.floor(alpha * 128).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Special effects for clickconnect particles
      if (particle.type === 'clickconnect') {
        const glowAlpha = alpha * 0.4;
        ctx.strokeStyle = `${particle.color}${Math.floor(glowAlpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 2.2, 0, Math.PI * 2);
        ctx.stroke();

        const mouseDistanceSquared = (screenX - mouseRef.current.x) ** 2 + (screenY - mouseRef.current.y) ** 2;
        const connectionRadiusSquared = 150 ** 2;
        if (mouseDistanceSquared < connectionRadiusSquared) {
          const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
          const connectionAlpha = (150 - mouseDistance) / 150 * 0.7;
          ctx.strokeStyle = `rgba(59, 130, 246, ${connectionAlpha})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.stroke();
        }
      }

      // Special effects for air particles
      if (particle.type === 'air') {
        const pulseAlpha = (Math.sin(Date.now() * 0.005 + particle.id) + 1) * 0.5 * alpha * 0.3;
        ctx.strokeStyle = `rgba(245, 158, 11, ${pulseAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 1.8, 0, Math.PI * 2);
        ctx.stroke();

        const mouseDistanceSquared = (screenX - mouseRef.current.x) ** 2 + (screenY - mouseRef.current.y) ** 2;
        const connectionRadiusSquared = 300 ** 2;
        if (mouseDistanceSquared < connectionRadiusSquared) {
          const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
          const connectionAlpha = (300 - mouseDistance) / 300 * 0.7;
          ctx.strokeStyle = `rgba(245, 158, 11, ${connectionAlpha})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.stroke();
        }
      }

      // Connection lines for hover particles
      if (particle.type === 'hover') {
        const mouseDistanceSquared = (screenX - mouseRef.current.x) ** 2 + (screenY - mouseRef.current.y) ** 2;
        const connectionRadiusSquared = 150 ** 2;
        if (mouseDistanceSquared < connectionRadiusSquared) {
          const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
          const connectionAlpha = (150 - mouseDistance) / 150 * 0.5;
          ctx.strokeStyle = `rgba(139, 92, 246, ${connectionAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.stroke();
        }
      }
      
      // Connection lines for ambient particles
      if (particle.type === 'ambient') {
        const mouseDistance = Math.sqrt((screenX - mouseRef.current.x) ** 2 + (screenY - mouseRef.current.y) ** 2);
        if (mouseDistance < 100) {
          const connectionAlpha = (100 - mouseDistance) / 100 * 0.3;
          ctx.strokeStyle = `rgba(139, 92, 246, ${connectionAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.stroke();
        }
      }
    });
  }, []);

  const animate = useCallback(() => {
    updateParticles();
    drawParticles();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, drawParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      const now = Date.now();
      if (now - lastParticleTime.current > 50) { // Match main page frequency
        particlesRef.current.push(createParticle(e.clientX + window.scrollX, e.clientY + window.scrollY, 'mouse'));
        lastParticleTime.current = now;
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Check if the click target is a link or inside a link
      const target = e.target as HTMLElement;
      const isLink = target.closest('a') !== null;
      
      // Don't create particles if clicking on a link (will redirect)
      if (isLink) {
        return;
      }
      
      // Create clickconnect particles (matching main page)
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
        const distance = Math.random() * 60 + 20;
        const spawnX = e.clientX + window.scrollX + Math.cos(angle) * distance;
        const spawnY = e.clientY + window.scrollY + Math.sin(angle) * distance;
        particlesRef.current.push(createParticle(spawnX, spawnY, 'clickconnect'));
      }
      
      // Add amber air particles (matching main page)
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 40 + 10;
        const spawnX = e.clientX + window.scrollX + Math.cos(angle) * distance;
        const spawnY = e.clientY + window.scrollY + Math.sin(angle) * distance;
        particlesRef.current.push(createParticle(spawnX, spawnY, 'air'));
      }
      
      // Regular click explosion particles
      for (let i = 0; i < 15; i++) {
        particlesRef.current.push(createParticle(e.clientX + window.scrollX, e.clientY + window.scrollY, 'click'));
      }
    };

    const handleResize = () => {
      resizeCanvas();
    };

    resizeCanvas();
    
    // Add initial ambient particles
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push(createParticle(
        Math.random() * window.innerWidth + window.scrollX,
        Math.random() * window.innerHeight + window.scrollY,
        'ambient'
      ));
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    
    const ambientInterval = setInterval(() => {
      if (particlesRef.current.length < 35) { // Increased from 25
        particlesRef.current.push(createParticle(
          Math.random() * window.innerWidth + window.scrollX,
          Math.random() * window.innerHeight + window.scrollY,
          'ambient'
        ));
      }
    }, 600); // More frequent spawning (was 1000ms)
    
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      clearInterval(ambientInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, createParticle]);

  // Expose hover particle creation
  useEffect(() => {
    (window as any).createHoverParticles = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 + window.scrollX;
      const centerY = rect.top + rect.height / 2 + window.scrollY;
      
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.3;
        const distance = Math.random() * 60 + 30;
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;
        particlesRef.current.push(createParticle(centerX + offsetX, centerY + offsetY, 'hover'));
      }
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

const ScrollTriggeredSection = ({ children, className = "", animationType = "slideUp" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const getAnimationClasses = () => {
    switch (animationType) {
      case 'slideUp':
        return isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-12 opacity-0 scale-95';
      case 'slideLeft':
        return isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-12 opacity-0 scale-95';
      case 'slideRight':
        return isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : '-translate-x-12 opacity-0 scale-95';
      default:
        return isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-8 opacity-0 scale-95';
    }
  };

  return (
    <div
      ref={sectionRef}
      className={`transform transition-all duration-700 ease-out ${getAnimationClasses()} ${className}`}
    >
      {children}
    </div>
  );
};

export default function Projects() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothMousePosition, setSmoothMousePosition] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth mouse follower
  useEffect(() => {
    const smoothFollow = () => {
      setSmoothMousePosition(prev => {
        const lerp = 0.15;
        return {
          x: prev.x + (mousePosition.x - prev.x) * lerp,
          y: prev.y + (mousePosition.y - prev.y) * lerp
        };
      });
      animationFrameRef.current = requestAnimationFrame(smoothFollow);
    };

    animationFrameRef.current = requestAnimationFrame(smoothFollow);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePosition]);

  return (
    <div className="relative min-h-screen overflow-visible">
      {/* Mouse follower */}
      <div
        className="hidden md:block fixed pointer-events-none z-50"
        style={{
          left: smoothMousePosition.x - 12,
          top: smoothMousePosition.y - 12,
          transform: 'translate(0, 0)'
        }}
      >
        <div className="absolute inset-0 w-6 h-6 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-sm animate-pulse"></div>
        <div className="relative w-6 h-6 bg-gradient-to-br from-blue-500/80 to-purple-600/80 rounded-full border border-white/20 shadow-lg backdrop-blur-sm">
          <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-white/60 rounded-full blur-[1px]"></div>
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-300/80 rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-8 py-4 sm:py-6">
        {/* Header Section */}
        <ScrollTriggeredSection animationType="slideUp" className="mb-16 px-2 sm:px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent select-none leading-tight">
              My Projects
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              A collection of projects I've built, from web applications to automation systems.
            </p>
          </div>
        </ScrollTriggeredSection>

        {/* Projects Grid */}
        <div className="max-w-4xl mx-auto space-y-8">
          {projects.map((project, index) => (
            <ScrollTriggeredSection 
              key={index} 
              animationType={index % 2 === 0 ? "slideLeft" : "slideRight"} 
              className="px-2 sm:px-4"
            >
              <Link
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
                onMouseEnter={(e) => {
                  if ((window as any).createHoverParticles) {
                    (window as any).createHoverParticles(e.currentTarget);
                  }
                }}
              >
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-3 sm:p-6 md:p-8 border border-purple-200/50 dark:border-white/10 hover:border-purple-300/70 dark:hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20 hover:scale-[1.02] cursor-pointer select-none">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Code2 className="text-blue-500 dark:text-blue-400" size={24} />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {project.title}
                        </h2>
                        <ExternalLink className="text-slate-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300" size={20} />
                      </div>
                      <p className="text-slate-600 dark:text-gray-300 text-lg mb-3 leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                        <Calendar size={16} />
                        <span className="text-sm font-medium">{project.year}</span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ExternalLink className="text-white" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollTriggeredSection>
          ))}
        </div>

        {/* Call to Action */}
        <ScrollTriggeredSection animationType="slideUp" className="mt-20 text-center px-4">
          <div className="bg-gradient-to-r from-blue-200/50 to-purple-200/50 dark:from-blue-600/30 dark:to-purple-600/30 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-blue-200/60 dark:border-white/10 hover:border-blue-300/80 dark:hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-slate-800 dark:text-white">
              Interested in collaborating?
            </h3>
            <p className="text-slate-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-xl font-medium"
            >
              Get in Touch
              <ExternalLink size={16} />
            </Link>
          </div>
        </ScrollTriggeredSection>
      </div>

      <ParticleSystem />
    </div>
  );
}

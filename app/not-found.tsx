"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';

// Custom CSS animations for motion vectors
const customStyles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-in-left {
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slide-in-right {
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slide-up 1s ease-out 0.2s forwards;
    opacity: 0;
  }
  
  .animate-slide-in-left {
    animation: slide-in-left 0.8s ease-out forwards;
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.8s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scale-in 0.6s ease-out forwards;
  }
`;

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
    
    const baseLife = type === 'click' ? 180 : type === 'mouse' ? 90 : type === 'hover' ? 80 : type === 'clickconnect' ? 270 : type === 'air' ? 160 : 300;
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

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const mouseWorldX = mouseRef.current.x + scrollX;
    const mouseWorldY = mouseRef.current.y + scrollY;

    particlesRef.current = particlesRef.current.filter(particle => {
      // Update position based on particle type (matching main page exactly)
      if (particle.type === 'clickconnect') {
        // Click-connect particles - attracted to mouse
        const mouseDistance = Math.sqrt((particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2);
        const attractionRadius = 150;
        
        if (mouseDistance < attractionRadius) {
          const attractionStrength = (attractionRadius - mouseDistance) / attractionRadius * 0.08;
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
        // Air particles - drift towards mouse with stronger attraction
        const mouseDistance = Math.sqrt((particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2);
        const attractionRadius = 300;
        
        if (mouseDistance < attractionRadius) {
          const attractionStrength = (attractionRadius - mouseDistance) / attractionRadius * 0.08;
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
        // Hover particles attraction to mouse
        const mouseDistance = Math.sqrt((particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2);
        if (mouseDistance < 150) {
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
        // Ambient particles gentle attraction to mouse
        const mouseDistance = Math.sqrt((particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2);
        if (mouseDistance < 120) {
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
      const documentWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
      const documentHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    particlesRef.current.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const size = particle.size * alpha;
      
      const screenX = particle.x - scrollX;
      const screenY = particle.y - scrollY;
      
      if (screenX < -50 || screenX > canvas.width + 50 || screenY < -50 || screenY > canvas.height + 50) {
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

        const mouseDistance = Math.sqrt((screenX - mouseRef.current.x) ** 2 + (screenY - mouseRef.current.y) ** 2);
        if (mouseDistance < 150) {
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

        const mouseDistance = Math.sqrt((screenX - mouseRef.current.x) ** 2 + (screenY - mouseRef.current.y) ** 2);
        if (mouseDistance < 300) {
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
        const mouseDistance = Math.sqrt((screenX - mouseRef.current.x) ** 2 + (screenY - mouseRef.current.y) ** 2);
        if (mouseDistance < 150) {
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
      if (now - lastParticleTime.current > 50) {
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
      if (particlesRef.current.length < 35) {
        particlesRef.current.push(createParticle(
          Math.random() * window.innerWidth + window.scrollX,
          Math.random() * window.innerHeight + window.scrollY,
          'ambient'
        ));
      }
    }, 600);
    
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

export default function NotFound() {
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
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
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

      <div className="relative z-10 w-full px-8 py-6">
        {/* Header Section */}
        <ScrollTriggeredSection animationType="slideUp" className="mb-16 px-4">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <AlertTriangle className="text-white" size={48} />
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent select-none animate-pulse">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800 dark:text-white animate-fade-in">
              Page Not Found
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up">
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>
        </ScrollTriggeredSection>

        {/* Error Details */}
        <ScrollTriggeredSection animationType="slideUp" className="mb-16 px-4">
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-red-200/50 dark:border-red-500/20 hover:border-red-300/70 dark:hover:border-red-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 dark:hover:shadow-red-500/20 hover:scale-[1.02]"
               onMouseEnter={(e) => {
                 if ((window as any).createHoverParticles) {
                   (window as any).createHoverParticles(e.currentTarget);
                 }
               }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Search className="text-red-500" size={28} />
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">What happened?</h3>
            </div>
            <div className="space-y-4 text-slate-600 dark:text-gray-300">
              <p className="leading-relaxed animate-slide-in-left">
                The page you requested could not be found on our server. This might be due to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>A mistyped URL in your browser's address bar</li>
                <li className="animate-slide-in-left" style={{ animationDelay: '0.2s' }}>A broken link from another website</li>
                <li className="animate-slide-in-left" style={{ animationDelay: '0.3s' }}>The page has been moved or removed</li>
                <li className="animate-slide-in-left" style={{ animationDelay: '0.4s' }}>You don't have permission to access this page</li>
              </ul>
            </div>
          </div>
        </ScrollTriggeredSection>

        {/* Action Buttons */}
        <ScrollTriggeredSection animationType="slideUp" className="px-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-xl font-medium"
              onMouseEnter={(e) => {
                if ((window as any).createHoverParticles) {
                  (window as any).createHoverParticles(e.currentTarget);
                }
              }}
            >
              <Home size={20} />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-3 px-8 py-4 bg-white/40 dark:bg-white/5 backdrop-blur-lg border border-slate-300/50 dark:border-white/20 text-slate-700 dark:text-white rounded-xl hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl font-medium"
              onMouseEnter={(e) => {
                if ((window as any).createHoverParticles) {
                  (window as any).createHoverParticles(e.currentTarget);
                }
              }}
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
          </div>
        </ScrollTriggeredSection>

        {/* Additional Help */}
        <ScrollTriggeredSection animationType="slideUp" className="mt-16 px-4">
          <div className="text-center">
            <p className="text-slate-500 dark:text-gray-400 mb-4 animate-slide-in-right">
              Still having trouble? Try these options:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/projects"
                className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 animate-slide-in-right"
                style={{ animationDelay: '0.1s' }}
              >
                Browse Projects
              </Link>
              <span className="text-slate-400 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>•</span>
              <Link
                href="/photos"
                className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 animate-slide-in-right"
                style={{ animationDelay: '0.3s' }}
              >
                View Photos
              </Link>
              <span className="text-slate-400 animate-slide-in-right" style={{ animationDelay: '0.4s' }}>•</span>
              <a
                href="mailto:tonicsipor@gmail.com"
                className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 animate-slide-in-right"
                style={{ animationDelay: '0.5s' }}
              >
                Contact Support
              </a>
            </div>
          </div>
        </ScrollTriggeredSection>
      </div>

      <ParticleSystem />
    </div>
  );
}

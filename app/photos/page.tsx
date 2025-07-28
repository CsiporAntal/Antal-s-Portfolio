"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Heart, Smartphone } from 'lucide-react';

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

// Image data structure
interface PhotoImage {
  id: string;
  src: string;
  alt: string;
  category: string;
  phone?: string;
}

// Sample image data - you can replace these with your actual photos
const photoData: PhotoImage[] = [
  // Favorites
  { id: 'fav1', src: '/photos/photo1.jpg', alt: 'Roman columns', category: 'favorites' },
  { id: 'fav2', src: '/photos/photo2.jpg', alt: 'Big Ben', category: 'favorites' },
  { id: 'fav3', src: '/photos/photo3.jpg', alt: 'Sacré-Cœur Basilica', category: 'favorites' },
  { id: 'fav4', src: '/photos/photo4.jpg', alt: 'Eiffel Tower', category: 'favorites' },
  
  // Xiaomi 15 Ultra
  { id: 'xiaomi1', src: '/photos/photo1.jpg', alt: 'Xiaomi 15 Ultra Photo 1', category: 'phones', phone: 'xiaomi-15-ultra' },
  { id: 'xiaomi2', src: '/photos/photo2.jpg', alt: 'Xiaomi 15 Ultra Photo 2', category: 'phones', phone: 'xiaomi-15-ultra' },
  { id: 'xiaomi3', src: '/photos/photo3.jpg', alt: 'Xiaomi 15 Ultra Photo 3', category: 'phones', phone: 'xiaomi-15-ultra' },
  
  // Oppo Find X8 Pro
  { id: 'oppo1', src: '/photos/photo4.jpg', alt: 'Oppo Find X8 Pro Photo 1', category: 'phones', phone: 'oppo-find-x8-pro' },
  { id: 'oppo2', src: '/photos/photo5.jpg', alt: 'Oppo Find X8 Pro Photo 2', category: 'phones', phone: 'oppo-find-x8-pro' },
  { id: 'oppo3', src: '/photos/photo6.jpg', alt: 'Oppo Find X8 Pro Photo 3', category: 'phones', phone: 'oppo-find-x8-pro' },
  
  // One Plus 12
  { id: 'oneplus1', src: '/photos/photo1.jpg', alt: 'One Plus 12 Photo 1', category: 'phones', phone: 'one-plus-12' },
  { id: 'oneplus2', src: '/photos/photo2.jpg', alt: 'One Plus 12 Photo 2', category: 'phones', phone: 'one-plus-12' },
  { id: 'oneplus3', src: '/photos/photo3.jpg', alt: 'One Plus 12 Photo 3', category: 'phones', phone: 'one-plus-12' },
  
  // Honor Magic 6 Pro
  { id: 'honor1', src: '/photos/photo4.jpg', alt: 'Honor Magic 6 Pro Photo 1', category: 'phones', phone: 'honor-magic-6-pro' },
  { id: 'honor2', src: '/photos/photo5.jpg', alt: 'Honor Magic 6 Pro Photo 2', category: 'phones', phone: 'honor-magic-6-pro' },
  { id: 'honor3', src: '/photos/photo6.jpg', alt: 'Honor Magic 6 Pro Photo 3', category: 'phones', phone: 'honor-magic-6-pro' },
  
  // Huawei P30 Pro
  { id: 'huawei1', src: '/photos/photo1.jpg', alt: 'Huawei P30 Pro Photo 1', category: 'phones', phone: 'huawei-p30-pro' },
  { id: 'huawei2', src: '/photos/photo2.jpg', alt: 'Huawei P30 Pro Photo 2', category: 'phones', phone: 'huawei-p30-pro' },
  { id: 'huawei3', src: '/photos/photo3.jpg', alt: 'Huawei P30 Pro Photo 3', category: 'phones', phone: 'huawei-p30-pro' },
  
  // Nothing CMF 2 Pro
  { id: 'nothing1', src: '/photos/photo4.jpg', alt: 'Nothing CMF 2 Pro Photo 1', category: 'phones', phone: 'nothing-cmf-2-pro' },
  { id: 'nothing2', src: '/photos/photo5.jpg', alt: 'Nothing CMF 2 Pro Photo 2', category: 'phones', phone: 'nothing-cmf-2-pro' },
  { id: 'nothing3', src: '/photos/photo6.jpg', alt: 'Nothing CMF 2 Pro Photo 3', category: 'phones', phone: 'nothing-cmf-2-pro' },
];

const phoneCategories = [
  { id: 'xiaomi-15-ultra', name: 'Xiaomi 15 Ultra', icon: '📱' },
  { id: 'oppo-find-x8-pro', name: 'Oppo Find X8 Pro', icon: '📱' },
  { id: 'one-plus-12', name: 'One Plus 12', icon: '📱' },
  { id: 'honor-magic-6-pro', name: 'Honor Magic 6 Pro', icon: '📱' },
  { id: 'huawei-p30-pro', name: 'Huawei P30 Pro', icon: '📱' },
  { id: 'nothing-cmf-2-pro', name: 'Nothing CMF 2 Pro', icon: '📱' },
];

export default function Photos() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothMousePosition, setSmoothMousePosition] = useState({ x: 0, y: 0 });
  const [selectedImage, setSelectedImage] = useState<PhotoImage | null>(null);
  const [modalImages, setModalImages] = useState<PhotoImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

  const openModal = (image: PhotoImage, category: string) => {
    let imagesToShow: PhotoImage[];
    
    if (category === 'favorites') {
      imagesToShow = photoData.filter(img => img.category === 'favorites');
    } else {
      imagesToShow = photoData.filter(img => img.phone === category);
    }
    
    setModalImages(imagesToShow);
    setSelectedImage(image);
    setCurrentImageIndex(imagesToShow.findIndex(img => img.id === image.id));
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsZoomed(false);
    
    // Reset image and container sizes
    setTimeout(() => {
      updateImageAndContainerSizes();
    }, 100);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalImages([]);
    setCurrentImageIndex(0);
    setIsZoomed(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const nextImage = () => {
    if (modalImages.length > 0) {
      const newIndex = (currentImageIndex + 1) % modalImages.length;
      setCurrentImageIndex(newIndex);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
      setIsZoomed(false);
      setTimeout(() => {
        updateImageAndContainerSizes();
      }, 100);
    }
  };

  const prevImage = () => {
    if (modalImages.length > 0) {
      const newIndex = (currentImageIndex - 1 + modalImages.length) % modalImages.length;
      setCurrentImageIndex(newIndex);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
      setIsZoomed(false);
      setTimeout(() => {
        updateImageAndContainerSizes();
      }, 100);
    }
  };

  const updateImageAndContainerSizes = () => {
    if (imageRef.current && containerRef.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      setImageSize({
        width: imgRect.width,
        height: imgRect.height
      });
      
      setContainerSize({
        width: containerRect.width,
        height: containerRect.height
      });
      
      // Re-clamp pan position after size update with a longer delay
      setTimeout(() => {
        const clampedPan = clampPanPosition(panPosition.x, panPosition.y);
        setPanPosition(clampedPan);
      }, 50);
    }
  };

  const calculatePanBounds = () => {
    if (!imageSize.width || !imageSize.height || !containerSize.width || !containerSize.height) {
      return { maxX: 0, maxY: 0, minX: 0, minY: 0 };
    }

    // Calculate how much the scaled image extends beyond the container
    const scaledImageWidth = imageSize.width * zoomLevel;
    const scaledImageHeight = imageSize.height * zoomLevel;
    
    // Calculate the maximum pan distance
    // When image is larger than container, we can pan by the difference
    const maxPanX = Math.max(0, (scaledImageWidth - containerSize.width) / 2);
    const maxPanY = Math.max(0, (scaledImageHeight - containerSize.height) / 2);
    
    return {
      maxX: maxPanX,
      maxY: maxPanY,
      minX: -maxPanX,
      minY: -maxPanY
    };
  };

  const clampPanPosition = (x: number, y: number) => {
    const bounds = calculatePanBounds();
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, y))
    };
  };

  const handleZoom = (newZoom: number, centerX?: number, centerY?: number) => {
    const clampedZoom = Math.max(0.5, Math.min(5, newZoom));
    
    if (centerX !== undefined && centerY !== undefined && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Get the point in the image that the mouse is over (in screen coordinates)
      const mouseX = centerX - containerRect.left - containerRect.width / 2;
      const mouseY = centerY - containerRect.top - containerRect.height / 2;
      
      // Calculate the world coordinates of the point under mouse before zoom
      const worldX = (mouseX - panPosition.x) / zoomLevel;
      const worldY = (mouseY - panPosition.y) / zoomLevel;
      
      // Calculate new pan position to keep the mouse point fixed
      const newPanX = mouseX - worldX * clampedZoom;
      const newPanY = mouseY - worldY * clampedZoom;
      
      // Update zoom and pan position together to prevent shifting
      setZoomLevel(clampedZoom);
      setIsZoomed(clampedZoom > 1);
      setPanPosition({ x: newPanX, y: newPanY });
      
      // Clamp pan position after a brief delay to ensure zoom is applied
      setTimeout(() => {
        const clampedPan = clampPanPosition(newPanX, newPanY);
        if (clampedPan.x !== newPanX || clampedPan.y !== newPanY) {
          setPanPosition(clampedPan);
        }
      }, 10);
    } else {
      setZoomLevel(clampedZoom);
      setIsZoomed(clampedZoom > 1);
      
      // Clamp existing pan position to new zoom bounds
      setTimeout(() => {
        const clampedPan = clampPanPosition(panPosition.x, panPosition.y);
        setPanPosition(clampedPan);
      }, 10);
    }
  };

  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed && e.button === 0) {
      e.preventDefault();
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isZoomed) {
      e.preventDefault();
      
      // Calculate raw mouse movement
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      // Apply the movement directly to pan position
      const newPanX = panPosition.x + deltaX;
      const newPanY = panPosition.y + deltaY;
      
      // Clamp the pan position to bounds
      const clampedPan = clampPanPosition(newPanX, newPanY);
      setPanPosition(clampedPan);
      
      // Update last mouse position
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const zoomSpeed = 0.05;
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    const newZoom = zoomLevel + delta;
    
    handleZoom(newZoom, e.clientX, e.clientY);
  };

  // Update sizes when image loads or window resizes
  useEffect(() => {
    const handleResize = () => {
      updateImageAndContainerSizes();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update sizes when current image changes
  useEffect(() => {
    if (selectedImage) {
      const timer = setTimeout(() => {
        updateImageAndContainerSizes();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [selectedImage, currentImageIndex]);

  // Keyboard navigation and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage) {
        if (e.key === 'Escape') {
          closeModal();
        } else if (e.key === 'ArrowRight') {
          nextImage();
        } else if (e.key === 'ArrowLeft') {
          prevImage();
        } else if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          handleZoom(zoomLevel + 0.5);
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoom(zoomLevel - 0.5);
        } else if (e.key === '0') {
          e.preventDefault();
          setZoomLevel(1);
          setIsZoomed(false);
          setPanPosition({ x: 0, y: 0 });
        }
      }
    };

    // Lock body scroll when modal is open
    if (selectedImage) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Cleanup body scroll lock
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [selectedImage, zoomLevel]);

  const favorites = photoData.filter(img => img.category === 'favorites');
  const phoneImages = phoneCategories.map(category => ({
    ...category,
    images: photoData.filter(img => img.phone === category.id)
  }));

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

      <div className="relative z-10 w-full px-8 py-6">
        {/* Header Section */}
        <ScrollTriggeredSection animationType="slideUp" className="mb-16 px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent select-none">
              My Photos
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              A collection of my favorite photos organized by device and category.
            </p>
          </div>
        </ScrollTriggeredSection>

        {/* Favorites Section */}
        <ScrollTriggeredSection animationType="slideUp" className="mb-16 px-4">
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-purple-200/50 dark:border-white/10 hover:border-purple-300/70 dark:hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20 hover:scale-[1.02]"
               onMouseEnter={(e) => {
                 if ((window as any).createHoverParticles) {
                   (window as any).createHoverParticles(e.currentTarget);
                 }
               }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Heart className="text-red-500" size={28} />
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Favorites</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {favorites.map((image, index) => (
                <div
                  key={image.id}
                  className="group cursor-pointer select-none"
                  onClick={() => openModal(image, 'favorites')}
                  onMouseEnter={(e) => {
                    if ((window as any).createHoverParticles) {
                      (window as any).createHoverParticles(e.currentTarget);
                    }
                  }}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-white/20 dark:bg-white/5 border border-purple-200/30 dark:border-white/10 hover:border-purple-300/50 dark:hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollTriggeredSection>

        {/* Phone Categories */}
        <div className="space-y-16">
          {phoneImages.map((phoneCategory, categoryIndex) => (
            <ScrollTriggeredSection 
              key={phoneCategory.id}
              animationType={categoryIndex % 2 === 0 ? "slideLeft" : "slideRight"} 
              className="px-4"
            >
              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-purple-200/50 dark:border-white/10 hover:border-purple-300/70 dark:hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20 hover:scale-[1.02]"
                   onMouseEnter={(e) => {
                     if ((window as any).createHoverParticles) {
                       (window as any).createHoverParticles(e.currentTarget);
                     }
                   }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Smartphone className="text-blue-500 dark:text-blue-400" size={28} />
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{phoneCategory.name}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {phoneCategory.images.map((image, index) => (
                    <div
                      key={image.id}
                      className="group cursor-pointer select-none"
                      onClick={() => openModal(image, phoneCategory.id)}
                      onMouseEnter={(e) => {
                        if ((window as any).createHoverParticles) {
                          (window as any).createHoverParticles(e.currentTarget);
                        }
                      }}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-white/20 dark:bg-white/5 border border-purple-200/30 dark:border-white/10 hover:border-purple-300/50 dark:hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollTriggeredSection>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          style={{ overflow: 'hidden' }}
        >
          <div 
            ref={containerRef}
            className="relative max-w-7xl max-h-[90vh] mx-4 overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors duration-200"
            >
              <X size={24} />
            </button>

            {/* Zoom controls */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <button
                onClick={() => handleZoom(zoomLevel + 0.5)}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors duration-200"
                title="Zoom In (+)"
              >
                <span className="text-lg font-bold">+</span>
              </button>
              <button
                onClick={() => handleZoom(zoomLevel - 0.5)}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors duration-200"
                title="Zoom Out (-)"
              >
                <span className="text-lg font-bold">−</span>
              </button>
              <button
                onClick={() => {
                  setZoomLevel(1);
                  setIsZoomed(false);
                  setPanPosition({ x: 0, y: 0 });
                }}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors duration-200"
                title="Reset Zoom (0)"
              >
                <span className="text-sm font-bold">0</span>
              </button>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors duration-200"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors duration-200"
            >
              <ChevronRight size={24} />
            </button>

            {/* Image container with zoom and pan */}
            <div 
              className={`relative overflow-hidden rounded-lg select-none ${
                isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div
                className="transition-transform duration-200 ease-out"
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'center center'
                }}
              >
                <Image
                  ref={imageRef}
                  src={modalImages[currentImageIndex]?.src || ''}
                  alt={modalImages[currentImageIndex]?.alt || ''}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[80vh] object-contain"
                  onLoad={updateImageAndContainerSizes}
                  onError={() => console.error('Image failed to load')}
                />
              </div>
            </div>
              
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {modalImages.length}
              {isZoomed && (
                <span className="ml-2 text-yellow-300">
                  {Math.round(zoomLevel * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <ParticleSystem />
    </div>
  );
}
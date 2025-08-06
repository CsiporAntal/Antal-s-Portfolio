"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Heart, Smartphone } from 'lucide-react';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

// Custom PhotoSwipe styles
const photoSwipeStyles = `
  .pswp {
    --pswp-bg: rgba(0, 0, 0, 0.95);
    --pswp-placeholder-bg: rgba(0, 0, 0, 0.3);
    --pswp-error-text-color: #fff;
    --pswp-preloader-color: rgba(255, 255, 255, 0.8);
    --pswp-counter-color: rgba(255, 255, 255, 0.8);
    --pswp-fullscreen-expand-color: rgba(255, 255, 255, 0.8);
    --pswp-fullscreen-expand-hover-color: #fff;
    --pswp-fullscreen-expand-active-color: #fff;
    --pswp-close-color: rgba(255, 255, 255, 0.8);
    --pswp-close-hover-color: #fff;
    --pswp-close-active-color: #fff;
    --pswp-arrow-color: rgba(255, 255, 255, 0.8);
    --pswp-arrow-hover-color: #fff;
    --pswp-arrow-active-color: #fff;
    --pswp-arrow-size: 50px;
    --pswp-arrow-size-mobile: 40px;
    --pswp-counter-font-size: 14px;
    --pswp-preloader-size: 50px;
    --pswp-preloader-size-mobile: 40px;
    --pswp-fullscreen-expand-size: 50px;
    --pswp-fullscreen-expand-size-mobile: 40px;
    --pswp-close-size: 50px;
    --pswp-close-size-mobile: 40px;
    --pswp-spacing: 20px;
    --pswp-spacing-mobile: 10px;
    --pswp-transition-duration: 0.3s;
    --pswp-transition-timing-function: cubic-bezier(0.4, 0, 0.22, 1);
    z-index: 40 !important;
  }
  
  .pswp__bg {
    backdrop-filter: blur(10px);
  }
  
  .pswp__counter {
    font-family: inherit;
    font-weight: 500;
  }
  
  .pswp__button {
    transition: all 0.2s ease;
  }
  
  .pswp__button:hover {
    transform: scale(1.1);
  }
  
  .pswp__img {
    object-fit: contain !important;
    max-width: none !important;
    max-height: none !important;
  }
  
  .pswp__container {
    transition: none !important;
  }
  
  .pswp__item {
    transition: none !important;
  }
  
  .pswp__img {
    transition: none !important;
  }
  
  /* Custom navigation arrow styling */
  .pswp__button--arrow--left,
  .pswp__button--arrow--right {
    background: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 50% !important;
    width: 60px !important;
    height: 60px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.22, 1) !important;
    opacity: 0.8 !important;
    position: absolute !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    z-index: 2000 !important;
    margin: 0 !important;
  }
  
  /* Position left arrow on the left side */
  .pswp__button--arrow--left {
    left: 20px !important;
    right: unset !important;
  }
  
  /* Position right arrow on the right side */
  .pswp__button--arrow--right {
    right: 20px !important;
    left: unset !important;
  }
  
  .pswp__button--arrow--left:hover,
  .pswp__button--arrow--right:hover {
    background: rgba(0, 0, 0, 0.8) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
    transform: scale(1.1) !important;
    opacity: 1 !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  }
  
  .pswp__button--arrow--left:active,
  .pswp__button--arrow--right:active {
    transform: scale(0.95) !important;
  }
  
  /* Arrow icon styling */
  .pswp__button--arrow--left::before,
  .pswp__button--arrow--right::before {
    content: '' !important;
    width: 20px !important;
    height: 20px !important;
    border: 2px solid rgba(255, 255, 255, 0.9) !important;
    border-top: none !important;
    border-right: none !important;
    transition: all 0.2s ease !important;
  }
  
  .pswp__button--arrow--left::before {
    transform: rotate(45deg) translate(2px, -2px) !important;
  }
  
  .pswp__button--arrow--right::before {
    transform: rotate(225deg) translate(2px, -2px) !important;
  }
  
  .pswp__button--arrow--left:hover::before,
  .pswp__button--arrow--right:hover::before {
    border-color: #fff !important;
    transform: scale(1.1) !important;
  }
  
  /* Mobile responsive arrows */
  @media (max-width: 768px) {
    .pswp__button--arrow--left,
    .pswp__button--arrow--right {
      width: 50px !important;
      height: 50px !important;
    }
    
    .pswp__button--arrow--left::before,
    .pswp__button--arrow--right::before {
      width: 16px !important;
      height: 16px !important;
    }
  }
  
  /* Optimized transitions for better performance */
  .pswp__item {
    transition: opacity 0.2s ease-out !important;
  }
  
  .pswp__img {
    transition: opacity 0.2s ease-out !important;
  }
  
  .pswp__container {
    transition: transform 0.2s ease-out !important;
  }
  
  /* Counter styling */
  .pswp__counter {
    background: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 20px !important;
    padding: 8px 16px !important;
    font-weight: 600 !important;
    letter-spacing: 0.5px !important;
  }
  
  /* Hide default close button */
  .pswp__button--close {
    display: none !important;
  }
  
  /* Counter styling - positioned below navbar */
  .pswp__counter {
    background: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 20px !important;
    padding: 8px 16px !important;
    font-weight: 600 !important;
    letter-spacing: 0.5px !important;
    position: fixed !important;
    top: 80px !important;
    left: 20px !important;
    z-index: 1000 !important;
    text-align: center !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: 60px !important;
  }
  
  /* Custom close button - positioned at same height as counter */
  .pswp-close-btn {
    position: fixed !important;
    top: 80px !important;
    right: 20px !important;
    width: 50px !important;
    height: 50px !important;
    background: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 50% !important;
    color: rgba(255, 255, 255, 0.9) !important;
    font-size: 30px !important;
    font-weight: bold !important;
    cursor: pointer !important;
    z-index: 1001 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.22, 1) !important;
    border: none !important;
    outline: none !important;
  }
  
  .pswp-close-btn:hover {
    background: rgba(0, 0, 0, 0.8) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
    transform: scale(1.1) !important;
    color: #fff !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  }
  
  /* Hide duplicate counters */
  .pswp__counter:not(:first-of-type) {
    display: none !important;
  }
  
  /* Ensure proper z-index for all UI elements */
  .pswp__ui {
    z-index: 1000 !important;
  }
  
  .pswp__ui--idle .pswp__ui__element {
    opacity: 1 !important;
  }
  

  
  /* Custom zoom button - positioned below navbar */
  .pswp-zoom-btn {
    position: fixed !important;
    top: 80px !important;
    right: 80px !important;
    width: 50px !important;
    height: 50px !important;
    background: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 50% !important;
    color: rgba(255, 255, 255, 0.9) !important;
    font-size: 18px !important;
    cursor: pointer !important;
    z-index: 1001 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.22, 1) !important;
    border: none !important;
    outline: none !important;
  }
  
  .pswp-zoom-btn:hover {
    background: rgba(0, 0, 0, 0.8) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
    transform: scale(1.1) !important;
    color: #fff !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  }
  
  /* Fix arrow positioning */
  .pswp__button--arrow--left,
  .pswp__button--arrow--right {
    z-index: 1000 !important;
  }
  
  /* Hide default zoom button and position custom one to the left of close button */
  .pswp__button--zoom:not(.pswp__button--zoom--custom) {
    display: none !important;
  }
  
  .pswp__button--zoom--custom {
    position: fixed !important;
    top: 80px !important;
    right: 80px !important;
    z-index: 1001 !important;
    background: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 50% !important;
    width: 50px !important;
    height: 50px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.22, 1) !important;
  }
  
  .pswp__button--zoom--custom:hover {
    background: rgba(0, 0, 0, 0.8) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
    transform: scale(1.1) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  }
  
  /* Style zoom button icon */
  .pswp__button--zoom--custom::before {
    content: '🔍' !important;
    font-size: 18px !important;
    color: rgba(255, 255, 255, 0.9) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    height: 100% !important;
    line-height: 1 !important;
  }
  
  .pswp__button--zoom--custom:hover::before {
    color: #fff !important;
  }
  
  /* Ensure UI elements are always visible */
  .pswp__ui__element {
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  /* Ensure PhotoSwipe doesn't interfere when closed */
  .pswp:not(.pswp--open) {
    display: none !important;
  }
  
  /* DISABLED: Ensure PhotoSwipe doesn't block navbar when closed */
  /* .pswp:not(.pswp--open) {
    pointer-events: none !important;
    z-index: -1 !important;
  }
  
  /* Ensure navbar is always above PhotoSwipe */
  #navbar {
    z-index: 9999 !important;
    position: relative !important;
    pointer-events: auto !important;
  }
  
  /* Ensure navbar links are always clickable */
  #navbar a, #navbar button {
    z-index: 10000 !important;
    position: relative !important;
    pointer-events: auto !important;
  } */

  /* Force arrow positioning with higher specificity */
  .pswp .pswp__button--arrow--left {
    left: 20px !important;
    right: auto !important;
    position: absolute !important;
  }
  
  .pswp .pswp__button--arrow--right {
    right: 20px !important;
    left: auto !important;
    position: absolute !important;
  }

  /* Ensure arrows are visible and clickable */
  .pswp--open .pswp__button--arrow--left,
  .pswp--open .pswp__button--arrow--right {
    display: flex !important;
    visibility: visible !important;
    opacity: 0.8 !important;
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

const ParticleSystem = ({ isPhotoSwipeOpen }: { isPhotoSwipeOpen: boolean }) => {
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
      
      // Don't create particles if PhotoSwipe is open
      if (isPhotoSwipeOpen) return;
      
      const now = Date.now();
      if (now - lastParticleTime.current > 50) {
        particlesRef.current.push(createParticle(e.clientX + window.scrollX, e.clientY + window.scrollY, 'mouse'));
        lastParticleTime.current = now;
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Don't create particles if PhotoSwipe is open
      if (isPhotoSwipeOpen) return;
      
      // Check if the click target is a link or inside a link
      const target = e.target as HTMLElement;
      const isLink = target.closest('a') !== null;
      const isButton = target.closest('button') !== null;
      const isNavigation = target.closest('nav, header, #navbar') !== null;
      const isInteractiveElement = target.closest('input, select, textarea, [role="button"], [tabindex]') !== null;
      
      // Don't create particles for any interactive elements - exit immediately
      if (isLink || isButton || isNavigation || isInteractiveElement) {
        return;
      }
      
      // Don't create particles if clicking on PhotoSwipe elements
      const isPhotoSwipeElement = target.closest('.pswp') !== null;
      if (isPhotoSwipeElement) {
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

    // DISABLED: Event listeners for testing
    // let mouseMoveThrottle = false;
    // const throttledMouseMove = (e: MouseEvent) => {
    //   if (!mouseMoveThrottle) {
    //     mouseMoveThrottle = true;
    //     setTimeout(() => { mouseMoveThrottle = false; }, 50); // Throttle to 20fps
    //     handleMouseMove(e);
    //   }
    // };
    // 
    // window.addEventListener('mousemove', throttledMouseMove, { passive: true });
    // window.addEventListener('click', handleClick, { passive: true, capture: false });
    // window.addEventListener('resize', handleResize, { passive: true });
    
    // DISABLED: Ambient interval for testing
    // const ambientInterval = setInterval(() => {
    //   if (particlesRef.current.length < 20) { // Reduced max particles
    //     particlesRef.current.push(createParticle(
    //       Math.random() * window.innerWidth + window.scrollX,
    //       Math.random() * window.innerHeight + window.scrollY,
    //       'ambient'
    //     ));
    //   }
    // }, 1000); // Increased interval to 1 second
    
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      // DISABLED: Event listener cleanup
      // window.removeEventListener('mousemove', throttledMouseMove);
      // window.removeEventListener('click', handleClick);
      // window.removeEventListener('resize', handleResize);
      // clearInterval(ambientInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, createParticle]);

  // Expose hover particle creation
  useEffect(() => {
    (window as any).createHoverParticles = (element: HTMLElement) => {
      // Don't create particles if PhotoSwipe is open
      if (isPhotoSwipeOpen) return;
      
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
  }, [createParticle, isPhotoSwipeOpen]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: 'transparent',
        pointerEvents: 'none', // Ensure canvas never blocks clicks
        zIndex: 0
      }}
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

// Helper function to get image dimensions
const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = document.createElement('img') as HTMLImageElement;
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      // Fallback to default dimensions if image fails to load
      resolve({ width: 4000, height: 3000 });
    };
    img.src = src;
  });
};

// Sample image data - you can replace these with your actual photos
const photoData: PhotoImage[] = [
  // Favorites
  { id: 'fav1', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823242/IMG_20250531_004947_ljmmhk.jpg', alt: 'Xiaomi 15 Ultra - Sunset', category: 'favorites' },
  { id: 'fav2', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823238/IMG_20250529_001749_p4ovrn.jpg', alt: 'Xiaomi 15 Ultra - Architecture', category: 'favorites' },
  { id: 'fav3', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823237/IMG_20250531_151750_vhjhnv.jpg', alt: 'Xiaomi 15 Ultra - Street Scene', category: 'favorites' },
  { id: 'fav4', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823235/IMG_20250601_183012_dzgcyi.jpg', alt: 'Xiaomi 15 Ultra - City View', category: 'favorites' },
  
  // Xiaomi 15 Ultra
  { id: 'xiaomi1', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823242/IMG_20250531_004947_ljmmhk.jpg', alt: 'Xiaomi 15 Ultra Photo 1', category: 'phones', phone: 'xiaomi-15-ultra' },
  { id: 'xiaomi2', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823238/IMG_20250529_001749_p4ovrn.jpg', alt: 'Xiaomi 15 Ultra Photo 2', category: 'phones', phone: 'xiaomi-15-ultra' },
  { id: 'xiaomi3', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823237/IMG_20250531_151750_vhjhnv.jpg', alt: 'Xiaomi 15 Ultra Photo 3', category: 'phones', phone: 'xiaomi-15-ultra' },
  { id: 'xiaomi4', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823235/IMG_20250601_183012_dzgcyi.jpg', alt: 'Xiaomi 15 Ultra Photo 4', category: 'phones', phone: 'xiaomi-15-ultra' },
  { id: 'xiaomi5', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823234/photo_3_eolx0r.jpg', alt: 'Xiaomi 15 Ultra Photo 5', category: 'phones', phone: 'xiaomi-15-ultra' },
  { id: 'xiaomi6', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823234/IMG_20250606_203219_l5hqbr.jpg', alt: 'Xiaomi 15 Ultra Photo 6', category: 'phones', phone: 'xiaomi-15-ultra' },
  { id: 'xiaomi7', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823233/IMG_20250529_001734_qqnhka.jpg', alt: 'Xiaomi 15 Ultra Photo 7', category: 'phones', phone: 'xiaomi-15-ultra' },
  { id: 'xiaomi8', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823233/IMG_20250525_174132_gt5nny.jpg', alt: 'Xiaomi 15 Ultra Photo 8', category: 'phones', phone: 'xiaomi-15-ultra' },
  { id: 'xiaomi9', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823232/IMG_20250525_174016_vc8iem.jpg', alt: 'Xiaomi 15 Ultra Photo 9', category: 'phones', phone: 'xiaomi-15-ultra' },
  
  // Oppo Find X8 Pro
  { id: 'oppo1', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753827564/IMG20250419182939_m%C3%A1solata_ga58wf.jpg', alt: 'Oppo Find X8 Pro Photo 1', category: 'phones', phone: 'oppo-find-x8-pro' },
  { id: 'oppo2', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753827563/IMG20250328173140_m%C3%A1solata_x9ojhh.jpg', alt: 'Oppo Find X8 Pro Photo 2', category: 'phones', phone: 'oppo-find-x8-pro' },
  { id: 'oppo3', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753827563/IMG20250416101834_m%C3%A1solata_ez1c65.jpg', alt: 'Oppo Find X8 Pro Photo 3', category: 'phones', phone: 'oppo-find-x8-pro' },
  { id: 'oppo4', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753827562/IMG20250310142942_m%C3%A1solata_wcmdoa.jpg', alt: 'Oppo Find X8 Pro Photo 4', category: 'phones', phone: 'oppo-find-x8-pro' },
  { id: 'oppo5', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753827561/IMG20250309132525_m%C3%A1solata_rpsw0x.jpg', alt: 'Oppo Find X8 Pro Photo 5', category: 'phones', phone: 'oppo-find-x8-pro' },
  { id: 'oppo6', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753827558/IMG20250226114030_m%C3%A1solata_bpkvlb.jpg', alt: 'Oppo Find X8 Pro Photo 6', category: 'phones', phone: 'oppo-find-x8-pro' },
  
  // One Plus 12
  { id: 'oneplus1', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753832161/IMG_20241226_125301_wvryhw.jpg', alt: 'One Plus 12 Photo 1', category: 'phones', phone: 'one-plus-12' },
  { id: 'oneplus2', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753832163/IMG20241221115154_fmfxpp.jpg', alt: 'One Plus 12 Photo 2', category: 'phones', phone: 'one-plus-12' },
  { id: 'oneplus3', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753832164/IMG20241214132118_nie0uy.jpg', alt: 'One Plus 12 Photo 3', category: 'phones', phone: 'one-plus-12' },
  { id: 'oneplus4', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753832165/IMG20241221115829_bazikz.jpg', alt: 'One Plus 12 Photo 4', category: 'phones', phone: 'one-plus-12' },
  { id: 'oneplus5', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753832167/IMG20241221171753_pxfigb.jpg', alt: 'One Plus 12 Photo 5', category: 'phones', phone: 'one-plus-12' },
  { id: 'oneplus6', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753832174/IMG20250110123253_utpgno.jpg', alt: 'One Plus 12 Photo 6', category: 'phones', phone: 'one-plus-12' },
  
  // Honor Magic 6 Pro
  { id: 'honor1', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753898391/IMG_20250210_142541_um7lid.jpg', alt: 'Honor Magic 6 Pro Photo 1', category: 'phones', phone: 'honor-magic-6-pro' },
  { id: 'honor2', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753898386/IMG_20250215_102955_b7kmcz.jpg', alt: 'Honor Magic 6 Pro Photo 2', category: 'phones', phone: 'honor-magic-6-pro' },
  { id: 'honor3', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753898385/IMG_20250210_150551_mlq8ts.jpg', alt: 'Honor Magic 6 Pro Photo 3', category: 'phones', phone: 'honor-magic-6-pro' },
  { id: 'honor4', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753898384/IMG_20250210_142735_h90t5f.jpg', alt: 'Honor Magic 6 Pro Photo 4', category: 'phones', phone: 'honor-magic-6-pro' },
  { id: 'honor5', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753898382/IMG_20250210_142625_l0byoy.jpg', alt: 'Honor Magic 6 Pro Photo 5', category: 'phones', phone: 'honor-magic-6-pro' },
  { id: 'honor6', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753898379/IMG_20250210_142524_z6qwmu.jpg', alt: 'Honor Magic 6 Pro Photo 6', category: 'phones', phone: 'honor-magic-6-pro' },
  
  // Huawei P30 Pro
  { id: 'huawei1', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753899398/IMG_20241214_130131_mlwl2s.jpg', alt: 'Huawei P30 Pro Photo 1', category: 'phones', phone: 'huawei-p30-pro' },
  { id: 'huawei2', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753899396/IMG_20241130_135119_qs17xt.jpg', alt: 'Huawei P30 Pro Photo 2', category: 'phones', phone: 'huawei-p30-pro' },
  { id: 'huawei3', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753899395/IMG_20241020_125540_mgld2w.jpg', alt: 'Huawei P30 Pro Photo 3', category: 'phones', phone: 'huawei-p30-pro' },
  { id: 'huawei4', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753899394/IMG_20240820_163135_npmyaw.jpg', alt: 'Huawei P30 Pro Photo 4', category: 'phones', phone: 'huawei-p30-pro' },
  { id: 'huawei5', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753899392/IMG_20240819_160511_fo12jj.jpg', alt: 'Huawei P30 Pro Photo 5', category: 'phones', phone: 'huawei-p30-pro' },
  { id: 'huawei6', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753899389/IMG_20230708_161725_k7orna.jpg', alt: 'Huawei P30 Pro Photo 6', category: 'phones', phone: 'huawei-p30-pro' },
  
  // Nothing CMF 2 Pro
  { id: 'nothing1', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823233/IMG_20250529_001734_qqnhka.jpg', alt: 'Nothing CMF 2 Pro Photo 1', category: 'phones', phone: 'nothing-cmf-2-pro' },
  { id: 'nothing2', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823233/IMG_20250525_174132_gt5nny.jpg', alt: 'Nothing CMF 2 Pro Photo 2', category: 'phones', phone: 'nothing-cmf-2-pro' },
  { id: 'nothing3', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823232/IMG_20250525_174016_vc8iem.jpg', alt: 'Nothing CMF 2 Pro Photo 3', category: 'phones', phone: 'nothing-cmf-2-pro' },
  { id: 'nothing4', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823242/IMG_20250531_004947_ljmmhk.jpg', alt: 'Nothing CMF 2 Pro Photo 4', category: 'phones', phone: 'nothing-cmf-2-pro' },
  { id: 'nothing5', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823238/IMG_20250529_001749_p4ovrn.jpg', alt: 'Nothing CMF 2 Pro Photo 5', category: 'phones', phone: 'nothing-cmf-2-pro' },
  { id: 'nothing6', src: 'https://res.cloudinary.com/dtteqzgh7/image/upload/v1753823237/IMG_20250531_151750_vhjhnv.jpg', alt: 'Nothing CMF 2 Pro Photo 6', category: 'phones', phone: 'nothing-cmf-2-pro' },
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
  const [isPhotoSwipeOpen, setIsPhotoSwipeOpen] = useState(false);
  const photoSwipeRef = useRef<PhotoSwipe | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  // DISABLED: Function to ensure navbar is always accessible
  // const ensureNavbarAccessibility = useCallback(() => {
  //   const navbar = document.getElementById('navbar');
  //   if (navbar) {
  //     (navbar as HTMLElement).style.zIndex = '9999';
  //     (navbar as HTMLElement).style.position = 'sticky';
  //     (navbar as HTMLElement).style.pointerEvents = 'auto';
  //     
  //     const navbarLinks = navbar.querySelectorAll('a, button');
  //     navbarLinks.forEach(link => {
  //       (link as HTMLElement).style.pointerEvents = 'auto';
  //       (link as HTMLElement).style.zIndex = '10000';
  //       (link as HTMLElement).style.position = 'relative';
  //     });
  //   }
  // }, []);
  
  // DISABLED: Ensure navbar is always on top and clickable
  // useEffect(() => {
  //   ensureNavbarAccessibility();
  //   
  //   // Also ensure PhotoSwipe doesn't interfere when closed
  //   const pswpElements = document.querySelectorAll('.pswp');
  //   pswpElements.forEach(pswp => {
  //     if (!pswp.classList.contains('pswp--open')) {
  //       (pswp as HTMLElement).style.pointerEvents = 'none';
  //       (pswp as HTMLElement).style.zIndex = '-1';
  //     }
  //   });
  // }, [ensureNavbarAccessibility]);
  
  // DISABLED: Periodically ensure navbar accessibility
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     ensureNavbarAccessibility();
  //   }, 1000); // Check every second
  //   
  //   return () => clearInterval(interval);
  // }, [ensureNavbarAccessibility]);

  const openPhotoSwipe = async (image: PhotoImage, category: string) => {
    // Prevent multiple simultaneous initializations
    if (photoSwipeRef.current) {
      try {
        photoSwipeRef.current.destroy();
      } catch (error) {
        // Silent error handling
      }
      photoSwipeRef.current = null;
      
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    let imagesToShow: PhotoImage[];
    
    if (category === 'favorites') {
      imagesToShow = photoData.filter(img => img.category === 'favorites');
    } else {
      imagesToShow = photoData.filter(img => img.phone === category);
    }
    
    const startIndex = imagesToShow.findIndex(img => img.id === image.id);
    
    // Get actual image dimensions for better quality
    const items = await Promise.all(imagesToShow.map(async (img) => {
      const dimensions = await getImageDimensions(img.src);
      return {
        src: img.src,
        width: dimensions.width,
        height: dimensions.height,
        alt: img.alt,
        msrc: img.src, // thumbnail
        title: img.alt,
        w: dimensions.width,
        h: dimensions.height
      };
    }));
    
    try {
      photoSwipeRef.current = new PhotoSwipe({
        dataSource: items,
        index: startIndex,
        showHideAnimationType: 'fade',
        showAnimationDuration: 200,
        hideAnimationDuration: 200,
        easing: 'ease-out',
        allowPanToNext: true,
        zoom: true,
        maxZoomLevel: 4,
        paddingFn: (viewportSize) => {
          return {
            top: 40,
            bottom: 40,
            left: 80,
            right: 80
          };
        },
        closeOnVerticalDrag: true,
        showHideOpacity: true,
        bgOpacity: 0.95,
        spacing: 0.1
      });
      
      // Track PhotoSwipe open/close events
      photoSwipeRef.current.on('uiRegister', function() {
        setIsPhotoSwipeOpen(true);
        
        // Add custom close button
        requestAnimationFrame(() => {
          const pswpElement = document.querySelector('.pswp');
          if (pswpElement && !pswpElement.querySelector('.pswp-close-btn')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'pswp-close-btn';
            closeBtn.innerHTML = '×';
            closeBtn.addEventListener('click', () => {
              if (photoSwipeRef.current) {
                photoSwipeRef.current.close();
              }
            });
            pswpElement.appendChild(closeBtn);
          }
        });
      });
      
      photoSwipeRef.current.on('close', function() {
        setIsPhotoSwipeOpen(false);
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      });
      
      photoSwipeRef.current.init();
    } catch (error) {
      photoSwipeRef.current = null;
    }
  };

  // DISABLED: Mouse position tracking
  // useEffect(() => {
  //   let ticking = false;
  //   
  //   const handleMouseMove = (e: MouseEvent) => {
  //     if (!ticking) {
  //       requestAnimationFrame(() => {
  //         setMousePosition({ x: e.clientX, y: e.clientY });
  //         ticking = false;
  //       });
  //       ticking = true;
  //     }
  //   };
  // 
  //   window.addEventListener('mousemove', handleMouseMove, { passive: true });
  //   return () => window.removeEventListener('mousemove', handleMouseMove);
  // }, []);

  // DISABLED: Smooth mouse follower
  // useEffect(() => {
  //   const smoothFollow = () => {
  //     setSmoothMousePosition(prev => {
  //       const lerp = 0.15;
  //       return {
  //         x: prev.x + (mousePosition.x - prev.x) * lerp,
  //         y: prev.y + (mousePosition.y - prev.y) * lerp
  //       };
  //     });
  //     animationFrameRef.current = requestAnimationFrame(smoothFollow);
  //   };
  // 
  //   animationFrameRef.current = requestAnimationFrame(smoothFollow);
  // 
  //   return () => {
  //     if (animationFrameRef.current) {
  //       cancelAnimationFrame(animationFrameRef.current);
  //     }
  //   };
  // }, [mousePosition]);

  // Inject PhotoSwipe styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = 'photoswipe-custom-styles';
    styleElement.textContent = photoSwipeStyles;
    
    if (!document.getElementById('photoswipe-custom-styles')) {
      document.head.appendChild(styleElement);
    }

    return () => {
      const existingStyle = document.getElementById('photoswipe-custom-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);



  // Cleanup PhotoSwipe on unmount
  useEffect(() => {
    return () => {
      if (photoSwipeRef.current) {
        try {
          photoSwipeRef.current.destroy();
        } catch (error) {
          // Silent error handling
        }
        photoSwipeRef.current = null;
      }
    };
  }, []);

  const favorites = photoData.filter(img => img.category === 'favorites');
  const phoneImages = phoneCategories.map(category => ({
    ...category,
    images: photoData.filter(img => img.phone === category.id)
  }));

  return (
    <div className="relative min-h-screen overflow-visible z-0">
      {/* DISABLED: Mouse follower */}
      {/* <div
        className="hidden md:block fixed pointer-events-none z-20"
        style={{
          left: smoothMousePosition.x - 12,
          top: smoothMousePosition.y - 12,
          transform: 'translate(0, 0)',
          pointerEvents: 'none' // Ensure this never blocks clicks
        }}
      >
        <div className="absolute inset-0 w-6 h-6 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-sm animate-pulse"></div>
        <div className="relative w-6 h-6 bg-gradient-to-br from-blue-500/80 to-purple-600/80 rounded-full border border-white/20 shadow-lg backdrop-blur-sm">
          <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-white/60 rounded-full blur-[1px]"></div>
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-300/80 rounded-full animate-ping"></div>
        </div>
      </div> */}

      <div className="relative z-10 w-full px-4 sm:px-8 py-4 sm:py-6">
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
                 if (!isPhotoSwipeOpen && (window as any).createHoverParticles) {
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
                  data-photoswipe-index={favorites.indexOf(image)}
                  onClick={() => openPhotoSwipe(image, 'favorites')}
                  onMouseEnter={(e) => {
                    if (!isPhotoSwipeOpen && (window as any).createHoverParticles) {
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
                     if (!isPhotoSwipeOpen && (window as any).createHoverParticles) {
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
                      data-photoswipe-index={phoneCategory.images.indexOf(image)}
                      onClick={() => openPhotoSwipe(image, phoneCategory.id)}
                      onMouseEnter={(e) => {
                        if (!isPhotoSwipeOpen && (window as any).createHoverParticles) {
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



      {/* DISABLED: ParticleSystem isPhotoSwipeOpen={isPhotoSwipeOpen} /> */}
    </div>
  );
}
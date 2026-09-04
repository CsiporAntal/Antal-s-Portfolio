"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, MapPin, Briefcase, GraduationCap, Code, Mail, Github, ExternalLink, Cpu, Globe, Cog, Zap, Monitor, Settings, Calendar, Download, User, Layers } from 'lucide-react';
import { metaData, socialLinks } from './lib/config';
import Image from 'next/image';
import { useTheme } from 'next-themes';

// Particle system
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
  type: 'mouse' | 'click' | 'ambient' | 'text' | 'island' | 'clickconnect' | 'texthover' | 'air';
  // Island particle specific properties
  homeX?: number;
  homeY?: number;
  orbitAngle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  attractionStrength?: number; // Added for burst particles
  // Offscreen optimization properties
  staggerIndex?: number; // For staggered updates of offscreen particles
  lastUpdateFrame?: number; // Track when particle was last updated
}

// Theme-aware color palettes
const darkColors = [
  '#8b5cf6', '#a855f7', '#9333ea', '#7c3aed', '#6d28d9',
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
  '#1e293b', '#334155', '#475569', '#64748b', '#475569'
];

const lightColors = [
  '#1e1e1e', '#2d2d2d', '#3d3d3d', '#4a4a4a', '#5a5a5a',
  '#1a1a1a', '#2a2a2a', '#3a3a3a', '#4d4d4d', '#5d5d5d',
  '#0f0f0f', '#1f1f1f', '#2f2f2f', '#3f3f3f', '#4f4f4f'
];

const ParticleSystem = () => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | undefined>(undefined);
  const lastScrollY = useRef(0);
  const profilePictureRef = useRef({ x: 0, y: 0, radius: 100 });
  const lastIslandParticleTime = useRef(0);
  const isMouseNearProfile = useRef(false);
  const lastHoverParticleTime = useRef(0);
  
  // Maximum particle limits
  const maxClickParticles = 50; // Maximum active click particles
  const maxProfileClickParticles = 100; // Maximum active profile click particles
  const maxClickConnectParticles = 30; // Maximum active clickconnect particles
  const maxAirParticles = 20; // Maximum active air particles

  const createParticle = useCallback((x: number, y: number, type: 'mouse' | 'click' | 'ambient' | 'text' | 'island' | 'clickconnect' | 'texthover' | 'air' = 'ambient'): Particle => {
          const baseVelocity = type === 'click' ? 8 : type === 'mouse' ? 3 : type === 'text' ? 2 : type === 'island' ? 0.5 : type === 'clickconnect' ? 1.5 : type === 'texthover' ? 1 : type === 'air' ? 0.8 : 1;
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * baseVelocity + (type === 'island' ? 0.2 : type === 'clickconnect' ? 0.5 : type === 'texthover' ? 0.3 : type === 'air' ? 0.2 : 1);
    
    // Base lifespans
    const baseLife = type === 'click' ? 180 : type === 'mouse' ? 90 : type === 'text' ? 150 : type === 'island' ? 450 : type === 'clickconnect' ? 270 : type === 'texthover' ? 200 : type === 'air' ? 160 : 240;
    
    // Add random variation to lifetime (±20%)
    const lifeVariation = baseLife * 0.2;
    const randomLife = baseLife + (Math.random() - 0.5) * 2 * lifeVariation;
    const finalLife = Math.max(Math.floor(randomLife), Math.floor(baseLife * 0.5)); // Ensure minimum 50% of base life
    
    const particle: Particle = {
      id: Math.random(),
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      size: Math.random() * (type === 'click' ? 6 : type === 'text' ? 5 : type === 'island' ? 3 : type === 'clickconnect' ? 4 : type === 'texthover' ? 3.5 : type === 'air' ? 2.5 : 4) + (type === 'island' ? 1 : type === 'clickconnect' ? 1.5 : type === 'texthover' ? 1.2 : type === 'air' ? 1 : 2),
      life: finalLife,
      maxLife: finalLife,
      color: type === 'air' ? '#f59e0b' : (theme === 'light' ? lightColors : darkColors)[Math.floor(Math.random() * (theme === 'light' ? lightColors.length : darkColors.length))], // Theme-aware colors
      type
    };

    // Island particle specific initialization
    if (type === 'island') {
      particle.homeX = x;
      particle.homeY = y;
      particle.orbitAngle = Math.random() * Math.PI * 2;
      particle.orbitRadius = Math.random() * 30 + 20; // 20-50px orbit radius
      particle.orbitSpeed = (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1); // Random direction
    }
    
    return particle;
  }, []);

  const createTextParticles = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 + window.scrollX; // Add scroll offset
    const centerY = rect.top + rect.height / 2 + window.scrollY; // Add scroll offset
    
    // Create texthover particles around the text that connect to mouse
    for (let i = 0; i < 12; i++) { // More particles for better effect
      const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
      const distance = Math.random() * 80 + 40; // 40-120px from text center
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;
      particlesRef.current.push(createParticle(centerX + offsetX, centerY + offsetY, 'texthover'));
    }
  }, [createParticle]);

  const updateProfilePicturePosition = useCallback(() => {
    // Update profile picture position for island particles
    const profileElement = document.querySelector('[data-profile-picture]') as HTMLElement;
    if (profileElement) {
      const rect = profileElement.getBoundingClientRect();
      profilePictureRef.current = {
        x: rect.left + rect.width / 2 + window.scrollX, // Add scroll offset
        y: rect.top + rect.height / 2 + window.scrollY, // Add scroll offset
        radius: Math.min(rect.width, rect.height) / 2 + 100 // Increased radius from 60 to 100
      };
    }
  }, []);

  const createIslandParticle = useCallback(() => {
    const { x, y, radius } = profilePictureRef.current;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius + 40; // Spawn within radius + 40px
    const spawnX = x + Math.cos(angle) * distance;
    const spawnY = y + Math.sin(angle) * distance;
    
    return createParticle(spawnX, spawnY, 'island');
  }, [createParticle]);

  // Helper functions to check particle counts
  const getParticleCount = useCallback((type: string) => {
    return particlesRef.current.filter(p => p.type === type).length;
  }, []);

  const canCreateParticles = useCallback((type: string, count: number) => {
    const currentCount = getParticleCount(type);
    const maxCount = type === 'click' ? maxClickParticles : 
                    type === 'island' ? maxProfileClickParticles :
                    type === 'clickconnect' ? maxClickConnectParticles :
                    type === 'air' ? maxAirParticles : 100; // Default max for other types
    return currentCount + count <= maxCount;
  }, [getParticleCount, maxClickParticles, maxProfileClickParticles, maxClickConnectParticles, maxAirParticles]);

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    updateProfilePicturePosition();

    // Cache per-frame values
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const { x: profileX, y: profileY, radius: profileRadius } = profilePictureRef.current;
    const { x: mouseScreenX, y: mouseScreenY } = mouseRef.current;
    const mouseWorldX = mouseScreenX + scrollX;
    const mouseWorldY = mouseScreenY + scrollY;
    
    // Compute document dimensions once per frame
    const documentWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const documentHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    
    // Viewport bounds for offscreen optimization (100px margin)
    const viewportLeft = scrollX - 100;
    const viewportRight = scrollX + window.innerWidth + 100;
    const viewportTop = scrollY - 100;
    const viewportBottom = scrollY + window.innerHeight + 100;
    
    // Check if mouse is near profile picture using squared distance
    const distanceToProfileSquared = (mouseWorldX - profileX) ** 2 + (mouseWorldY - profileY) ** 2;
    const profileRadiusSquared = (profileRadius + 50) ** 2; // 50px buffer around profile
    const wasNearProfile = isMouseNearProfile.current;
    isMouseNearProfile.current = distanceToProfileSquared < profileRadiusSquared;

    // Generate hover particles when mouse is near profile
    if (isMouseNearProfile.current) {
      const now = Date.now();
      if (now - lastHoverParticleTime.current > 200) { // Every 200ms when hovering
        // Create 2-3 extra particles when hovering (with limit)
        const extraParticles = Math.floor(Math.random() * 2) + 2;
        if (canCreateParticles('island', extraParticles)) {
          for (let i = 0; i < extraParticles; i++) {
            particlesRef.current.push(createIslandParticle());
          }
        }
        lastHoverParticleTime.current = now;
      }
    }

    // Track current frame for staggered updates
    const currentFrame = performance.now();

    particlesRef.current = particlesRef.current.filter(particle => {
      // Check if particle is offscreen
      const isOffscreen = particle.x < viewportLeft || particle.x > viewportRight || 
                         particle.y < viewportTop || particle.y > viewportBottom;
      
      // Initialize stagger properties if not set
      if (particle.staggerIndex === undefined) {
        particle.staggerIndex = Math.floor(Math.random() * 3); // 0, 1, or 2
      }
      if (particle.lastUpdateFrame === undefined) {
        particle.lastUpdateFrame = currentFrame;
      }
      
            // Skip physics update for offscreen particles based on stagger
      const shouldUpdatePhysics = !isOffscreen || 
        (currentFrame - particle.lastUpdateFrame) > 16.67 * 3; // Update every 3rd frame (50ms) for offscreen particles
      
      if (shouldUpdatePhysics) {
        particle.lastUpdateFrame = currentFrame;
        
        // Update position based on particle type
        if (particle.type === 'island') {
          // Island particle behavior - use squared distance for threshold comparison
          const mouseDistanceSquared = (particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2;
          const attractionRadiusSquared = 120 ** 2;
          
          if (mouseDistanceSquared < attractionRadiusSquared) {
            // Gentle attraction to mouse when close
            const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
            const baseAttractionStrength = particle.attractionStrength || 0.03; // Use custom strength for burst particles
            const attractionStrength = (120 - mouseDistance) / 120 * baseAttractionStrength;
            const angleToMouse = Math.atan2(mouseWorldY - particle.y, mouseWorldX - particle.x);
            particle.vx += Math.cos(angleToMouse) * attractionStrength;
            particle.vy += Math.sin(angleToMouse) * attractionStrength;
          } else {
            // Orbital movement around home position
            if (particle.homeX && particle.homeY && particle.orbitAngle !== undefined && particle.orbitRadius && particle.orbitSpeed) {
              particle.orbitAngle += particle.orbitSpeed;
              const targetX = particle.homeX + Math.cos(particle.orbitAngle) * particle.orbitRadius;
              const targetY = particle.homeY + Math.sin(particle.orbitAngle) * particle.orbitRadius;
              
              // Gentle movement towards orbit position
              particle.vx += (targetX - particle.x) * 0.02;
              particle.vy += (targetY - particle.y) * 0.02;
            }
          }
          
          // Apply gentle drift back towards profile area using squared distance
          const distanceFromProfileSquared = (particle.x - profileX) ** 2 + (particle.y - profileY) ** 2;
          const profileRadiusSquared = profilePictureRef.current.radius ** 2;
          if (distanceFromProfileSquared > profileRadiusSquared) {
            const returnStrength = 0.01;
            const angleToProfile = Math.atan2(profileY - particle.y, profileX - particle.x);
            particle.vx += Math.cos(angleToProfile) * returnStrength;
            particle.vy += Math.sin(angleToProfile) * returnStrength;
          }
          
          // Apply velocity with damping
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.95; // More damping for island particles
          particle.vy *= 0.95;
        } else if (particle.type === 'clickconnect') {
          // Click-connect particles - attracted to mouse using squared distance
          const mouseDistanceSquared = (particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2;
          const attractionRadiusSquared = 150 ** 2;
          
          if (mouseDistanceSquared < attractionRadiusSquared) {
            // Gentle attraction to mouse
            const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
            const attractionStrength = (150 - mouseDistance) / 150 * 0.08;
            const angleToMouse = Math.atan2(mouseWorldY - particle.y, mouseWorldX - particle.x);
            particle.vx += Math.cos(angleToMouse) * attractionStrength;
            particle.vy += Math.sin(angleToMouse) * attractionStrength;
          }
          
          // Apply velocity with light damping
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.98;
          particle.vy *= 0.98;
          
          // Light gravity
          particle.vy += 0.05;
        } else if (particle.type === 'texthover') {
          // Text hover particles - attracted to mouse using squared distance
          const mouseDistanceSquared = (particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2;
          const attractionRadiusSquared = 200 ** 2;
          
          if (mouseDistanceSquared < attractionRadiusSquared) {
            // Gentle attraction to mouse
            const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
            const attractionStrength = (200 - mouseDistance) / 200 * 0.06;
            const angleToMouse = Math.atan2(mouseWorldY - particle.y, mouseWorldX - particle.x);
            particle.vx += Math.cos(angleToMouse) * attractionStrength;
            particle.vy += Math.sin(angleToMouse) * attractionStrength;
          }
          
          // Apply velocity with light damping
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.97;
          particle.vy *= 0.97;
          
          // Very light gravity
          particle.vy += 0.03;
        } else if (particle.type === 'air') {
          // Air particles - drift towards mouse with stronger attraction using squared distance
          const mouseDistanceSquared = (particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2;
          const attractionRadiusSquared = 300 ** 2; // Increased from 250
          
          if (mouseDistanceSquared < attractionRadiusSquared) {
            const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
            const attractionStrength = (300 - mouseDistance) / 300 * 0.08; // Increased from 0.04
            const angleToMouse = Math.atan2(mouseWorldY - particle.y, mouseWorldX - particle.x);
            particle.vx += Math.cos(angleToMouse) * attractionStrength;
            particle.vy += Math.sin(angleToMouse) * attractionStrength;
          }
          
          // Apply velocity with light damping
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.98;
          particle.vy *= 0.98;
          
          // Much lighter gravity - fall slower
          particle.vy += 0.005; // Reduced from 0.02 for slower falling
        } else {
          // Regular particle behavior
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          // Apply gravity and friction
          particle.vy += 0.1;
          particle.vx *= 0.99;
          particle.vy *= 0.99;
          
          // Special effects for text particles
          if (particle.type === 'text') {
            particle.vy -= 0.05; // Float upward slightly
          }
        }
        
        // Bounce off edges (except for island particles which should stay near profile)
        if (particle.type !== 'island') {
          if (particle.x <= 0 || particle.x >= documentWidth) {
            particle.vx *= -0.8;
            particle.x = Math.max(0, Math.min(documentWidth, particle.x));
          }
          if (particle.y <= 0 || particle.y >= documentHeight) {
            particle.vy *= -0.8;
            particle.y = Math.max(0, Math.min(documentHeight, particle.y));
          }
        }
      }
      
      // Decrease life (always, regardless of physics update)
      particle.life--;
      
      return particle.life > 0;
    });

    // Emergency particle creation - ensure we never have zero island particles
    const islandParticles = particlesRef.current.filter(p => p.type === 'island');
    if (islandParticles.length === 0) {
      // Immediately create minimum particles
      for (let i = 0; i < 8; i++) {
        particlesRef.current.push(createIslandParticle());
      }
    }
  }, [updateProfilePicturePosition, createIslandParticle]);

  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Cache per-frame values
    const now = performance.now();
    const w = canvas.width;
    const h = canvas.height;
    const canvasRect = canvas.getBoundingClientRect();
    const canvasOriginX = canvasRect.left + window.scrollX;
    const canvasOriginY = canvasRect.top + window.scrollY;

    // Ensure proper rendering properties
    ctx.globalCompositeOperation = 'source-over';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, w, h);
    
    particlesRef.current.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const size = particle.size * alpha;
      
      // Draw in page-relative canvas coordinates. The absolute canvas scrolls
      // with the document, preventing a one-frame snap after browser scrolling.
      const screenX = particle.x - canvasOriginX;
      const screenY = particle.y - canvasOriginY;
      
      // Only draw particles that are visible on screen
      if (screenX < -50 || screenX > w + 50 || screenY < -50 || screenY > h + 50) {
        return; // Skip particles outside viewport
      }
      
      // Create gradient with theme-aware opacity for better visibility
      const gradient = ctx.createRadialGradient(
        screenX, screenY, 0,
        screenX, screenY, size
      );
      // Much higher opacity for light theme to ensure visibility
      const enhancedAlpha = theme === 'light' ? Math.min(alpha * 3.0, 1) : Math.min(alpha * 1.5, 1);
      gradient.addColorStop(0, `${particle.color}${Math.floor(enhancedAlpha * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${particle.color}00`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add special effects for different particle types with theme-aware opacity
      if (particle.type === 'click' && alpha > 0.5) {
        const enhancedAlpha = theme === 'light' ? Math.min(alpha * 3.0, 1) : Math.min(alpha * 1.5, 1);
        ctx.strokeStyle = `${particle.color}${Math.floor(enhancedAlpha * 128).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      if (particle.type === 'text' && alpha > 0.3) {
        const enhancedAlpha = theme === 'light' ? Math.min(alpha * 3.0, 1) : Math.min(alpha * 1.5, 1);
        ctx.strokeStyle = `${particle.color}${Math.floor(enhancedAlpha * 100).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Special effects for island particles
      if (particle.type === 'island') {
        // Add a subtle pulsing glow with theme-aware opacity
        const enhancedAlpha = theme === 'light' ? Math.min(alpha * 3.0, 1) : Math.min(alpha * 1.5, 1);
        const pulseAlpha = (Math.sin(Date.now() * 0.005 + particle.id) + 1) * 0.5 * enhancedAlpha * 0.4;
        ctx.strokeStyle = `${particle.color}${Math.floor(pulseAlpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 1.8, 0, Math.PI * 2);
        ctx.stroke();

        // Draw connection to mouse if close
        const mouseScreenX = mouseRef.current.x + window.scrollX - canvasOriginX;
        const mouseScreenY = mouseRef.current.y + window.scrollY - canvasOriginY;
        const mouseDistanceSquared = (screenX - mouseScreenX) ** 2 + (screenY - mouseScreenY) ** 2;
        const connectionRadiusSquared = 120 ** 2;
        if (mouseDistanceSquared < connectionRadiusSquared) {
          const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
          const connectionAlpha = (120 - mouseDistance) / 120 * (theme === 'light' ? 0.9 : 0.7);
          ctx.strokeStyle = `rgba(139, 92, 246, ${connectionAlpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(mouseScreenX, mouseScreenY);
          ctx.stroke();
        }
      }

      // Special effects for clickconnect particles
      if (particle.type === 'clickconnect') {
        // Add a bright glow with theme-aware opacity
        const enhancedAlpha = theme === 'light' ? Math.min(alpha * 3.0, 1) : Math.min(alpha * 1.5, 1);
        const glowAlpha = enhancedAlpha * 0.5;
        ctx.strokeStyle = `${particle.color}${Math.floor(glowAlpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 2.2, 0, Math.PI * 2);
        ctx.stroke();

        // Always draw connection to mouse
        const mouseScreenX = mouseRef.current.x + window.scrollX - canvasOriginX;
        const mouseScreenY = mouseRef.current.y + window.scrollY - canvasOriginY;
        const mouseDistanceSquared = (screenX - mouseScreenX) ** 2 + (screenY - mouseScreenY) ** 2;
        const connectionRadiusSquared = 150 ** 2;
        if (mouseDistanceSquared < connectionRadiusSquared) {
          const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
          const connectionAlpha = (150 - mouseDistance) / 150 * (theme === 'light' ? 0.95 : 0.8);
          ctx.strokeStyle = `rgba(59, 130, 246, ${connectionAlpha})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(mouseScreenX, mouseScreenY);
          ctx.stroke();
        }
      }

      // Special effects for texthover particles
      if (particle.type === 'texthover') {
        // Add a golden glow with theme-aware opacity
        const enhancedAlpha = theme === 'light' ? Math.min(alpha * 3.0, 1) : Math.min(alpha * 1.5, 1);
        const glowAlpha = enhancedAlpha * 0.45;
        ctx.strokeStyle = `rgba(245, 158, 11, ${glowAlpha})`; // Amber color
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
        ctx.stroke();

        // Draw connection to mouse when close
        const mouseScreenX = mouseRef.current.x + window.scrollX - canvasOriginX;
        const mouseScreenY = mouseRef.current.y + window.scrollY - canvasOriginY;
        const mouseDistanceSquared = (screenX - mouseScreenX) ** 2 + (screenY - mouseScreenY) ** 2;
        const connectionRadiusSquared = 200 ** 2;
        if (mouseDistanceSquared < connectionRadiusSquared) {
          const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
          const connectionAlpha = (200 - mouseDistance) / 200 * (theme === 'light' ? 0.95 : 0.8);
          ctx.strokeStyle = `rgba(245, 158, 11, ${connectionAlpha})`; // Amber connection lines
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(mouseScreenX, mouseScreenY);
          ctx.stroke();
        }
      }

      // Special effects for air particles
      if (particle.type === 'air') {
        // Add a subtle pulsing glow with theme-aware opacity
        const enhancedAlpha = theme === 'light' ? Math.min(alpha * 3.0, 1) : Math.min(alpha * 1.5, 1);
        const pulseAlpha = (Math.sin(Date.now() * 0.005 + particle.id) + 1) * 0.5 * enhancedAlpha * 0.4;
        ctx.strokeStyle = `rgba(245, 158, 11, ${pulseAlpha})`; // Amber color
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 1.8, 0, Math.PI * 2);
        ctx.stroke();

        // Draw connection to mouse if close
        const mouseScreenX = mouseRef.current.x + window.scrollX - canvasOriginX;
        const mouseScreenY = mouseRef.current.y + window.scrollY - canvasOriginY;
        const mouseDistanceSquared = (screenX - mouseScreenX) ** 2 + (screenY - mouseScreenY) ** 2;
        const connectionRadiusSquared = 300 ** 2; // Increased from 250 to match attraction radius
        if (mouseDistanceSquared < connectionRadiusSquared) {
          const mouseDistance = Math.sqrt(mouseDistanceSquared); // Only calculate sqrt when needed
          const connectionAlpha = (300 - mouseDistance) / 300 * (theme === 'light' ? 0.98 : 0.9); // Much higher connection strength for light theme
          ctx.strokeStyle = `rgba(245, 158, 11, ${connectionAlpha})`; // Amber connection lines
          ctx.lineWidth = 2.5; // Thicker connection lines
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(mouseScreenX, mouseScreenY);
          ctx.stroke();
        }
      }
    });

    // Draw connections between nearby particles (enhanced for island particles)
    const connectionDistance = 100;
    for (let i = 0; i < particlesRef.current.length; i++) {
      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const p1 = particlesRef.current[i];
        const p2 = particlesRef.current[j];
        
        // Convert to screen coordinates
        const p1ScreenX = p1.x - canvasOriginX;
        const p1ScreenY = p1.y - canvasOriginY;
        const p2ScreenX = p2.x - canvasOriginX;
        const p2ScreenY = p2.y - canvasOriginY;
        
        // Skip if either particle is off-screen
        if (p1ScreenX < -50 || p1ScreenX > w + 50 || p1ScreenY < -50 || p1ScreenY > h + 50 ||
            p2ScreenX < -50 || p2ScreenX > w + 50 || p2ScreenY < -50 || p2ScreenY > h + 50) {
          continue;
        }
        
        const distanceSquared = (p1ScreenX - p2ScreenX) ** 2 + (p1ScreenY - p2ScreenY) ** 2;
        const connectionDistanceSquared = connectionDistance ** 2;
        
        if (distanceSquared < connectionDistanceSquared) {
          const distance = Math.sqrt(distanceSquared); // Only calculate sqrt when needed
          let alpha = (1 - distance / connectionDistance) * (theme === 'light' ? 0.8 : 0.5); // Much higher opacity for light theme
          
          // Stronger connections for island particles
          if (p1.type === 'island' && p2.type === 'island') {
            alpha *= 1.5;
          }
          
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
          ctx.lineWidth = (p1.type === 'island' && p2.type === 'island') ? 1.5 : 1;
          ctx.beginPath();
          ctx.moveTo(p1ScreenX, p1ScreenY);
          ctx.lineTo(p2ScreenX, p2ScreenY);
          ctx.stroke();
        }
      }
    }
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
      const parent = canvas.parentElement;
      const width = window.innerWidth;
      const height = Math.ceil(parent?.scrollHeight ?? window.innerHeight);

      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Store mouse position in screen coordinates for drawing connections
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (e: MouseEvent) => {
      // Check if the click target is a link or inside a link
      const target = e.target as HTMLElement;
      const isLink = target.closest('a') !== null;
      
      // Don't create particles if clicking on a link (will redirect)
      if (isLink) {
        return;
      }
      
      // Check if click is on profile picture
      const profileElement = document.querySelector('[data-profile-picture]') as HTMLElement;
      let isProfileClick = false;
      
      if (profileElement) {
        const rect = profileElement.getBoundingClientRect();
        const clickX = e.clientX;
        const clickY = e.clientY;
        isProfileClick = clickX >= rect.left && clickX <= rect.right && clickY >= rect.top && clickY <= rect.bottom;
      }
      
      if (!isProfileClick) {
        // Create clickconnect particles for general clicks in world coordinates (with limit)
        if (canCreateParticles('clickconnect', 4)) {
          for (let i = 0; i < 4; i++) { // Reduced from 8 to 4 (50% less)
            const angle = (i / 4) * Math.PI * 2 + Math.random() * 0.3;
            const distance = Math.random() * 60 + 20; // 20-80px from click point
            const spawnX = e.clientX + window.scrollX + Math.cos(angle) * distance;
            const spawnY = e.clientY + window.scrollY + Math.sin(angle) * distance;
            particlesRef.current.push(createParticle(spawnX, spawnY, 'clickconnect'));
          }
        }
        
        // Add a few amber air particles (with limit)
        if (canCreateParticles('air', 2)) {
          for (let i = 0; i < 2; i++) { // Reduced from 4 to 2 (50% less)
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 40 + 10; // 10-50px from click point
            const spawnX = e.clientX + window.scrollX + Math.cos(angle) * distance;
            const spawnY = e.clientY + window.scrollY + Math.sin(angle) * distance;
            particlesRef.current.push(createParticle(spawnX, spawnY, 'air'));
          }
        }
      }
      
      // Original click explosion effect (for non-profile clicks) in world coordinates (with limit)
      if (!isProfileClick) {
        if (canCreateParticles('click', 8)) {
          for (let i = 0; i < 8; i++) { // Reduced from 15 to 8 (50% less)
            particlesRef.current.push(createParticle(e.clientX + window.scrollX, e.clientY + window.scrollY, 'click'));
          }
        }
      }
    };

    const handleScroll = () => {
      // Scroll particles removed - keeping only the scroll tracking
      const currentScrollY = window.scrollY;
      lastScrollY.current = currentScrollY;
    };

    const handleResize = () => {
      resizeCanvas();
    };

    // Add some ambient particles
    const addAmbientParticles = () => {
      // Limit ambient particles to prevent too many
      if (getParticleCount('ambient') < 15 && particlesRef.current.length < 100) {
        particlesRef.current.push(createParticle(
          window.scrollX + Math.random() * window.innerWidth,
          window.scrollY + Math.random() * window.innerHeight,
          'ambient'
        ));
      }
    };

    resizeCanvas();
    
    // Add initial ambient particles
    for (let i = 0; i < 15; i++) {
      addAmbientParticles();
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    
    // Add ambient particles more frequently
    const ambientInterval = setInterval(addAmbientParticles, 800);
    
    // Island particle lifecycle management
    const manageIslandParticles = () => {
      const islandParticles = particlesRef.current.filter(p => p.type === 'island');
      const maxIslandParticles = isMouseNearProfile.current ? 30 : 20; // More when hovering
      const minIslandParticles = 15; // Increased minimum to prevent gaps
      
      // Ensure we always have minimum particles - create immediately if needed
      if (islandParticles.length < minIslandParticles) {
        const needed = minIslandParticles - islandParticles.length;
        const canCreate = canCreateParticles('island', needed);
        const actualNeeded = canCreate ? needed : Math.max(0, maxProfileClickParticles - getParticleCount('island'));
        for (let i = 0; i < actualNeeded; i++) {
          particlesRef.current.push(createIslandParticle());
        }
      }
      
      // Randomly add particles up to maximum (increased probability)
      if (islandParticles.length < maxIslandParticles && Math.random() < 0.7) {
        if (canCreateParticles('island', 1)) {
          particlesRef.current.push(createIslandParticle());
        }
      }
      
      // More conservative particle killing to prevent gaps
      if (islandParticles.length > maxIslandParticles && Math.random() < 0.05) {
        const oldestParticle = islandParticles.reduce((oldest, current) => 
          current.life < oldest.life ? current : oldest
        );
        // Only kill if we have plenty of particles
        if (islandParticles.length > minIslandParticles + 3) {
          oldestParticle.life = Math.min(oldestParticle.life, 30); // Force death soon
        }
      }
    };
    
    const islandInterval = setInterval(manageIslandParticles, 400); // Even more frequent
    
    // Initialize island particles (more initial particles)
    setTimeout(() => {
      updateProfilePicturePosition();
      const initialCount = Math.min(18, maxProfileClickParticles - getParticleCount('island'));
      for (let i = 0; i < initialCount; i++) { // Even more initial particles
        particlesRef.current.push(createIslandParticle());
      }
    }, 500); // Wait for profile picture to be rendered

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      clearInterval(ambientInterval);
      clearInterval(islandInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, createParticle, createIslandParticle, updateProfilePicturePosition, getParticleCount, canCreateParticles]);

  const createProfileClickEffect = useCallback(() => {
    const { x: profileX, y: profileY } = profilePictureRef.current;
    const burstRadius = 500; // Even bigger radius (was 300)
    const particleCount = 45; // More particles for bigger effect
    
    // Check if we can create the full burst effect
    if (!canCreateParticles('island', particleCount)) {
      // If we can't create the full burst, create a reduced version
      const availableSlots = maxProfileClickParticles - getParticleCount('island');
      const reducedCount = Math.max(10, Math.floor(availableSlots * 0.8)); // At least 10 particles, or 80% of available slots
      
      if (reducedCount <= 0) {
        return; // Don't create any particles if no slots available
      }
      
      // Create reduced burst effect
      for (let i = 0; i < reducedCount; i++) {
        const angle = (i / reducedCount) * Math.PI * 2 + Math.random() * 0.5;
        const distance = Math.random() * burstRadius + 120;
        const spawnX = profileX + Math.cos(angle) * distance;
        const spawnY = profileY + Math.sin(angle) * distance;
        
        const particle = createParticle(spawnX, spawnY, 'island');
        const burstVelocity = 5 + Math.random() * 4;
        particle.vx = Math.cos(angle) * burstVelocity;
        particle.vy = Math.sin(angle) * burstVelocity;
        
        const baseLife = 600;
        const shouldLiveLonger = Math.random() < 0.3;
        const finalLife = shouldLiveLonger ? baseLife * 2 : baseLife;
        
        particle.life = finalLife;
        particle.maxLife = finalLife;
        particle.attractionStrength = 0.08;
        
        particlesRef.current.push(particle);
      }
      return;
    }
    
    // Create full burst effect
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5; // Spread evenly with some randomness
      const distance = Math.random() * burstRadius + 120; // 120-620px from center (was 80-380)
      const spawnX = profileX + Math.cos(angle) * distance;
      const spawnY = profileY + Math.sin(angle) * distance;
      
      // Create particle with higher initial velocity for burst effect
      const particle = createParticle(spawnX, spawnY, 'island');
      // Add extra velocity for burst effect
      const burstVelocity = 5 + Math.random() * 4; // Higher velocity (was 4 + 3)
      particle.vx = Math.cos(angle) * burstVelocity;
      particle.vy = Math.sin(angle) * burstVelocity;
      
      // Randomly make some particles live twice as long
      const baseLife = 600;
      const shouldLiveLonger = Math.random() < 0.3; // 30% chance for double life
      const finalLife = shouldLiveLonger ? baseLife * 2 : baseLife; // 1200 frames (20 seconds) for lucky particles
      
      particle.life = finalLife;
      particle.maxLife = finalLife;
      
      // Make burst particles more attracted to mouse
      particle.attractionStrength = 0.08; // Custom property for stronger attraction
      
      particlesRef.current.push(particle);
    }
  }, [createParticle, canCreateParticles, getParticleCount, maxProfileClickParticles]);

  // Expose functions for external use
  useEffect(() => {
    (window as any).createTextParticles = createTextParticles;
    (window as any).createProfileClickEffect = createProfileClickEffect;
  }, [createTextParticles, createProfileClickEffect]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-1/2 w-screen h-full -translate-x-1/2 pointer-events-none z-10"
      style={{ background: 'transparent' }}
    />
  );
};

const AnimatedSection = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
      <div className={`transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}>
        {children}
      </div>
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
          // Reset visibility when element leaves viewport so animation can play again
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
      case 'dive':
        return isVisible 
          ? 'translate-y-0 opacity-100 scale-100 rotate-0' 
          : 'translate-y-16 opacity-0 scale-90 rotate-3';
      case 'float':
        return isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-8 opacity-0 scale-105';
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

export default function EnhancedPortfolio() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollIndicator(window.scrollY < 100);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const skills = [
    { name: 'PLC Programming', icon: Cpu },
    { name: 'Industrial Automation', icon: Cog },
    { name: 'Control Systems', icon: Settings },
    { name: 'Web Development', icon: Monitor },
    { name: 'React', icon: Code },
    { name: 'Next.js', icon: Globe }
  ];

  const workItems = [
    {
      role: 'CEO / Administrator',
      company: {
        name: 'Antratech S.R.L.',
        url: 'https://antratech.ro',
        className: 'company-link company-link-antratech',
      },
      period: '2025 - Now',
      description: 'Leading company operations, strategy, client relationships, and the delivery of software development projects.',
      icon: Briefcase,
    },
    {
      role: 'PLC Programmer',
      company: {
        name: 'Aages S.A.',
        url: 'https://www.aages.ro',
        className: 'company-link company-link-aages',
      },
      period: 'Full-time • 2023 - Now',
      description: 'Developing and maintaining industrial automation systems, programming PLCs, and ensuring optimal performance of manufacturing processes.',
      icon: Cog,
    },
    {
      role: 'Event Manager',
      company: {
        name: 'Moments & More S.R.L.',
        url: 'https://momentsandmore.ro',
        className: 'company-link company-link-moments',
      },
      period: 'Part-time • 2025 - Now',
      description: 'Organizing festivals and events while managing websites, registration flows, digital promotion, and on-site technical systems.',
      icon: Calendar,
    },
  ];

  const educationItems = [
    {
      title: 'Computer Engineering',
      institution: 'Sapientia University',
      location: 'Târgu Mureș, Romania',
      description: 'Developed a strong foundation in both software and hardware automation, preparing me for the intersection of industrial systems and modern technology.',
      icon: Monitor,
    },
    {
      title: 'Electrical Engineering Studies',
      institution: 'Electromaros Liceum',
      location: 'Târgu Mureș, Romania',
      description: 'Studied electrical circuits, electronics, and electrical engineering principles, providing a solid foundation in electrical systems and circuit design.',
      icon: Settings,
    },
  ];

  const aboutParagraphs = [
    "I'm passionate about bridging the gap between industrial automation and modern web technologies. I bring structure and logic to everything I build, from control systems to responsive web interfaces.",
    "When I'm not coding, you'll find me exploring new technologies, contributing to personal projects, or diving deep into the latest automation innovations.",
  ];

  return (
      <div className="relative min-h-screen overflow-visible">
        <div className="home-edge-bubbles" aria-hidden="true">
          <span className="home-edge-bubble home-edge-bubble-1" />
          <span className="home-edge-bubble home-edge-bubble-2" />
          <span className="home-edge-bubble home-edge-bubble-3" />
          <span className="home-edge-bubble home-edge-bubble-4" />
          <span className="home-edge-bubble home-edge-bubble-5" />
          <span className="home-edge-bubble home-edge-bubble-6" />
        </div>
        {/* Custom CSS for fantasy wiggly circle animation */}
        <style jsx>{`
          @keyframes purple-wiggle {
            0% { 
              border-radius: 70% 30% 40% 60% / 60% 40% 70% 30%;
              transform: rotate(0deg) scale(1);
            }
            25% { 
              border-radius: 40% 70% 30% 60% / 30% 70% 40% 60%;
              transform: rotate(90deg) scale(1.05);
            }
            50% { 
              border-radius: 60% 40% 70% 30% / 70% 30% 60% 40%;
              transform: rotate(180deg) scale(0.95);
            }
            75% { 
              border-radius: 30% 60% 40% 70% / 40% 60% 30% 70%;
              transform: rotate(270deg) scale(1.1);
            }
            100% { 
              border-radius: 70% 30% 40% 60% / 60% 40% 70% 30%;
              transform: rotate(360deg) scale(1);
            }
          }
          
          @keyframes purple-hover {
            0% { 
              border-radius: 30% 70% 60% 40% / 40% 60% 30% 70%;
              transform: rotate(0deg) scale(1.2);
            }
            33% { 
              border-radius: 70% 30% 40% 60% / 60% 40% 70% 30%;
              transform: rotate(120deg) scale(1.3);
            }
            66% { 
              border-radius: 40% 60% 30% 70% / 30% 70% 40% 60%;
              transform: rotate(240deg) scale(1.1);
            }
            100% { 
              border-radius: 30% 70% 60% 40% / 40% 60% 30% 70%;
              transform: rotate(360deg) scale(1.2);
            }
          }
          
          @keyframes purple-glow {
            0%, 100% { 
              box-shadow: 
                0 0 20px rgba(147, 51, 234, 0.3),
                0 0 40px rgba(147, 51, 234, 0.2),
                0 0 60px rgba(147, 51, 234, 0.1);
            }
            50% { 
              box-shadow: 
                0 0 30px rgba(147, 51, 234, 0.5),
                0 0 60px rgba(147, 51, 234, 0.3),
                0 0 90px rgba(147, 51, 234, 0.2);
            }
          }
          
          @keyframes island-pulse {
            0%, 100% { 
              transform: scale(1) rotate(0deg);
              opacity: 0.15;
            }
            50% { 
              transform: scale(1.02) rotate(0.5deg);
              opacity: 0.25;
            }
          }
          
          @keyframes heartbeat {
            0%, 100% { 
              transform: scale(1);
              opacity: 0.3;
            }
            50% { 
              transform: scale(1.15);
              opacity: 0.6;
            }
          }
          
          .purple-circle {
            animation: purple-wiggle 10s ease-in-out infinite;
          }
          
          .purple-circle:hover {
            animation: purple-hover 2.5s ease-in-out infinite;
          }
          
          .purple-glow {
            animation: purple-glow 3s ease-in-out infinite;
          }
          
          .island-background {
            animation: island-pulse 6s ease-in-out infinite;
          }
          
          .heartbeat-shadow {
            animation: heartbeat 2s ease-in-out infinite;
          }
        `}</style>

        <div className="relative z-15 w-full px-2 sm:px-8 py-3 sm:py-6">
          {/* Hero Section */}
          <AnimatedSection className="text-center mb-16 mt-2">
            <div className="relative mb-12 py-6 px-4 sm:py-8 sm:px-8">
              {/* Secondary Glow Layer - Background only, no hover interaction */}
              <div className="absolute inset-0 w-56 h-56 mx-auto bg-gradient-to-r from-purple-600/40 to-purple-800/40 dark:from-purple-400/30 dark:to-purple-600/30 rounded-full blur-xl transition-all duration-1000 top-0 left-0 right-0 bottom-0 pointer-events-none heartbeat-shadow"></div>
              
              {/* Profile Picture Container - Only this triggers hover effects */}
              <div 
                className="group relative w-40 h-40 rounded-full mx-auto border-4 border-purple-300/40 dark:border-purple-400/50 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden transition-all duration-500 hover:scale-105 z-20 cursor-pointer select-none"
                data-profile-picture
                onClick={() => {
                  if ((window as any).createProfileClickEffect) {
                    (window as any).createProfileClickEffect();
                  }
                }}
              >
                <Image
                  src={metaData.ogImage}
                  alt={metaData.name}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover rounded-full"
                  priority
                />
              </div>
            </div>

            <div className="mt-8">
              <h1 
                className="artistic-display text-4xl md:text-5xl lg:text-6xl leading-[1.2] pb-1 mb-6 select-none"
              >
                Hi, I'm {metaData.title.replace("'s Portfolio", "")}
                <span 
                  className="inline-block ml-4 text-3xl md:text-4xl relative select-none"
                  style={{ 
                    animation: 'wave 2s ease-in-out infinite',
                    transformOrigin: '70% 70%',
                    color: '#f59e0b', // Amber color to make it visible
                    top: '-0.2em' // Move the hand higher
                  }}
                >
                  👋
                </span>
              </h1>

              <p className="organic-copy text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                {metaData.description}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="glass-button flex items-center justify-center gap-2 px-6 py-3 font-medium"
              >
                <Github size={20} />
                GitHub
              </a>
              <a
                  href={`mailto:${socialLinks.email}`}
                    className="glass-button glass-button-amethyst flex items-center justify-center gap-2 px-6 py-3 font-medium"
              >
                <Mail size={20} />
                Get in Touch
              </a>
              <a
                  href="/Csipor_Antal_CV.pdf"
                  download
                  className="glass-button glass-button-sage flex items-center justify-center gap-2 px-6 py-3 font-medium"
              >
                <Download size={20} />
                Download Resume
              </a>
              </div>
            </div>
          </AnimatedSection>

          {/* Scroll Indicator */}
          {showScrollIndicator && (
              <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-40">
                <ChevronDown className="text-blue-400" size={24} />
              </div>
          )}

          <div className="hidden">
            <span className="variant-choice-number">01</span>
            <div>
              <p className="variant-choice-name">Original</p>
              <h2 className="organic-heading text-xl md:text-2xl">Original layout</h2>
            </div>
          </div>

          {/* About Section */}
          <ScrollTriggeredSection animationType="slideUp" className="hidden">
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-2 sm:p-6 md:p-8 border border-blue-200/50 dark:border-white/10 hover:border-blue-300/70 dark:hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20"
                 onMouseEnter={(e) => {
                   if ((window as any).createHoverParticles) {
                     (window as any).createHoverParticles(e.currentTarget);
                   }
                 }}
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Code className="text-blue-500 dark:text-blue-400 sm:w-7 sm:h-7" size={24} />
                <h2 className="organic-heading text-2xl md:text-3xl">About Me</h2>
              </div>
              <div className="relative">
                <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-transparent"></div>
                <div className="pl-8 sm:pl-16 relative">
                  <div className="absolute left-[-17px] sm:left-[-41px] top-2 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start gap-3 p-2 sm:p-4 bg-blue-100/40 dark:bg-blue-500/20 rounded-lg hover:bg-blue-200/50 dark:hover:bg-blue-500/30 transition-colors duration-300">
                        <MapPin className="text-blue-500 dark:text-blue-400 mt-1 flex-shrink-0 sm:w-5 sm:h-5" size={18} />
                        <div>
                          <p className="text-slate-600 dark:text-gray-300">
                            Based in <span className="text-blue-600 dark:text-blue-400 font-semibold">Mureș, Romania</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 sm:p-4 bg-sky-100/55 dark:bg-sky-400/15 rounded-xl hover:bg-sky-200/60 dark:hover:bg-sky-400/22 transition-colors duration-300">
                        <Briefcase className="text-sky-500 dark:text-sky-300 mt-1 flex-shrink-0 sm:w-5 sm:h-5" size={18} />
                        <div>
                          <p className="text-slate-600 dark:text-gray-300">
                            Full-time PLC Programmer at <span className="text-sky-700 dark:text-sky-300 font-semibold">Aages S.A.</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 sm:p-4 bg-cyan-50/70 dark:bg-cyan-300/10 rounded-xl hover:bg-cyan-100/75 dark:hover:bg-cyan-300/16 transition-colors duration-300">
                        <Calendar className="text-cyan-500 dark:text-cyan-200 mt-1 flex-shrink-0 sm:w-5 sm:h-5" size={18} />
                        <div>
                          <p className="text-slate-600 dark:text-gray-300">
                            Part-time Event Organizer at <span className="text-cyan-700 dark:text-cyan-200 font-semibold">Moments &amp; More S.R.L.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                        I'm passionate about bridging the gap between industrial automation and modern web technologies.
                        I bring structure and logic to everything I build, from control systems to responsive web interfaces.
                      </p>
                      <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                        When I'm not coding, you'll find me exploring new technologies, contributing to personal projects,
                        or diving deep into the latest automation innovations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollTriggeredSection>

          {/* Work Experience Section */}
          <ScrollTriggeredSection animationType="slideRight" className="hidden">
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-2 sm:p-6 md:p-8 border border-red-200/50 dark:border-white/10 hover:border-red-300/70 dark:hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 dark:hover:shadow-red-500/20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Briefcase className="text-red-500 dark:text-red-400 sm:w-7 sm:h-7" size={24} />
                <h2 className="organic-heading text-2xl md:text-3xl">Work Experience</h2>
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-400 via-orange-400 to-amber-400"></div>

                  <div className="pl-8 sm:pl-16 relative mb-6 sm:mb-8">
                    <div className="absolute left-[-17px] sm:left-[-41px] top-2 w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full animate-pulse"></div>
                    <div className="bg-red-100/40 dark:bg-red-500/20 p-2 sm:p-6 rounded-lg hover:bg-red-200/50 dark:hover:bg-red-500/30 transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center gap-3 mb-3">
                        <Cog className="text-red-500 dark:text-red-400" size={20} />
                        <h3 className="text-xl font-semibold leading-[1.25] pb-0.5 text-red-600 dark:text-red-400">PLC Programmer</h3>
                      </div>
                      <p className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Aages S.A.</p>
                      <p className="text-slate-600 dark:text-gray-300 mb-3">Full-time • 2023 - Now</p>
                      <p className="text-slate-500 dark:text-gray-400">
                        Developing and maintaining industrial automation systems, programming PLCs,
                        and ensuring optimal performance of manufacturing processes.
                      </p>
                    </div>
                  </div>

                  <div className="pl-8 sm:pl-16 relative mb-6 sm:mb-8">
                    <div className="absolute left-[-17px] sm:left-[-41px] top-2 w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-full animate-pulse"></div>
                    <div className="bg-orange-100/40 dark:bg-orange-500/20 p-2 sm:p-6 rounded-lg hover:bg-orange-200/50 dark:hover:bg-orange-500/30 transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="text-orange-500 dark:text-orange-400" size={20} />
                        <h3 className="text-xl font-semibold leading-[1.25] pb-0.5 text-orange-600 dark:text-orange-400">Event Manager</h3>
                      </div>
                      <p className="text-lg font-medium text-slate-700 dark:text-gray-200 mb-2">Moments &amp; More S.R.L.</p>
                      <p className="text-slate-600 dark:text-gray-300 mb-3">Part-time • 2025 - Now</p>
                      <p className="text-slate-500 dark:text-gray-400">
                        Organizing and managing festivals and events while also handling technical execution,
                        including event websites, online registration flows, digital promotion assets,
                        and on-site systems needed to deliver smooth attendee experiences.
                      </p>
                    </div>
                  </div>

                  <div className="pl-8 sm:pl-16 relative">
                    <div className="absolute left-[-17px] sm:left-[-41px] top-2 w-2 h-2 sm:w-3 sm:h-3 bg-amber-400 rounded-full animate-pulse"></div>
                    <div className="bg-amber-100/40 dark:bg-amber-500/20 p-2 sm:p-6 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-500/30 transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center gap-3 mb-3">
                        <Briefcase className="text-amber-500 dark:text-amber-400" size={20} />
                        <h3 className="text-xl font-semibold leading-[1.25] pb-0.5 text-amber-600 dark:text-amber-400">CEO / Administrator</h3>
                      </div>
                      <p className="text-lg font-medium text-slate-700 dark:text-gray-200 mb-2">Antratech S.R.L.</p>
                      <p className="text-slate-600 dark:text-gray-300 mb-3">2025 - Now</p>
                      <p className="text-slate-500 dark:text-gray-400">
                        Leading company operations, strategy, client relationships, and the delivery of software development projects.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollTriggeredSection>

          {/* Education Section */}
          <ScrollTriggeredSection animationType="slideLeft" className="hidden">
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-2 sm:p-6 md:p-8 border border-green-200/50 dark:border-white/10 hover:border-green-300/70 dark:hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10 dark:hover:shadow-green-500/20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <GraduationCap className="text-green-500 dark:text-green-400 sm:w-7 sm:h-7" size={24} />
                <h2 className="organic-heading text-2xl md:text-3xl">Education</h2>
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-lime-400 to-transparent"></div>

                  <div className="pl-8 sm:pl-16 relative mb-6 sm:mb-8">
                    <div className="absolute left-[-17px] sm:left-[-41px] top-2 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="bg-green-100/40 dark:bg-green-500/20 p-2 sm:p-6 rounded-lg hover:bg-green-200/50 dark:hover:bg-green-500/30 transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center gap-3 mb-3">
                        <Monitor className="text-green-500 dark:text-green-400" size={20} />
                        <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">Computer Engineering</h3>
                      </div>
                      <p className="text-lg font-medium text-slate-700 dark:text-gray-200 mb-2">Sapientia University</p>
                      <p className="text-slate-600 dark:text-gray-300 mb-3">Târgu Mureș, Romania</p>
                      <p className="text-slate-500 dark:text-gray-400">
                        Developed a strong foundation in both software and hardware automation,
                        preparing me for the intersection of industrial systems and modern technology.
                      </p>
                    </div>
                  </div>

                  <div className="pl-8 sm:pl-16 relative">
                    <div className="absolute left-[-17px] sm:left-[-41px] top-2 w-2 h-2 sm:w-3 sm:h-3 bg-lime-400 rounded-full animate-pulse"></div>
                    <div className="bg-lime-50/40 dark:bg-lime-500/20 p-2 sm:p-6 rounded-lg hover:bg-lime-100/50 dark:hover:bg-lime-500/30 transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center gap-3 mb-3">
                        <Settings className="text-lime-500 dark:text-lime-400" size={20} />
                        <h3 className="text-xl font-semibold text-lime-600 dark:text-lime-400">Electrical Engineering Studies</h3>
                      </div>
                      <p className="text-lg font-medium text-slate-700 dark:text-gray-200 mb-2">Electromaros Liceum</p>
                      <p className="text-slate-600 dark:text-gray-300 mb-3">Târgu Mureș, Romania</p>
                      <p className="text-slate-500 dark:text-gray-400">
                        Studied electrical circuits, electronics, and electrical engineering principles, 
                        providing a solid foundation in electrical systems and circuit design.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollTriggeredSection>

          {/* Skills Section */}
          <ScrollTriggeredSection animationType="slideRight" className="hidden">
            <div className="organic-glass-panel p-4 sm:p-6 md:p-8">
              <div className="text-center">
                <h2 className="organic-heading text-2xl md:text-3xl mb-6">Skills & Technologies</h2>
              </div>
              <div className="skill-ribbon-list">
                {skills.map((skill, index) => (
                  <div className="skill-ribbon" key={skill.name}>
                    <span className="skill-ribbon-number">0{index + 1}</span>
                    <span className="font-semibold">{skill.name}</span>
                    <skill.icon size={18} />
                  </div>
                ))}
              </div>
            </div>
          </ScrollTriggeredSection>

          <div className="space-y-14 sm:space-y-20 mb-10 sm:mb-20 px-1 sm:px-4">
            {/* Technical Ledger Variant 1 */}
            <ScrollTriggeredSection animationType="slideRight">
              <div className="hidden">
                <span className="variant-choice-number">02</span>
                <div><p className="variant-choice-name">Ledger variant 1</p><h2 className="organic-heading text-xl md:text-2xl">Classic ledger</h2></div>
              </div>
              <section className="profile-variant rounded-xl p-4 sm:p-7 md:p-9 border-l-4 !border-l-indigo-400/50">
                <div className="grid lg:grid-cols-[.75fr_1.25fr] gap-6 lg:gap-10 pb-8 border-b border-indigo-900/25 dark:border-indigo-100/20">
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <User className="text-indigo-500 dark:text-indigo-300 shrink-0" size={28} />
                      <h2 className="organic-heading text-3xl">About Me</h2>
                    </div>
                    <div className="text-base sm:text-lg">
                      <p className="organic-copy"><MapPin className="inline mr-2 text-blue-500" size={16} />Based in <strong>Mureș, Romania</strong></p>
                    </div>
                  </div>
                  <div className="organic-copy space-y-4 leading-relaxed lg:pt-7">
                    {aboutParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </div>

                <div className="py-8 border-b border-indigo-900/25 dark:border-indigo-100/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="text-indigo-500 dark:text-indigo-300 shrink-0" size={26} />
                    <h2 className="organic-heading text-2xl md:text-3xl">Work Experience</h2>
                  </div>
                  {workItems.map((item) => (
                    <article className="ledger-row" key={item.role}>
                      <div><h3 className="text-lg font-semibold text-slate-800 dark:text-white">{item.role}</h3><p className="text-base text-indigo-600 dark:text-indigo-300">{item.period}</p></div>
                      <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                        <a href={item.company.url} target="_blank" rel="noopener noreferrer" className={item.company.className}>
                          {item.company.name}
                        </a>
                      </p>
                      <p className="organic-copy text-base leading-relaxed">{item.description}</p>
                    </article>
                  ))}
                </div>

                <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-8 pt-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <GraduationCap className="text-emerald-600 dark:text-emerald-300 shrink-0" size={24} />
                      <h2 className="organic-heading text-2xl">Education</h2>
                    </div>
                    <div className="space-y-5">{educationItems.map((item) => <article key={item.title}><h3 className="text-lg font-semibold text-slate-800 dark:text-white">{item.title}</h3><p className="text-base text-emerald-700 dark:text-emerald-300">{item.institution} · {item.location}</p><p className="organic-copy text-base mt-1 leading-relaxed">{item.description}</p></article>)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Layers className="text-indigo-500 dark:text-indigo-300 shrink-0" size={24} />
                      <h2 className="organic-heading text-2xl">Skills & Technologies</h2>
                    </div>
                    <div className="skills-ledger-grid grid sm:grid-cols-2 sm:grid-rows-3 sm:grid-flow-col gap-x-8 gap-y-3">{skills.map((skill, index) => <div className="flex items-center justify-between border-b border-indigo-900/10 dark:border-indigo-100/10 py-3" key={skill.name}><span className="organic-copy font-semibold text-base">{skill.name}</span><span className="text-sm font-serif italic text-indigo-500">0{index + 1}</span></div>)}</div>
                  </div>
                </div>
              </section>
            </ScrollTriggeredSection>

            {/* Technical Ledger Variant 2 */}
            <ScrollTriggeredSection animationType="slideLeft" className="hidden">
              <div className="variant-choice-heading !mx-0">
                <span className="variant-choice-number">03</span>
                <div><p className="variant-choice-name">Ledger variant 2</p><h2 className="organic-heading text-xl md:text-2xl">Split-index ledger</h2></div>
              </div>
              <section className="profile-variant rounded-[1.8rem_.5rem_1.8rem_.5rem] overflow-hidden">
                <div className="grid lg:grid-cols-[15rem_1fr]">
                  <aside className="p-5 sm:p-7 bg-indigo-100/35 dark:bg-indigo-400/[.06] border-b lg:border-b-0 lg:border-r border-indigo-900/10 dark:border-indigo-100/10">
                    <p className="variant-kicker mb-3">Index / 01</p>
                    <h2 className="organic-heading text-3xl mb-5">About Me</h2>
                    <div className="space-y-4 text-sm">
                      <p className="organic-copy"><MapPin className="mb-1 text-blue-500" size={17} /><strong>Mureș, Romania</strong></p>
                      <p className="organic-copy"><Cog className="mb-1 text-sky-500" size={17} />PLC Programmer<br/><strong>Aages S.A.</strong></p>
                      <p className="organic-copy"><Calendar className="mb-1 text-cyan-500" size={17} />Event Organizer<br/><strong>Moments &amp; More S.R.L.</strong></p>
                    </div>
                  </aside>
                  <div className="p-5 sm:p-7 md:p-9">
                    <div className="organic-copy space-y-3 leading-relaxed pb-7 border-b border-indigo-900/10 dark:border-indigo-100/10">{aboutParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
                    <div className="py-7 border-b border-indigo-900/10 dark:border-indigo-100/10">
                      <div className="flex items-end justify-between gap-4 mb-4"><div><p className="variant-kicker">Index / 02</p><h2 className="organic-heading text-2xl">Work Experience</h2></div><Briefcase className="text-indigo-500/60" size={22}/></div>
                      <div className="space-y-1">{workItems.map((item, index) => <article className="grid sm:grid-cols-[2.5rem_1fr] gap-3 py-4 border-t border-indigo-900/10 dark:border-indigo-100/10 first:border-0" key={item.role}><span className="font-serif italic text-indigo-500">0{index + 1}</span><div><div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold text-slate-800 dark:text-white">{item.role} · {item.company.name}</h3><span className="text-xs text-indigo-600 dark:text-indigo-300">{item.period}</span></div><p className="organic-copy text-sm mt-2 leading-relaxed">{item.description}</p></div></article>)}</div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-7 pt-7">
                      <div><p className="variant-kicker mb-1">Index / 03</p><h2 className="organic-heading text-xl mb-3">Education</h2><div className="space-y-4">{educationItems.map((item) => <article key={item.title}><h3 className="font-semibold text-slate-800 dark:text-white">{item.title}</h3><p className="text-xs text-emerald-700 dark:text-emerald-300">{item.institution} · {item.location}</p><p className="organic-copy text-xs mt-1 leading-relaxed">{item.description}</p></article>)}</div></div>
                      <div><p className="variant-kicker mb-1">Index / 04</p><h2 className="organic-heading text-xl mb-3">Skills & Technologies</h2><div className="space-y-2">{skills.map((skill, index) => <div className="flex items-center gap-3 text-sm" key={skill.name}><span className="skill-ribbon-number">0{index + 1}</span><skill.icon className="text-indigo-500" size={15}/><span className="organic-copy font-semibold">{skill.name}</span></div>)}</div></div>
                    </div>
                  </div>
                </div>
              </section>
            </ScrollTriggeredSection>

            {/* Technical Ledger Variant 3 */}
            <ScrollTriggeredSection animationType="float" className="hidden">
              <div className="variant-choice-heading !mx-0">
                <span className="variant-choice-number">04</span>
                <div><p className="variant-choice-name">Ledger variant 3</p><h2 className="organic-heading text-xl md:text-2xl">Blueprint ledger</h2></div>
              </div>
              <section className="profile-variant rounded-none border-y-4 !border-y-sky-500/30 p-4 sm:p-7 md:p-9">
                <header className="grid lg:grid-cols-[1fr_auto] gap-6 pb-7 border-b-2 border-sky-700/15 dark:border-sky-200/10">
                  <div><p className="variant-kicker mb-2">Record 01 — Personal profile</p><h2 className="organic-heading text-3xl md:text-4xl mb-4">About Me</h2><div className="organic-copy space-y-3 max-w-3xl leading-relaxed">{aboutParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div>
                  <div className="grid grid-cols-1 gap-2 text-xs min-w-60">
                    <p className="border border-sky-700/15 dark:border-sky-200/10 p-3 organic-copy"><span className="variant-kicker block mb-1">Base</span>Mureș, Romania</p>
                    <p className="border border-sky-700/15 dark:border-sky-200/10 p-3 organic-copy"><span className="variant-kicker block mb-1">Primary role</span>PLC Programmer · Aages S.A.</p>
                    <p className="border border-sky-700/15 dark:border-sky-200/10 p-3 organic-copy"><span className="variant-kicker block mb-1">Parallel role</span>Event Organizer · Moments &amp; More</p>
                  </div>
                </header>

                <div className="py-7 border-b-2 border-sky-700/15 dark:border-sky-200/10">
                  <div className="flex items-center gap-3 mb-5"><span className="font-mono text-sm text-sky-700 dark:text-sky-300">02</span><h2 className="organic-heading text-2xl md:text-3xl">Work Experience</h2></div>
                  <div className="grid lg:grid-cols-3 gap-px bg-sky-700/15 dark:bg-sky-200/10 border border-sky-700/15 dark:border-sky-200/10">
                    {workItems.map((item, index) => <article className="bg-slate-50/50 dark:bg-slate-900/45 p-5" key={item.role}><div className="flex justify-between mb-5"><item.icon className="text-sky-600 dark:text-sky-300" size={19}/><span className="font-mono text-xs text-sky-700/60 dark:text-sky-300/60">W-0{index + 1}</span></div><h3 className="font-semibold text-slate-800 dark:text-white">{item.role}</h3><p className="text-sm font-semibold text-sky-700 dark:text-sky-300">{item.company.name}</p><p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">{item.period}</p><p className="organic-copy text-sm leading-relaxed">{item.description}</p></article>)}
                  </div>
                </div>

                <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-8 pt-7">
                  <div><div className="flex items-center gap-3 mb-5"><span className="font-mono text-sm text-sky-700 dark:text-sky-300">03</span><h2 className="organic-heading text-2xl">Education</h2></div><div className="space-y-4">{educationItems.map((item, index) => <article className="grid sm:grid-cols-[3rem_1fr] gap-3 border-t border-sky-700/15 dark:border-sky-200/10 pt-4 first:border-0 first:pt-0" key={item.title}><span className="font-mono text-xs text-sky-700/60 dark:text-sky-300/60">E-0{index + 1}</span><div><h3 className="font-semibold text-slate-800 dark:text-white">{item.title}</h3><p className="text-sm text-emerald-700 dark:text-emerald-300">{item.institution} · {item.location}</p><p className="organic-copy text-sm mt-2 leading-relaxed">{item.description}</p></div></article>)}</div></div>
                  <div><div className="flex items-center gap-3 mb-5"><span className="font-mono text-sm text-sky-700 dark:text-sky-300">04</span><h2 className="organic-heading text-2xl">Skills & Technologies</h2></div><div className="grid gap-px bg-sky-700/15 dark:bg-sky-200/10 border border-sky-700/15 dark:border-sky-200/10">{skills.map((skill, index) => <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 bg-slate-50/50 dark:bg-slate-900/45 p-3" key={skill.name}><span className="font-mono text-xs text-sky-700/60 dark:text-sky-300/60">0{index + 1}</span><span className="organic-copy font-semibold text-sm">{skill.name}</span><skill.icon className="text-sky-600 dark:text-sky-300" size={16}/></div>)}</div></div>
                </div>
              </section>
            </ScrollTriggeredSection>
          </div>

          {/* Footer */}
          <ScrollTriggeredSection animationType="float" className="text-center px-1 sm:px-4">
            <div className="organic-glass-panel p-3 sm:p-6 md:p-8 group">
              <h3 className="organic-heading text-xl md:text-2xl mb-4 group-hover:scale-105 transition-transform duration-300">Let's Connect</h3>
              <p className="organic-copy mb-6">
                Always open to discussing new opportunities, collaborations, or just having a chat about technology!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button group/link flex items-center justify-center gap-2 px-5 py-2.5 font-medium"
                >
                  <Github className="group-hover/link:scale-125 transition-transform duration-300" size={24} />
                  <span>GitHub</span>
                  <ExternalLink size={16} className="opacity-50 group-hover/link:opacity-100 transition-opacity duration-300" />
                </a>
                <a
                    href={`mailto:${socialLinks.email}`}
                    className="glass-button group/link flex items-center justify-center gap-2 px-5 py-2.5 font-medium"
                >
                  <Mail className="group-hover/link:scale-125 transition-transform duration-300" size={24} />
                  <span>Email</span>
                  <ExternalLink size={16} className="opacity-50 group-hover/link:opacity-100 transition-opacity duration-300" />
                </a>
              </div>
            </div>
          </ScrollTriggeredSection>
        </div>
        <ParticleSystem />
      </div>
  );
}

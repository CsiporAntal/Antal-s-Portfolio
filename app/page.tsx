"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, MapPin, Briefcase, GraduationCap, Code, Mail, Github, ExternalLink, Cpu, Globe, Cog, Zap, Monitor, Settings } from 'lucide-react';
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
  type: 'mouse' | 'click' | 'ambient' | 'text' | 'scroll' | 'island' | 'clickconnect' | 'texthover' | 'air';
  // Island particle specific properties
  homeX?: number;
  homeY?: number;
  orbitAngle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  attractionStrength?: number; // Added for burst particles
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
  const lastParticleTime = useRef(0);
  const lastScrollY = useRef(0);
  const profilePictureRef = useRef({ x: 0, y: 0, radius: 100 });
  const lastIslandParticleTime = useRef(0);
  const isMouseNearProfile = useRef(false);
  const lastHoverParticleTime = useRef(0);

  const createParticle = useCallback((x: number, y: number, type: 'mouse' | 'click' | 'ambient' | 'text' | 'scroll' | 'island' | 'clickconnect' | 'texthover' | 'air' = 'ambient'): Particle => {
    const baseVelocity = type === 'click' ? 8 : type === 'mouse' ? 3 : type === 'text' ? 2 : type === 'scroll' ? 4 : type === 'island' ? 0.5 : type === 'clickconnect' ? 1.5 : type === 'texthover' ? 1 : type === 'air' ? 0.8 : 1;
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * baseVelocity + (type === 'island' ? 0.2 : type === 'clickconnect' ? 0.5 : type === 'texthover' ? 0.3 : type === 'air' ? 0.2 : 1);
    
    // Base lifespans
    const baseLife = type === 'click' ? 180 : type === 'mouse' ? 90 : type === 'text' ? 150 : type === 'scroll' ? 120 : type === 'island' ? 450 : type === 'clickconnect' ? 270 : type === 'texthover' ? 200 : type === 'air' ? 160 : 240;
    
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

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    updateProfilePicturePosition();

    // Check if mouse is near profile picture
    const { x: profileX, y: profileY, radius: profileRadius } = profilePictureRef.current;
    const { x: mouseScreenX, y: mouseScreenY } = mouseRef.current;
    // Convert mouse to world coordinates for distance calculations
    const mouseWorldX = mouseScreenX + window.scrollX;
    const mouseWorldY = mouseScreenY + window.scrollY;
    const distanceToProfile = Math.sqrt((mouseWorldX - profileX) ** 2 + (mouseWorldY - profileY) ** 2);
    const wasNearProfile = isMouseNearProfile.current;
    isMouseNearProfile.current = distanceToProfile < profileRadius + 50; // 50px buffer around profile

    // Generate hover particles when mouse is near profile
    if (isMouseNearProfile.current) {
      const now = Date.now();
      if (now - lastHoverParticleTime.current > 200) { // Every 200ms when hovering
        // Create 2-3 extra particles when hovering
        const extraParticles = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < extraParticles; i++) {
          particlesRef.current.push(createIslandParticle());
        }
        lastHoverParticleTime.current = now;
      }
    }

    particlesRef.current = particlesRef.current.filter(particle => {
      // Update position based on particle type
      if (particle.type === 'island') {
        // Island particle behavior
        const mouseDistance = Math.sqrt((particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2);
        const attractionRadius = 120;
        
        if (mouseDistance < attractionRadius) {
          // Gentle attraction to mouse when close
          const baseAttractionStrength = particle.attractionStrength || 0.03; // Use custom strength for burst particles
          const attractionStrength = (attractionRadius - mouseDistance) / attractionRadius * baseAttractionStrength;
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
        
        // Apply gentle drift back towards profile area
        const distanceFromProfile = Math.sqrt((particle.x - profileX) ** 2 + (particle.y - profileY) ** 2);
        if (distanceFromProfile > profilePictureRef.current.radius) {
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
        // Click-connect particles - attracted to mouse
        const mouseDistance = Math.sqrt((particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2);
        const attractionRadius = 150;
        
        if (mouseDistance < attractionRadius) {
          // Gentle attraction to mouse
          const attractionStrength = (attractionRadius - mouseDistance) / attractionRadius * 0.08;
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
        // Text hover particles - attracted to mouse
        const mouseDistance = Math.sqrt((particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2);
        const attractionRadius = 200;
        
        if (mouseDistance < attractionRadius) {
          // Gentle attraction to mouse
          const attractionStrength = (attractionRadius - mouseDistance) / attractionRadius * 0.06;
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
        // Air particles - drift towards mouse with stronger attraction
        const mouseDistance = Math.sqrt((particle.x - mouseWorldX) ** 2 + (particle.y - mouseWorldY) ** 2);
        const attractionRadius = 300; // Increased from 250
        
        if (mouseDistance < attractionRadius) {
          const attractionStrength = (attractionRadius - mouseDistance) / attractionRadius * 0.08; // Increased from 0.04
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
      
      // Decrease life
      particle.life--;
      
      // Bounce off edges (except for island particles which should stay near profile)
      if (particle.type !== 'island') {
        // Use document dimensions instead of canvas dimensions for world coordinate bouncing
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
      }
      
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

    // Ensure proper rendering properties
    ctx.globalCompositeOperation = 'source-over';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    particlesRef.current.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const size = particle.size * alpha;
      
      // Adjust particle position for scroll offset
      const screenX = particle.x - scrollX;
      const screenY = particle.y - scrollY;
      
      // Only draw particles that are visible on screen
      if (screenX < -50 || screenX > canvas.width + 50 || screenY < -50 || screenY > canvas.height + 50) {
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
        const mouseScreenX = mouseRef.current.x;
        const mouseScreenY = mouseRef.current.y;
        const mouseDistance = Math.sqrt((screenX - mouseScreenX) ** 2 + (screenY - mouseScreenY) ** 2);
        if (mouseDistance < 120) {
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
        const mouseScreenX = mouseRef.current.x;
        const mouseScreenY = mouseRef.current.y;
        const mouseDistance = Math.sqrt((screenX - mouseScreenX) ** 2 + (screenY - mouseScreenY) ** 2);
        if (mouseDistance < 150) {
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
        const mouseScreenX = mouseRef.current.x;
        const mouseScreenY = mouseRef.current.y;
        const mouseDistance = Math.sqrt((screenX - mouseScreenX) ** 2 + (screenY - mouseScreenY) ** 2);
        if (mouseDistance < 200) {
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
        const mouseScreenX = mouseRef.current.x;
        const mouseScreenY = mouseRef.current.y;
        const mouseDistance = Math.sqrt((screenX - mouseScreenX) ** 2 + (screenY - mouseScreenY) ** 2);
        if (mouseDistance < 300) { // Increased from 250 to match attraction radius
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
        const p1ScreenX = p1.x - scrollX;
        const p1ScreenY = p1.y - scrollY;
        const p2ScreenX = p2.x - scrollX;
        const p2ScreenY = p2.y - scrollY;
        
        // Skip if either particle is off-screen
        if (p1ScreenX < -50 || p1ScreenX > canvas.width + 50 || p1ScreenY < -50 || p1ScreenY > canvas.height + 50 ||
            p2ScreenX < -50 || p2ScreenX > canvas.width + 50 || p2ScreenY < -50 || p2ScreenY > canvas.height + 50) {
          continue;
        }
        
        const distance = Math.sqrt((p1ScreenX - p2ScreenX) ** 2 + (p1ScreenY - p2ScreenY) ** 2);
        
        if (distance < connectionDistance) {
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Store mouse position in screen coordinates for drawing connections
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      // Create particles on mouse movement (throttled)
      const now = Date.now();
      if (now - lastParticleTime.current > 50) {
        // Create particles in world coordinates
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
        // Create clickconnect particles for general clicks in world coordinates
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
          const distance = Math.random() * 60 + 20; // 20-80px from click point
          const spawnX = e.clientX + window.scrollX + Math.cos(angle) * distance;
          const spawnY = e.clientY + window.scrollY + Math.sin(angle) * distance;
          particlesRef.current.push(createParticle(spawnX, spawnY, 'clickconnect'));
        }
        
        // Add a few amber air particles
        for (let i = 0; i < 4; i++) { // Just a few amber particles
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 40 + 10; // 10-50px from click point
          const spawnX = e.clientX + window.scrollX + Math.cos(angle) * distance;
          const spawnY = e.clientY + window.scrollY + Math.sin(angle) * distance;
          particlesRef.current.push(createParticle(spawnX, spawnY, 'air'));
        }
      }
      
      // Original click explosion effect (for non-profile clicks) in world coordinates
      if (!isProfileClick) {
        for (let i = 0; i < 15; i++) {
          particlesRef.current.push(createParticle(e.clientX + window.scrollX, e.clientY + window.scrollY, 'click'));
        }
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);
      
      if (scrollDelta > 10) {
        // Create particles based on scroll intensity
        const particleCount = Math.min(Math.floor(scrollDelta / 20), 8);
        
        for (let i = 0; i < particleCount; i++) {
          const x = Math.random() * window.innerWidth;
          const y = currentScrollY > lastScrollY.current 
            ? Math.random() * 100 + window.innerHeight - 100 // Bottom for scroll down
            : Math.random() * 100; // Top for scroll up
            
          particlesRef.current.push(createParticle(x, y, 'scroll'));
        }
      }
      
      lastScrollY.current = currentScrollY;
    };

    const handleResize = () => {
      resizeCanvas();
    };

    // Add some ambient particles
    const addAmbientParticles = () => {
      if (particlesRef.current.length < 30) {
        particlesRef.current.push(createParticle(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
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
        for (let i = 0; i < needed; i++) {
          particlesRef.current.push(createIslandParticle());
        }
      }
      
      // Randomly add particles up to maximum (increased probability)
      if (islandParticles.length < maxIslandParticles && Math.random() < 0.7) {
        particlesRef.current.push(createIslandParticle());
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
      for (let i = 0; i < 18; i++) { // Even more initial particles
        particlesRef.current.push(createIslandParticle());
      }
    }, 500); // Wait for profile picture to be rendered

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearInterval(ambientInterval);
      clearInterval(islandInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, createParticle, createIslandParticle, updateProfilePicturePosition]);

  const createProfileClickEffect = useCallback(() => {
    const { x: profileX, y: profileY } = profilePictureRef.current;
    const burstRadius = 500; // Even bigger radius (was 300)
    const particleCount = 45; // More particles for bigger effect
    
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
  }, [createParticle]);

  // Expose functions for external use
  useEffect(() => {
    (window as any).createTextParticles = createTextParticles;
    (window as any).createProfileClickEffect = createProfileClickEffect;
  }, [createTextParticles, createProfileClickEffect]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
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

const SkillBadge = ({ skill, delay = 0 }) => (
    <div
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100/50 to-blue-100/50 dark:from-purple-500/20 dark:to-blue-500/20 border border-purple-200/60 dark:border-purple-400/40 rounded-full text-sm hover:scale-110 transition-all duration-300 hover:shadow-lg hover:border-purple-300/80 dark:hover:border-purple-400/60 text-slate-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-200/60 hover:to-blue-200/60 dark:hover:from-purple-500/30 dark:hover:to-blue-500/30 cursor-pointer group"
        style={{ animationDelay: `${delay}ms` }}
    >
      <skill.icon size={16} className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
      <span className="font-medium">{skill.name}</span>
    </div>
);

export default function EnhancedPortfolio() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothMousePosition, setSmoothMousePosition] = useState({ x: 0, y: 0 });
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setShowScrollIndicator(window.scrollY < 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Smooth mouse follower with consistent responsiveness
  useEffect(() => {
    const smoothFollow = () => {
      setSmoothMousePosition(prev => {
        const lerp = 0.15; // Consistent smoothing factor
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

  const skills = [
    { name: 'PLC Programming', icon: Cpu },
    { name: 'Industrial Automation', icon: Cog },
    { name: 'Control Systems', icon: Settings },
    { name: 'Web Development', icon: Monitor },
    { name: 'React', icon: Code },
    { name: 'Next.js', icon: Globe }
  ];

  return (
      <div className="relative min-h-screen overflow-visible">
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

        {/* Cursor follower - enhanced styling */}
        <div
            className="hidden md:block fixed pointer-events-none z-50"
            style={{
              left: smoothMousePosition.x - 12,
              top: smoothMousePosition.y - 12,
              transform: 'translate(0, 0)'
            }}
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 w-6 h-6 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-sm animate-pulse"></div>
          
          {/* Main dot with gradient */}
          <div className="relative w-6 h-6 bg-gradient-to-br from-blue-500/80 to-purple-600/80 rounded-full border border-white/20 shadow-lg backdrop-blur-sm">
            {/* Inner highlight */}
            <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-white/60 rounded-full blur-[1px]"></div>
            
            {/* Sparkle effect */}
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-300/80 rounded-full animate-ping"></div>
          </div>
        </div>

        <div className="relative z-15 w-full px-4 sm:px-8 py-4 sm:py-6">
          {/* Hero Section */}
          <AnimatedSection className="text-center mb-16 mt-2">
            <div className="relative mb-12 py-8 px-8">
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
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 hover:scale-105 select-none"
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

              <p className="text-lg md:text-xl text-slate-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                {metaData.description}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-200/80 to-slate-300/80 dark:from-gray-800 dark:to-gray-700 text-slate-800 dark:text-white rounded-lg hover:from-slate-300/90 hover:to-slate-400/90 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-xl backdrop-blur-sm"
              >
                <Github size={20} />
                GitHub
              </a>
              <a
                  href={`mailto:${socialLinks.email}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <Mail size={20} />
                Get in Touch
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

          {/* About Section */}
          <ScrollTriggeredSection animationType="slideUp" className="mb-20 px-2 sm:px-4">
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-3 sm:p-6 md:p-8 border border-blue-200/50 dark:border-white/10 hover:border-blue-300/70 dark:hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20"
                 onMouseEnter={(e) => {
                   if ((window as any).createHoverParticles) {
                     (window as any).createHoverParticles(e.currentTarget);
                   }
                 }}
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Code className="text-blue-500 dark:text-blue-400 sm:w-7 sm:h-7" size={24} />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">About Me</h2>
              </div>
              <div className="relative">
                <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-transparent"></div>
                <div className="pl-8 sm:pl-16 relative">
                  <div className="absolute left-[-17px] sm:left-[-41px] top-2 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start gap-3 p-3 sm:p-4 bg-blue-100/40 dark:bg-blue-500/20 rounded-lg hover:bg-blue-200/50 dark:hover:bg-blue-500/30 transition-colors duration-300">
                        <MapPin className="text-blue-500 dark:text-blue-400 mt-1 flex-shrink-0 sm:w-5 sm:h-5" size={18} />
                        <div>
                          <p className="text-slate-600 dark:text-gray-300">
                            Based in <span className="text-blue-600 dark:text-blue-400 font-semibold">Mureș, Romania</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 sm:p-4 bg-purple-100/40 dark:bg-purple-500/20 rounded-lg hover:bg-purple-200/50 dark:hover:bg-purple-500/30 transition-colors duration-300">
                        <Briefcase className="text-purple-500 dark:text-purple-400 mt-1 flex-shrink-0 sm:w-5 sm:h-5" size={18} />
                        <div>
                          <p className="text-slate-600 dark:text-gray-300">
                            Full-time PLC Programmer at <span className="text-red-600 dark:text-red-400 font-semibold">Aages S.A.</span>
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

          {/* Education Section */}
          <ScrollTriggeredSection animationType="slideLeft" className="mb-20 px-2 sm:px-4">
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-3 sm:p-6 md:p-8 border border-green-200/50 dark:border-white/10 hover:border-green-300/70 dark:hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10 dark:hover:shadow-green-500/20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <GraduationCap className="text-green-500 dark:text-green-400 sm:w-7 sm:h-7" size={24} />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Education</h2>
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-transparent"></div>

                  <div className="pl-8 sm:pl-16 relative mb-6 sm:mb-8">
                    <div className="absolute left-[-17px] sm:left-[-41px] top-2 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="bg-green-100/40 dark:bg-green-500/20 p-3 sm:p-6 rounded-lg hover:bg-green-200/50 dark:hover:bg-green-500/30 transition-all duration-300 hover:scale-[1.02]">
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
                    <div className="absolute left-[-17px] sm:left-[-41px] top-2 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="bg-blue-100/40 dark:bg-blue-500/20 p-3 sm:p-6 rounded-lg hover:bg-blue-200/50 dark:hover:bg-blue-500/30 transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center gap-3 mb-3">
                        <Settings className="text-blue-500 dark:text-blue-400" size={20} />
                        <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Electrical Engineering Studies</h3>
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

          {/* Work Experience Section */}
          <ScrollTriggeredSection animationType="slideRight" className="mb-20 px-2 sm:px-4">
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-3 sm:p-6 md:p-8 border border-orange-200/50 dark:border-white/10 hover:border-orange-300/70 dark:hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 dark:hover:shadow-orange-500/20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Briefcase className="text-orange-500 dark:text-orange-400 sm:w-7 sm:h-7" size={24} />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Work Experience</h2>
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 via-red-400 to-transparent"></div>

                  <div className="pl-8 sm:pl-16 relative mb-6 sm:mb-8">
                    <div className="absolute left-[-17px] sm:left-[-41px] top-2 w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-full animate-pulse"></div>
                    <div className="bg-orange-100/40 dark:bg-orange-500/20 p-3 sm:p-6 rounded-lg hover:bg-orange-200/50 dark:hover:bg-orange-500/30 transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center gap-3 mb-3">
                        <Cog className="text-orange-500 dark:text-orange-400" size={20} />
                        <h3 className="text-xl font-semibold text-orange-600 dark:text-orange-400">PLC Programmer</h3>
                      </div>
                      <p className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Aages S.A.</p>
                      <p className="text-slate-600 dark:text-gray-300 mb-3">Full-time</p>
                      <p className="text-slate-500 dark:text-gray-400">
                        Developing and maintaining industrial automation systems, programming PLCs,
                        and ensuring optimal performance of manufacturing processes.
                      </p>
                    </div>
                  </div>

                  <div className="pl-8 sm:pl-16 relative">
                    <div className="absolute left-[-17px] sm:left-[-41px] top-2 w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full animate-pulse"></div>
                    <div className="bg-red-100/40 dark:bg-red-500/20 p-3 sm:p-6 rounded-lg hover:bg-red-200/50 dark:hover:bg-red-500/30 transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center gap-3 mb-3">
                        <Globe className="text-red-500 dark:text-red-400" size={20} />
                        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">Web Developer</h3>
                      </div>
                      <p className="text-lg font-medium text-slate-700 dark:text-gray-200 mb-2">Freelance</p>
                      <p className="text-slate-600 dark:text-gray-300 mb-3">Part-time</p>
                      <p className="text-slate-500 dark:text-gray-400">
                        Building clean and functional websites with modern technologies,
                        focusing on responsive design and optimal user experiences.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollTriggeredSection>

          {/* Skills Section */}
          <ScrollTriggeredSection animationType="dive" className="mb-20 px-2 sm:px-4">
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-3 sm:p-6 md:p-8 border border-purple-200/50 dark:border-white/10 hover:border-purple-300/70 dark:hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20 group">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-slate-800 dark:text-white group-hover:scale-105 transition-transform duration-300">Skills & Technologies</h2>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {skills.map((skill, index) => (
                    <SkillBadge key={skill.name} skill={skill} delay={index * 100} />
                ))}
              </div>
            </div>
          </ScrollTriggeredSection>

          {/* Footer */}
          <ScrollTriggeredSection animationType="float" className="text-center px-2 sm:px-4">
            <div className="bg-gradient-to-r from-blue-200/50 to-purple-200/50 dark:from-blue-600/30 dark:to-purple-600/30 backdrop-blur-lg rounded-2xl p-3 sm:p-6 md:p-8 border border-blue-200/60 dark:border-white/10 hover:border-blue-300/80 dark:hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 group">
              <h3 className="text-xl md:text-2xl font-semibold mb-4 text-slate-800 dark:text-white group-hover:scale-105 transition-transform duration-300">Let's Connect</h3>
              <p className="text-slate-600 dark:text-gray-300 mb-6">
                Always open to discussing new opportunities, collaborations, or just having a chat about technology!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-center gap-2 text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <Github className="group-hover/link:scale-125 transition-transform duration-300" size={24} />
                  <span className="group-hover/link:underline font-medium">GitHub</span>
                  <ExternalLink size={16} className="opacity-50 group-hover/link:opacity-100 transition-opacity duration-300" />
                </a>
                <a
                    href={`mailto:${socialLinks.email}`}
                    className="group/link flex items-center justify-center gap-2 text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <Mail className="group-hover/link:scale-125 transition-transform duration-300" size={24} />
                  <span className="group-hover/link:underline font-medium">Email</span>
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
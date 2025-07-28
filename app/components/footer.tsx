"use client";

import React from "react";
import {
  FaXTwitter,
  FaGithub,
  FaInstagram,
  FaRss,
  FaLinkedinIn,
} from "react-icons/fa6";
import { TbMailFilled } from "react-icons/tb";
import { metaData, socialLinks } from "app/lib/config";

const YEAR = new Date().getFullYear();

function SocialLink({ href, icon: Icon }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-slate-500 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white transition-colors duration-300 hover:scale-110 transform"
    >
      <Icon size={20} />
    </a>
  );
}

function SocialLinks() {
  return (
    <div className="flex text-lg gap-4 transition-opacity duration-300 hover:opacity-90">
      <SocialLink href={socialLinks.github} icon={FaGithub} />
      <SocialLink href={socialLinks.linkedin} icon={FaLinkedinIn} />
      <SocialLink href={`mailto:${socialLinks.email}`} icon={TbMailFilled} />
    </div>
  );
}

export default function Footer() {
  return (
    <div className="py-8 lg:py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Copyright */}
        <div className="text-center md:text-left">
          <small className="text-slate-500 dark:text-gray-300">
            <time>© {YEAR}</time>{" "}
            <a
              className="no-underline hover:text-slate-800 dark:hover:text-white transition-colors duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              {metaData.title}
            </a>
          </small>
        </div>

        {/* Social Links */}
        <div className="flex justify-center md:justify-end">
          <SocialLinks />
        </div>
      </div>
      
      <style jsx>{`
        @media screen and (max-width: 480px) {
          article {
            padding-top: 2rem;
            padding-bottom: 4rem;
          }
        }
      `}</style>
    </div>
  );
}

export interface Project {
  title: string;
  year: number;
  description: string;
  url: string;
}

export const projects: Project[] = [
  {
    title: "EDU Dashboard",
    year: 2025,
    description: "Romanian education dashboard",
    url: "https://github.com/CsiporAntal/Edu-Dashboard",
  },
  {
    title: "Csipor Antal's Portfolio",
    description: "My personal portfolio website built with Next.js, featuring interactive particle effects, responsive design, and modern web technologies.",
    year: 2025,
    url: "https://github.com/CsiporAntal/Antal-s-Portfolio?tab=readme-ov-file",
  },
  {
    title: "ModInvest.ro",
    year: 2025,
    description: "Construction company website",
    url: "https://modinvest.ro",
  },
];

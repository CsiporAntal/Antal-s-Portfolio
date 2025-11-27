export interface Project {
  title: string;
  year: number;
  description: string;
  url: string;
}

export const projects: Project[] = [
  {
    title: "Csipor Antal's Portfolio",
    description: "My personal portfolio website, featuring interactive particle effects, responsive design, and modern web technologies.",
    year: 2025,
    url: "https://github.com/CsiporAntal/Antal-s-Portfolio?tab=readme-ov-file",
  },
  {
    title: "Modinvest.ro",
    year: 2025,
    description: "Construction company website",
    url: "https://modinvest.ro",
  },
  {
    title: "Antratech.ro",
    year: 2025,
    description: "Website for software developer company",
    url: "https://antratech.ro",
  },
];

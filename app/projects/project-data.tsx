export interface Project {
  title: string;
  year: number;
  description: string;
  url: string;
}

export const projects: Project[] = [
  {
    title: "Everness Festival",
    year: 2026,
    description: "Festival website focused on lineup presentation, event atmosphere, and clear access to key visitor information in a bold, modern layout.",
    url: "https://everness.ro/fesztival",
  },
  {
    title: "BeliefScope.com",
    description: "A self-discovery platform offering free, science-inspired tests on personality, politics, values, careers, relationships, mindset, and power, with instant results and personalized reports.",
    year: 2026,
    url: "https://beliefscope.com",
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

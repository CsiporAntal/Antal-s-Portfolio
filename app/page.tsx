import Image from "next/image";
import { socialLinks } from "./lib/config";

export default function Page() {
  return (
      <section>
        <a href={socialLinks.github} target="_blank">
          <Image
              src="/profile.png"
              alt="Profile photo"
              className="rounded-full bg-gray-100 block mt-6 lg:mt-10 mb-10 mx-auto sm:float-right sm:ml-5 sm:mb-5 grayscale-[50%] hover:grayscale-0 transition duration-300"
              unoptimized
              width={160}
              height={160}
              priority
          />

        </a>

        <h1 className="mb-8 text-2xl font-medium group">
          Hi, I'm Csipor Antal{" "}
          <span className="inline-block origin-bottom-left group-hover:animate-[wave_0.8s_ease-in-out]">
    👋
  </span>
        </h1>


        <div className="prose prose-neutral dark:prose-invert">
          <p>
            👨‍💻 I'm a PLC programmer based in{" "}
            <span className="text-blue-600 dark:text-blue-400">Mureș, Romania</span>, working full-time at{" "}
            <span className="text-red-600 dark:text-red-400 font-semibold">Aages S.A.</span>.
            I also work part-time as a web developer, building clean and functional websites with modern technologies.
          </p>

          <p>
            🎓 I studied{" "}
            <span className="text-purple-600 dark:text-purple-400">Computer Engineering</span> at{" "}
            <span className="text-green-600 dark:text-green-400 font-semibold">
            Sapientia University
          </span>{" "}
            in Târgu Mureș, where I developed a strong foundation in both software and hardware automation.
          </p>

          <p>
            ⚙️ I'm passionate about both industrial automation and web technologies. I enjoy bringing structure and logic
            to everything I build from control systems to responsive web interfaces.
          </p>

          <p>
            📚 When I'm not coding, you’ll usually find me exploring new tech, contributing to personal projects or
            learning something new.
          </p>

          <p>
            🤝 Feel free to connect with me on{" "}
            <a
                href={socialLinks.github}
                target="_blank"
                className="text-indigo-600 dark:text-indigo-400 font-medium"
            >
              GitHub
            </a>{" "}
            or{" "}
            <a
                href={socialLinks.email}
                target="_blank"
                className="text-pink-600 dark:text-pink-400 font-medium"
            >
              Email
            </a>
            .
          </p>
        </div>
      </section>
  );
}

import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";

const ThreeScene = lazy(() => import("./ThreeScene"));

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
];

const SKILL_GROUPS = [
  {
    label: "Development",
    items: ["Python · practicing", "C++", "Java", "TypeScript", "JavaScript", "SQL", "React", "Next.js", "Tailwind CSS", "Three.js", "WebAssembly"],
  },
  {
    label: "Support & troubleshooting",
    items: ["Root cause analysis", "Incident diagnosis", "Cross-platform compatibility", "Performance tuning", "Application troubleshooting"],
  },
  {
    label: "Platforms & integration",
    items: ["PostgreSQL", "Supabase", "Firebase", "REST APIs", "OpenAI API", "Firebase Authentication", "Vercel", "Netlify", "Cloudflare", "Git", "GitHub", "Linux"],
  },
  {
    label: "AI / ML & networking",
    items: ["TensorFlow · MoveNet / PoseNet", "Google MediaPipe", "Cisco Packet Tracer", "Routing protocols", "NAT", "HSRP"],
  },
];

const PROJECTS = [
  {
    number: "01",
    name: "KnullVoid MultiGame Web Portal",
    type: "MICRO-FRONTEND · GAMING",
    description:
      "A browser gaming ecosystem spanning 6 portals and 3,000+ games. Integrated the Rust-based Ruffle WebAssembly emulator for 150+ legacy Flash titles, and built webcam gesture controls with MediaPipe.",
    highlights: ["85% ActionScript compatibility", "92%+ gesture accuracy", "<33ms gesture latency"],
    stack: ["React", "WebAssembly", "Rust / Ruffle", "MediaPipe", "Three.js", "Cloudflare"],
    link: "https://knullvoidgames.pages.dev/",
    linkLabel: "Explore portal",
    tone: "mint",
  },
  {
    number: "02",
    name: "FitSyn — AI Fitness Platform",
    type: "FULL-STACK · AI FITNESS",
    description:
      "A 10-module fitness platform with a real-time, browser-based workout assistant. MoveNet tracks 17 body keypoints for rep counting and form feedback; Firebase handles authentication while biometric data stays on-device.",
    highlights: ["17 body keypoints tracked", "10 product modules", "Privacy-first biometric data"],
    stack: ["Next.js", "TensorFlow", "MoveNet / PoseNet", "OpenAI API", "Firebase", "Recharts"],
    link: "https://fitsyn.vercel.app/",
    linkLabel: "Visit FitSyn",
    tone: "blue",
  },
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M4.5 15.5 15 5m0 0H6m9 0v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow"><span />{children}</p>;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
      progressRef.current?.style.setProperty("--scroll-progress", String(progress));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="portfolio-shell">
      <nav className={`site-nav ${scrolled ? "site-nav--scrolled" : ""}`} aria-label="Main navigation">
        <div className="nav-inner">
          <a className="brand" href="#home" aria-label="Krishna Kalwar home"><span className="brand-mark">K</span><span>KRISHNA KALWAR</span></a>
          <div className="nav-links">
            {NAV_LINKS.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
            <a className="nav-contact" href="mailto:Krishnakalwar.kk@gmail.com">Let’s talk <ArrowIcon /></a>
          </div>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            <span /> <span />
          </button>
        </div>
        {menuOpen && <div className="mobile-menu">
          {NAV_LINKS.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>)}
          <a href="mailto:Krishnakalwar.kk@gmail.com" onClick={() => setMenuOpen(false)}>Contact me <ArrowIcon /></a>
        </div>}
        <div className="scroll-progress" ref={progressRef} />
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-scene" aria-hidden="true">
            <Suspense fallback={null}><ThreeScene /></Suspense>
            <div className="scene-readout"><span>ORBITAL SYSTEM</span><span>POINTER TRACKING · ACTIVE</span></div>
          </div>
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-content">
            <div className="availability"><span className="availability-dot" /> MUMBAI, INDIA <span className="availability-divider">/</span> APPLICATION SUPPORT ENGINEER</div>
            <h1>Building apps.<br /><span>Solving what breaks.</span></h1>
            <p className="hero-copy">I’m Krishna Kalwar, an IT graduate who enjoys getting to the root of a problem—from debugging deployed applications to building full-stack products with AI-powered features.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projects">Explore my work <ArrowIcon /></a>
              <a className="button button-secondary" href="mailto:Krishnakalwar.kk@gmail.com">Get in touch <ArrowIcon /></a>
            </div>
            <div className="hero-footnote"><span>APPLICATION SUPPORT ENGINEER</span><span className="hero-footnote-line" /><span>FULL-STACK PROJECT BUILDER</span></div>
          </div>
          <div className="hero-index" aria-hidden="true">01 <span>—</span> 04</div>
          <a className="scroll-cue" href="#about"><span className="scroll-line" /> Scroll to explore</a>
        </section>

        <section className="intro section-wrap" id="about">
          <div className="intro-top"><SectionEyebrow>ABOUT ME</SectionEyebrow><span className="intro-location">BASED IN MUMBAI, INDIA</span></div>
          <div className="intro-grid">
            <h2>Curiosity for how things work.<br /><span>Patience to find out why they don’t.</span></h2>
            <div className="intro-text">
              <p>I’m a BSc IT graduate with a 9.12 CGPI and hands-on experience building, deploying, and maintaining web applications. I’m especially interested in application support: investigating issues methodically, understanding the systems behind them, and helping users get back on track.</p>
              <p>Alongside project work, I practice Python scripting and problem-solving. I’ve worked with APIs, databases, authentication, cloud deployments, and AI/ML integrations across the full build-to-release cycle.</p>
              <a className="text-link" href="mailto:Krishnakalwar.kk@gmail.com">Let’s talk about an opportunity <ArrowIcon /></a>
            </div>
          </div>
          <div className="stats-row">
            <div className="stat"><strong>9.12</strong><span>CGPI · BSc IT</span></div>
            <div className="stat"><strong>3,000<span>+</span></strong><span>Games across 6 portals</span></div>
            <div className="stat"><strong>2</strong><span>Featured full-stack projects</span></div>
            <div className="stat"><strong>2026</strong><span>Graduation year</span></div>
          </div>
        </section>

        <section className="skills-section">
          <div className="section-wrap">
            <SectionEyebrow>WHAT I WORK WITH</SectionEyebrow>
            <div className="section-heading-row"><h2>Skills & toolkit</h2><p>Tools I’ve used while building, deploying, and troubleshooting real projects.</p></div>
            <div className="skills-grid" id="skills">
              {SKILL_GROUPS.map((group, index) => <article className="skill-group" key={group.label}>
                <div className="skill-group-index">0{index + 1}</div>
                <h3>{group.label}</h3>
                <div className="skill-tags">{group.items.map((item) => <span key={item} className={item.includes("practicing") ? "skill-tag skill-tag-note" : "skill-tag"}>{item}</span>)}</div>
              </article>)}
            </div>
          </div>
        </section>

        <section className="projects-section section-wrap" id="projects">
          <SectionEyebrow>SELECTED PROJECTS</SectionEyebrow>
          <div className="section-heading-row projects-heading"><h2>Built, tested & shipped.</h2><p>Personal projects that taught me to think about reliability, performance, and the people using the product.</p></div>
          <div className="project-list">
            {PROJECTS.map((project) => <article
              className={`project-card project-card--${project.tone}`}
              key={project.number}
              onPointerMove={(event) => {
                if (event.pointerType !== "mouse") return;
                const rect = event.currentTarget.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                event.currentTarget.style.setProperty("--pointer-x", `${x * 100}%`);
                event.currentTarget.style.setProperty("--pointer-y", `${y * 100}%`);
                event.currentTarget.style.setProperty("--tilt-x", `${(x - 0.5) * 2.4}deg`);
                event.currentTarget.style.setProperty("--tilt-y", `${(0.5 - y) * 2.4}deg`);
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.setProperty("--tilt-x", "0deg");
                event.currentTarget.style.setProperty("--tilt-y", "0deg");
              }}
            >
              <div className="project-visual">
                <div className="project-visual-top"><span>CASE STUDY <span className="visual-slash">/</span> {project.number}</span><span className="visual-status"><i /> LIVE PROJECT</span></div>
                <div className="visual-orbit visual-orbit-one" /><div className="visual-orbit visual-orbit-two" />
                <div className="visual-center"><span>{project.number}</span><div className="visual-center-line" /><small>{project.type}</small></div>
                <div className="visual-bottom"><span>KRISHNA KALWAR</span><span>VIEW PROJECT <ArrowIcon /></span></div>
              </div>
              <div className="project-detail">
                <div className="project-type">{project.type}</div>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="project-highlights">{project.highlights.map((highlight) => <span key={highlight}><i />{highlight}</span>)}</div>
                <div className="project-stack">{project.stack.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <a className="text-link" href={project.link} target="_blank" rel="noreferrer">{project.linkLabel} <ArrowIcon /></a>
              </div>
            </article>)}
          </div>
        </section>

        <section className="education-section" id="education">
          <div className="section-wrap education-grid">
            <div><SectionEyebrow>EDUCATION</SectionEyebrow><h2>Grounded in<br /><span>information technology.</span></h2></div>
            <div className="education-card"><div className="education-date">2022 — 2026 <span>·</span> MUMBAI UNIVERSITY</div><h3>Bachelor of Science<br />in Information Technology</h3><p>Seth Hirachand Mutha College of Arts, Commerce and Science</p><div className="education-results"><div><strong>9.12</strong><span>CGPI</span></div><div><strong>9.00</strong><span>Semester VI SGPI</span></div><div><strong>15 yrs</strong><span>Full-time education</span></div></div></div>
          </div>
        </section>

        <section className="contact-section section-wrap" id="contact">
          <div className="contact-kicker">HAVE A ROLE OR A TECHNICAL CHALLENGE?</div>
          <h2>Let’s make the<br /><span>next thing work.</span></h2>
          <p>Interested in Application Support Engineer opportunities and teams that value thoughtful troubleshooting.</p>
          <a className="button button-primary contact-button" href="mailto:Krishnakalwar.kk@gmail.com">Krishnakalwar.kk@gmail.com <ArrowIcon /></a>
          <div className="contact-links">
            <a className="text-link" href="https://www.linkedin.com/in/krishna-kalwar-8b360038b/" target="_blank" rel="noreferrer">Connect on LinkedIn <ArrowIcon /></a>
            <a className="text-link" href={`${import.meta.env.BASE_URL}Krishna_Kalwar_A.docx`} download="Krishna_Kalwar_Resume.docx">Download resume <ArrowIcon /></a>
          </div>
          <div className="contact-meta"><span>MUMBAI, INDIA</span><a href="tel:+917249893694">+91 72498 93694</a></div>
        </section>
      </main>

      <footer className="site-footer"><a className="brand" href="#home"><span className="brand-mark">K</span><span>KRISHNA KALWAR</span></a><span>© 2026 Krishna Kalwar · Built with care.</span><a href="https://github.com/krishnakalwar432-ui" target="_blank" rel="noreferrer">GITHUB <ArrowIcon /></a></footer>
    </div>
  );
}

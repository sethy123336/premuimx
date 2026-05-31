import { useEffect, useRef, useState, ReactNode } from "react";

type Variant = "fade-up" | "fade" | "scale" | "slide-left" | "slide-right" | "blur-up";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  variant?: Variant;
  duration?: number;
  once?: boolean;
}

const hiddenStyles: Record<Variant, string> = {
  "fade-up": "opacity-0 translate-y-10",
  "fade": "opacity-0",
  "scale": "opacity-0 scale-95",
  "slide-left": "opacity-0 -translate-x-10",
  "slide-right": "opacity-0 translate-x-10",
  "blur-up": "opacity-0 translate-y-6 blur-sm",
};

const Reveal = ({ children, delay = 0, variant = "fade-up", duration = 700, once = true }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms`, transitionDuration: `${duration}ms` }}
      className={`transition-all ease-out will-change-transform ${
        visible ? "opacity-100 translate-x-0 translate-y-0 scale-100 blur-0" : hiddenStyles[variant]
      }`}
    >
      {children}
    </div>
  );
};

export default Reveal;

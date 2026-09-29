"use client";

import { useEffect } from "react";

type MathJaxWindow = Window & {
  MathJax?: {
    typesetPromise?: () => Promise<void>;
  };
};

export function MathJaxLoader() {
  useEffect(() => {
    const browserWindow = window as MathJaxWindow;
    const typeset = () => void browserWindow.MathJax?.typesetPromise?.();
    const existingScript = document.querySelector<HTMLScriptElement>("script[data-killmkill97-mathjax]");

    if (existingScript) {
      existingScript.addEventListener("load", typeset, { once: true });
      typeset();
      return () => existingScript.removeEventListener("load", typeset);
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    script.async = true;
    script.dataset.killmkill97Mathjax = "true";
    script.addEventListener("load", typeset, { once: true });
    document.head.appendChild(script);

    return () => script.removeEventListener("load", typeset);
  }, []);

  return null;
}

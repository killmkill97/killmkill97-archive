"use client";

import { useEffect } from "react";

export type MathJaxInstance = {
  typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
  startup?: { promise?: Promise<unknown>; typeset?: boolean };
  tex?: {
    inlineMath?: string[][];
    displayMath?: string[][];
    processEscapes?: boolean;
  };
};

type MathJaxWindow = Window & { MathJax?: MathJaxInstance };

let mathJaxReady: Promise<MathJaxInstance> | undefined;

export function loadMathJax() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("MathJax can only be loaded in a browser."));
  }

  const browserWindow = window as MathJaxWindow;
  if (browserWindow.MathJax?.typesetPromise) {
    return Promise.resolve(browserWindow.MathJax.startup?.promise).then(() => browserWindow.MathJax!);
  }
  if (mathJaxReady) return mathJaxReady;

  const mathJax = browserWindow.MathJax ?? {};
  mathJax.tex = {
    ...mathJax.tex,
    inlineMath: [["\\(", "\\)"], ["$", "$"]],
    displayMath: [["\\[", "\\]"], ["$$", "$$"]],
    processEscapes: true,
  };
  mathJax.startup = { ...mathJax.startup, typeset: false };
  browserWindow.MathJax = mathJax;

  mathJaxReady = new Promise<MathJaxInstance>((resolve, reject) => {
    const onLoad = () => {
      const loadedMathJax = browserWindow.MathJax;
      if (!loadedMathJax?.typesetPromise) {
        reject(new Error("MathJax loaded without its TeX renderer."));
        return;
      }
      void Promise.resolve(loadedMathJax.startup?.promise).then(() => resolve(loadedMathJax), reject);
    };
    const onError = () => reject(new Error("Could not load MathJax."));
    const existingScript = document.querySelector<HTMLScriptElement>("script[data-killmkill97-mathjax]");

    if (existingScript) {
      existingScript.addEventListener("load", onLoad, { once: true });
      existingScript.addEventListener("error", onError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    script.async = true;
    script.dataset.killmkill97Mathjax = "true";
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    document.head.appendChild(script);
  });

  return mathJaxReady;
}

export function MathJaxLoader() {
  useEffect(() => {
    void loadMathJax().catch((error: unknown) => {
      console.error("Math rendering is unavailable.", error);
    });
  }, []);

  return null;
}

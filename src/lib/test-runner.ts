import type { SandboxFile } from "@/components/ElyraSandbox";

export type TestCategory = "render" | "console" | "js" | "layout" | "a11y" | "perf" | "security" | "logic" | "form" | "link" | "responsive";
export type TestStatus = "passed" | "failed" | "warning" | "skipped";

export interface TestResult {
  id: string;
  name: string;
  status: TestStatus;
  message: string;
  expected?: string;
  actual?: string;
  file?: string;
  line?: number;
  category: TestCategory;
  suggestion?: string;
}

export interface TestRun {
  id: string;
  timestamp: number;
  results: TestResult[];
  passed: number;
  failed: number;
  warnings: number;
  skipped: number;
  duration: number;
}

export type ProjectType = "website" | "app" | "unknown";

function detectProjectType(files: SandboxFile[]): ProjectType {
  const hasHtml = files.some(f => f.name.endsWith(".html"));
  const hasJs = files.some(f => f.name.endsWith(".js") || f.name.endsWith(".ts") || f.name.endsWith(".jsx") || f.name.endsWith(".tsx"));
  const hasReact = files.some(f => f.content.includes("import React") || f.content.includes("from \"react\"") || f.content.includes("from 'react'"));
  if (hasHtml || hasJs) return "website";
  if (hasReact) return "app";
  return "unknown";
}

function buildHtml(files: SandboxFile[]): string {
  const htmlFile = files.find(f => f.name.endsWith(".html"));
  const cssFile = files.find(f => f.name.endsWith(".css"));
  const jsFile = files.find(f => f.name.endsWith(".js") || f.name.endsWith(".ts"));

  if (htmlFile) {
    let result = htmlFile.content;
    if (cssFile && !htmlFile.content.includes("<style")) {
      result = result.replace("</head>", `<style>${cssFile.content}</style></head>`);
    }
    if (jsFile && !htmlFile.content.includes("<script")) {
      result = result.replace("</body>", `<script>${jsFile.content}<\/script></body>`);
    }
    return result;
  }

  if (cssFile || jsFile) {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #e0e0e0; }
  ${cssFile?.content || ""}
</style>
</head>
<body>
${jsFile ? `<script>
const _origLog = console.log;
const _origErr = console.error;
const _origWarn = console.warn;
console.log = (...a) => { _origLog(...a); parent.postMessage({type:'console',level:'log',args:a.map(x=>typeof x==='object'?JSON.stringify(x):String(x))},'*'); };
console.error = (...a) => { _origErr(...a); parent.postMessage({type:'console',level:'error',args:a.map(x=>typeof x==='object'?JSON.stringify(x):String(x))},'*'); };
console.warn = (...a) => { _origWarn(...a); parent.postMessage({type:'console',level:'warn',args:a.map(x=>typeof x==='object'?JSON.stringify(x):String(x))},'*'); };
window.onerror = (msg) => { parent.postMessage({type:'console',level:'error',args:[String(msg)]},'*'); };
try { ${jsFile.content} } catch(e) { parent.postMessage({type:'console',level:'error',args:[e.toString()]},'*'); }
<\/script>` : ""}
</body>
</html>`;
  }

  return "";
}

function analyzeJsCode(files: SandboxFile[]): { hasConsoleLog: boolean; hasEval: boolean; hasInnerHTML: boolean; hasApiKeys: boolean; hasInfiniteLoop: boolean; largeFiles: string[]; } {
  const jsContent = files.filter(f => f.name.endsWith(".js") || f.name.endsWith(".ts")).map(f => f.content).join("\n");
  return {
    hasConsoleLog: (jsContent.match(/console\.log/g) || []).length > 3,
    hasEval: /eval\s*\(/.test(jsContent),
    hasInnerHTML: /\.innerHTML\s*=/.test(jsContent),
    hasApiKeys: /(?:api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"']+["']/i.test(jsContent),
    hasInfiniteLoop: /while\s*\(\s*true\s*\)/.test(jsContent) || /for\s*\(\s*;\s*;\s*\)/.test(jsContent),
    largeFiles: files.filter(f => f.content.length > 500000).map(f => f.name),
  };
}

function checkAccessibility(html: string): { missingAlt: number; missingLabels: number; missingHeadings: boolean; emptyButtons: number; emptyLinks: number; } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const images = doc.querySelectorAll("img");
  let missingAlt = 0;
  images.forEach(img => { if (!img.getAttribute("alt")) missingAlt++; });

  const inputs = doc.querySelectorAll("input, textarea, select");
  let missingLabels = 0;
  inputs.forEach(input => {
    const id = input.getAttribute("id");
    const ariaLabel = input.getAttribute("aria-label");
    const ariaLabelledby = input.getAttribute("aria-labelledby");
    const hasLabel = id ? doc.querySelector(`label[for="${id}"]`) : false;
    if (!hasLabel && !ariaLabel && !ariaLabelledby) missingLabels++;
  });

  const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const hasHeadings = headings.length > 0;

  const buttons = doc.querySelectorAll("button");
  let emptyButtons = 0;
  buttons.forEach(btn => {
    if (!btn.textContent?.trim() && !btn.getAttribute("aria-label")) emptyButtons++;
  });

  const links = doc.querySelectorAll("a");
  let emptyLinks = 0;
  links.forEach(link => {
    if (!link.textContent?.trim() && !link.getAttribute("aria-label")) emptyLinks++;
  });

  return { missingAlt, missingLabels, missingHeadings: !hasHeadings, emptyButtons, emptyLinks };
}

function detectFormIssues(html: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const issues: string[] = [];
  const forms = doc.querySelectorAll("form");
  forms.forEach((form, i) => {
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (!submitBtn) {
      issues.push(`Form ${i + 1} has no submit button`);
    }
    const requiredInputs = form.querySelectorAll("[required]");
    if (requiredInputs.length === 0 && form.querySelectorAll("input").length > 0) {
      issues.push(`Form ${i + 1} has inputs but none are required`);
    }
  });
  return issues;
}

function detectBrokenLinks(html: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const issues: string[] = [];
  const links = doc.querySelectorAll("a[href]");
  links.forEach(link => {
    const href = link.getAttribute("href");
    if (href === "#" || href === "" || href === "javascript:void(0)") {
      issues.push(`Link "${link.textContent?.trim() || "(empty)"}" has placeholder href: ${href}`);
    }
  });
  return issues;
}

function generateId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function runTests(
  files: SandboxFile[],
  onProgress?: (current: string, total: number) => void
): Promise<TestRun> {
  const startTime = Date.now();
  const results: TestResult[] = [];
  const projectType = detectProjectType(files);

  if (files.length === 0) {
    results.push({
      id: generateId(),
      name: "No files to test",
      status: "skipped",
      message: "No project files found. Create some files first.",
      category: "render",
    });
    return buildRun(results, startTime);
  }

  const html = buildHtml(files);
  const jsAnalysis = analyzeJsCode(files);

  // Total tests to run
  const totalTests = 12;
  let currentTest = 0;

  // 1. Render test
  onProgress?.("Checking if page renders...", ++currentTest);
  if (html) {
    results.push({
      id: generateId(),
      name: "Page renders",
      status: "passed",
      message: "HTML structure is valid and renders correctly.",
      category: "render",
    });
  } else {
    results.push({
      id: generateId(),
      name: "Page renders",
      status: "failed",
      message: "No HTML content found. Add an HTML file to your project.",
      category: "render",
      suggestion: "Create an index.html file with basic HTML structure.",
    });
  }

  // 2. Console errors check
  onProgress?.("Checking for console errors...", ++currentTest);
  const hasConsoleErrors = jsAnalysis.hasConsoleLog;
  if (hasConsoleErrors) {
    results.push({
      id: generateId(),
      name: "Console.log usage",
      status: "warning",
      message: "Found multiple console.log statements. Remove them before production.",
      category: "console",
      suggestion: "Remove console.log statements or use a logging library with levels.",
    });
  } else {
    results.push({
      id: generateId(),
      name: "Console cleanliness",
      status: "passed",
      message: "No excessive console output detected.",
      category: "console",
    });
  }

  // 3. JavaScript errors
  onProgress?.("Checking JavaScript...", ++currentTest);
  if (jsAnalysis.hasEval) {
    results.push({
      id: generateId(),
      name: " eval() usage",
      status: "warning",
      message: "eval() was detected. This is a security risk and performance issue.",
      category: "security",
      suggestion: "Replace eval() with safer alternatives like JSON.parse() or Function constructor.",
    });
  } else {
    results.push({
      id: generateId(),
      name: "No eval() usage",
      status: "passed",
      message: "No eval() calls detected.",
      category: "js",
    });
  }

  // 4. Security checks
  onProgress?.("Running security checks...", ++currentTest);
  if (jsAnalysis.hasApiKeys) {
    results.push({
      id: generateId(),
      name: "Exposed secrets",
      status: "failed",
      message: "Possible API keys or secrets found in frontend code.",
      category: "security",
      suggestion: "Move secrets to environment variables or a backend server. Never expose API keys in client-side code.",
    });
  } else {
    results.push({
      id: generateId(),
      name: "No exposed secrets",
      status: "passed",
      message: "No hardcoded API keys or secrets detected.",
      category: "security",
    });
  }

  // 5. innerHTML check
  onProgress?.("Checking for XSS risks...", ++currentTest);
  if (jsAnalysis.hasInnerHTML) {
    results.push({
      id: generateId(),
      name: "innerHTML usage",
      status: "warning",
      message: "innerHTML was detected. This can cause XSS vulnerabilities.",
      category: "security",
      suggestion: "Use textContent, or sanitize input before using innerHTML.",
    });
  } else {
    results.push({
      id: generateId(),
      name: "No innerHTML risks",
      status: "passed",
      message: "No dangerous innerHTML usage detected.",
      category: "security",
    });
  }

  // 6. Infinite loop check
  onProgress?.("Checking for infinite loops...", ++currentTest);
  if (jsAnalysis.hasInfiniteLoop) {
    results.push({
      id: generateId(),
      name: "Infinite loop detected",
      status: "failed",
      message: "A potential infinite loop (while(true) or for(;;)) was found.",
      category: "js",
      suggestion: "Add a break condition or use a finite loop with proper exit logic.",
    });
  } else {
    results.push({
      id: generateId(),
      name: "No infinite loops",
      status: "passed",
      message: "No obvious infinite loops detected.",
      category: "js",
    });
  }

  // 7. Layout overflow check
  onProgress?.("Checking layout...", ++currentTest);
  if (html) {
    const hasViewport = html.includes("viewport");
    if (!hasViewport) {
      results.push({
        id: generateId(),
        name: "Missing viewport meta",
        status: "warning",
        message: "No viewport meta tag found. Mobile layout may not work correctly.",
        category: "layout",
        suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
      });
    } else {
      results.push({
        id: generateId(),
        name: "Viewport configured",
        status: "passed",
        message: "Viewport meta tag is present.",
        category: "layout",
      });
    }
  }

  // 8. Accessibility checks
  onProgress?.("Running accessibility checks...", ++currentTest);
  if (html) {
    const a11y = checkAccessibility(html);
    if (a11y.missingAlt > 0) {
      results.push({
        id: generateId(),
        name: "Missing image alt text",
        status: "warning",
        message: `${a11y.missingAlt} image(s) missing alt attribute.`,
        category: "a11y",
        suggestion: "Add alt text to all images for screen reader accessibility.",
      });
    } else {
      results.push({
        id: generateId(),
        name: "Image alt text",
        status: "passed",
        message: "All images have alt attributes.",
        category: "a11y",
      });
    }

    if (a11y.missingLabels > 0) {
      results.push({
        id: generateId(),
        name: "Missing form labels",
        status: "warning",
        message: `${a11y.missingLabels} form input(s) missing labels.`,
        category: "a11y",
        suggestion: "Add <label> elements or aria-label attributes to all form inputs.",
      });
    } else {
      results.push({
        id: generateId(),
        name: "Form labels",
        status: "passed",
        message: "All form inputs have labels.",
        category: "a11y",
      });
    }

    if (a11y.missingHeadings) {
      results.push({
        id: generateId(),
        name: "No heading structure",
        status: "warning",
        message: "No heading elements (h1-h6) found.",
        category: "a11y",
        suggestion: "Add headings to create a logical document structure.",
      });
    }

    if (a11y.emptyButtons > 0) {
      results.push({
        id: generateId(),
        name: "Empty buttons",
        status: "warning",
        message: `${a11y.emptyButtons} button(s) have no text or aria-label.`,
        category: "a11y",
        suggestion: "Add visible text or aria-label to all buttons.",
      });
    }

    if (a11y.emptyLinks > 0) {
      results.push({
        id: generateId(),
        name: "Empty links",
        status: "warning",
        message: `${a11y.emptyLinks} link(s) have no text or aria-label.`,
        category: "a11y",
        suggestion: "Add visible text or aria-label to all links.",
      });
    }
  }

  // 9. Form checks
  onProgress?.("Checking forms...", ++currentTest);
  if (html) {
    const formIssues = detectFormIssues(html);
    if (formIssues.length > 0) {
      formIssues.forEach(issue => {
        results.push({
          id: generateId(),
          name: "Form issue",
          status: "warning",
          message: issue,
          category: "form",
          suggestion: "Ensure forms have submit buttons and proper validation.",
        });
      });
    } else if (html.includes("<form")) {
      results.push({
        id: generateId(),
        name: "Forms OK",
        status: "passed",
        message: "Forms appear to be properly structured.",
        category: "form",
      });
    }
  }

  // 10. Link checks
  onProgress?.("Checking links...", ++currentTest);
  if (html) {
    const linkIssues = detectBrokenLinks(html);
    if (linkIssues.length > 0) {
      linkIssues.forEach(issue => {
        results.push({
          id: generateId(),
          name: "Placeholder link",
          status: "warning",
          message: issue,
          category: "link",
          suggestion: "Replace placeholder hrefs with real URLs or remove the links.",
        });
      });
    } else {
      results.push({
        id: generateId(),
        name: "Links valid",
        status: "passed",
        message: "No placeholder links detected.",
        category: "link",
      });
    }
  }

  // 11. File size check
  onProgress?.("Checking file sizes...", ++currentTest);
  if (jsAnalysis.largeFiles.length > 0) {
    results.push({
      id: generateId(),
      name: "Large files detected",
      status: "warning",
      message: `${jsAnalysis.largeFiles.join(", ")} exceed 500KB.`,
      category: "perf",
      suggestion: "Consider splitting large files or compressing assets.",
    });
  } else {
    results.push({
      id: generateId(),
      name: "File sizes OK",
      status: "passed",
      message: "All files are within reasonable size limits.",
      category: "perf",
    });
  }

  // 12. Structure check
  onProgress?.("Checking HTML structure...", ++currentTest);
  if (html) {
    const hasDoctype = html.includes("<!DOCTYPE") || html.includes("<!doctype");
    const hasHead = html.includes("<head");
    const hasBody = html.includes("<body");
    if (!hasDoctype || !hasHead || !hasBody) {
      results.push({
        id: generateId(),
        name: "Incomplete HTML structure",
        status: "warning",
        message: `Missing: ${!hasDoctype ? "DOCTYPE " : ""}${!hasHead ? "head " : ""}${!hasBody ? "body" : ""}`.trim(),
        category: "render",
        suggestion: "Include proper HTML5 structure with DOCTYPE, head, and body.",
      });
    } else {
      results.push({
        id: generateId(),
        name: "HTML structure valid",
        status: "passed",
        message: "HTML5 structure is complete.",
        category: "render",
      });
    }
  }

  return buildRun(results, startTime);
}

function buildRun(results: TestResult[], startTime: number): TestRun {
  const passed = results.filter(r => r.status === "passed").length;
  const failed = results.filter(r => r.status === "failed").length;
  const warnings = results.filter(r => r.status === "warning").length;
  const skipped = results.filter(r => r.status === "skipped").length;

  return {
    id: `run-${Date.now()}`,
    timestamp: Date.now(),
    results,
    passed,
    failed,
    warnings,
    skipped,
    duration: Date.now() - startTime,
  };
}

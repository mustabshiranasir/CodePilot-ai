import type { Issue } from '../types';

const TEAM_ASSIGNMENTS: Record<string, string> = {
  frontend: 'Developer',
  backend: 'Developer',
  api: 'Developer',
  database: 'Developer',
  security: 'Admin',
  performance: 'Developer',
};

const SCANNED_FILE_TYPES = ['.js', '.jsx', '.ts', '.tsx', '.json', '.yml', '.yaml', '.env', '.sql', '.html', '.css'];

function detectCategoryFromFile(filePath: string): string {
  const path = filePath.toLowerCase();
  if (path.includes('api') || path.includes('route') || path.includes('controller')) return 'api';
  if (path.includes('db') || path.includes('database') || path.includes('sql') || path.includes('schema') || path.includes('migration')) return 'database';
  if (path.includes('frontend') || path.includes('component') || path.includes('page') || path.includes('ui') || path.includes('view') || path.includes('app')) return 'frontend';
  if (path.includes('server') || path.includes('middleware') || path.includes('util') || path.includes('helper') || path.includes('config')) return 'backend';
  return 'backend';
}

function detectIssuesFromCode(fileName: string, code: string, filePath: string): Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'scanId' | 'repositoryId'>[] {
  const issues: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'scanId' | 'repositoryId'>[] = [];
  const lines = code.split('\n');
  const ext = fileName.substring(fileName.lastIndexOf('.'));

  if (!SCANNED_FILE_TYPES.includes(ext) && ext !== '') return [];
  if (fileName.includes('node_modules') || fileName.includes('.git') || fileName.includes('dist') || fileName.includes('build')) return [];

  const isJsLike = ['.js', '.jsx', '.ts', '.tsx'].includes(ext);

  // Code Quality: Unused imports
  if (isJsLike) {
    const importLines: { line: number; text: string; name: string }[] = [];
    lines.forEach((l, i) => {
      const m = l.match(/import\s+(?:\{\s*)?(\w+)(?:\s*,?\s*.*?\})?\s+from/);
      if (m) importLines.push({ line: i + 1, text: l.trim(), name: m[1] });
    });

    importLines.forEach(imp => {
      const nameInCode = lines.some((l, idx) => idx !== imp.line - 1 && l.includes(imp.name));
      if (!nameInCode && !imp.name.includes('React') && !imp.name.includes('useState') && !imp.name.includes('useEffect')) {
        issues.push({
          title: `Unused import: ${imp.name}`,
          description: `The import '${imp.name}' at line ${imp.line} is declared but never used in this file. This increases bundle size and reduces code clarity.`,
          severity: 'low',
          type: 'code_quality',
          category: 'unused_imports',
          filePath: filePath,
          codeSnippet: imp.text,
          rootCause: 'Import was added during development but the dependent code was removed or refactored without cleaning up the import.',
          aiExplanation: `The identifier '${imp.name}' is imported at line ${imp.line} but is not referenced anywhere else in '${fileName}'. Unused imports add noise to the codebase and can slow down bundlers during tree-shaking.`,
          recommendedFix: `Remove the unused import statement:\n- ${imp.text}`,
          assignee: TEAM_ASSIGNMENTS[detectCategoryFromFile(filePath)],
          status: 'detected',
        });
      }
    });

    // Code Quality: Long functions
    let braceCount = 0;
    let funcStart = 0;
    let funcName = '';
    lines.forEach((l, i) => {
      const funcMatch = l.match(/(?:function|const)\s+(\w+)\s*(?:=|\().*\{/);
      if (funcMatch) {
        funcStart = i;
        funcName = funcMatch[1];
        braceCount = (l.match(/\{/g) || []).length - (l.match(/\}/g) || []).length;
      } else if (funcStart >= 0 && braceCount > 0) {
        braceCount += (l.match(/\{/g) || []).length - (l.match(/\}/g) || []).length;
        if (braceCount <= 0 && (i - funcStart) > 60) {
          issues.push({
            title: `Long function: ${funcName}`,
            description: `Function '${funcName}' spans ${i - funcStart + 1} lines. Long functions are harder to read, test, and maintain.`,
            severity: 'medium',
            type: 'code_quality',
            category: 'long_functions',
            filePath: filePath,
            codeSnippet: lines.slice(funcStart, Math.min(funcStart + 5, lines.length)).join('\n'),
            rootCause: 'Function accumulated logic over time without refactoring into smaller, single-responsibility functions.',
            aiExplanation: `'${funcName}' is ${i - funcStart + 1} lines long. Functions exceeding 30 lines often violate the Single Responsibility Principle and should be broken down.`,
            recommendedFix: `Break '${funcName}' into smaller helper functions:\n1. Extract logical blocks into named functions\n2. Each helper should do one thing\n3. Keep functions under 30 lines`,
            assignee: TEAM_ASSIGNMENTS[detectCategoryFromFile(filePath)],
            status: 'detected',
          });
          funcStart = -1;
        }
      } else if (braceCount === 0) {
        funcStart = -1;
      }
    });
  }

  // Security: Exposed API keys / secrets
  if (isJsLike || ext === '.env') {
    const secretPatterns = [
      { regex: /(['"`])[A-Za-z0-9_]{20,}(['"`])/g, label: 'potential API key or secret' },
      { regex: /(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"`][A-Za-z0-9_\-]{16,}['"`]/gi, label: 'hardcoded credential' },
      { regex: /(?:sk-[a-zA-Z0-9]{20,}|pk-[a-zA-Z0-9]{20,})/g, label: 'exposed API key pattern' },
    ];
    secretPatterns.forEach(({ regex, label }) => {
      lines.forEach((l, i) => {
        regex.lastIndex = 0;
        if (regex.test(l) && !l.includes('example') && !l.includes('placeholder') && !l.includes('YOUR_')) {
          issues.push({
            title: `Exposed ${label}`,
            description: `A potential ${label} was detected at line ${i + 1}. Hardcoded secrets in source code are a security risk.`,
            severity: 'critical',
            type: 'security',
            category: 'exposed_secrets',
            filePath: filePath,
            codeSnippet: l.trim().substring(0, 100),
            rootCause: 'Secrets were hardcoded for development convenience and not extracted to environment variables.',
            aiExplanation: `Line ${i + 1} contains what appears to be a ${label}. If committed to version control, this could lead to unauthorized access to external services.`,
            recommendedFix: `1. Move this value to a .env file\n2. Reference via process.env.VARIABLE_NAME\n3. Rotate the exposed key immediately\n4. Add .env to .gitignore`,
          assignee: 'Admin',
          status: 'detected',
        });
      }
    });
    });
  }

  // Security: SQL injection vulnerabilities
  if (isJsLike) {
    lines.forEach((l, i) => {
      if ((l.includes('SELECT') || l.includes('INSERT') || l.includes('UPDATE') || l.includes('DELETE')) &&
          (l.includes('+ ') || l.includes('`') || l.includes('${')) &&
          !l.includes('prepare') && !l.includes('parameterized') && !l.includes('$1') && !l.includes('?')) {
        issues.push({
          title: 'Potential SQL injection vulnerability',
          description: `Possible SQL injection at line ${i + 1}. String concatenation in SQL queries can lead to injection attacks.`,
          severity: 'critical',
          type: 'security',
          category: 'sql_injection',
          filePath: filePath,
          codeSnippet: l.trim().substring(0, 120),
          rootCause: 'Dynamic query construction using string concatenation instead of parameterized queries.',
          aiExplanation: `Line ${i + 1} concatenates user input directly into a SQL query. An attacker could inject malicious SQL by providing crafted input.`,
          recommendedFix: 'Use parameterized queries:\n- SQLite: `db.prepare(query).run(params)`\n- PostgreSQL: `pool.query("SELECT * FROM users WHERE id = $1", [userId])`\n- Avoid string concatenation in queries',
          assignee: 'Admin',
          status: 'detected',
        });
      }
    });
  }

  // Security: Missing authentication middleware
  if (isJsLike && (filePath.includes('api') || filePath.includes('route'))) {
    const hasAuth = lines.some(l => l.includes('auth') || l.includes('verify') || l.includes('middleware') || l.includes('authenticate') || l.includes('protect'));
    if (!hasAuth && lines.some(l => l.includes('app.') || l.includes('router.') || l.includes('express'))) {
      issues.push({
        title: 'Missing authentication middleware',
        description: `File '${fileName}' defines API routes but no authentication middleware was detected. Unauthenticated endpoints expose data.`,
        severity: 'high',
        type: 'security',
        category: 'missing_auth',
        filePath: filePath,
        codeSnippet: lines.slice(0, 5).join('\n'),
        rootCause: 'Authentication middleware was not applied to route definitions.',
        aiExplanation: 'API routes defined without authentication checks are accessible to anyone. All protected endpoints should verify the user session or token before processing requests.',
        recommendedFix: '1. Create an auth middleware function\n2. Apply it to routes: `router.use(authMiddleware)`\n3. Or apply per-route: `router.get("/profile", authMiddleware, handler)`',
        assignee: 'Developer',
        status: 'detected',
      });
    }
  }

  // Performance: Inefficient loops
  if (isJsLike) {
    lines.forEach((l, i) => {
      if (l.includes('.map') && l.includes('.filter') && l.includes('.reduce')) {
        issues.push({
          title: 'Chained array operations causing multiple iterations',
          description: `Chained .map().filter().reduce() at line ${i + 1} iterates the array multiple times. For large datasets this is inefficient.`,
          severity: 'low',
          type: 'performance',
          category: 'inefficient_loops',
          filePath: filePath,
          codeSnippet: l.trim().substring(0, 100),
          rootCause: 'Using separate array methods that each create a new intermediate array instead of a single pass.',
          aiExplanation: 'Each .map(), .filter(), and .reduce() creates a new array and iterates separately. For arrays with thousands of elements, this adds measurable overhead.',
          recommendedFix: 'Replace chained operations with a single .reduce():\n```js\narray.reduce((acc, item) => {\n  if (condition) acc.push(transform(item));\n  return acc;\n}, [])\n```',
          assignee: 'Developer',
          status: 'detected',
        });
      }
    });
  }

  // Architecture: Circular dependencies / too many imports
  if (isJsLike) {
    if (lines.filter(l => l.includes('import') || l.includes('require')).length > 20) {
      issues.push({
        title: 'File has too many imports',
        description: `'${fileName}' imports from ${lines.filter(l => l.includes('import') || l.includes('require')).length} different modules. This suggests poor separation of concerns.`,
        severity: 'medium',
        type: 'architecture',
        category: 'poor_separation',
        filePath: filePath,
        codeSnippet: lines.filter(l => l.includes('import')).slice(0, 3).join('\n'),
        rootCause: 'Single file is handling too many responsibilities instead of delegating to specialized modules.',
        aiExplanation: `This file imports ${lines.filter(l => l.includes('import') || l.includes('require')).length} modules. High import counts indicate the file may violate the Single Responsibility Principle.`,
        recommendedFix: '1. Split into smaller modules by concern\n2. Use barrel exports (index.ts) for clean imports\n3. Each file should have a single clear purpose',
        assignee: 'Lead Developer',
        status: 'detected',
      });
    }
  }

  // Memory Leak: Missing cleanup in useEffect
  if (isJsLike) {
    lines.forEach((l, i) => {
      const useEffectMatch = l.match(/useEffect\s*\(/);
      if (useEffectMatch) {
        const hasCleanup = code.substring(i).match(/return\s+\w+\s*=>/);
        const hasAbortController = code.substring(i).includes('AbortController');
        if (!hasCleanup && !hasAbortController) {
          const hasSubscription = code.substring(i, i + 500).includes('addEventListener') ||
            code.substring(i, i + 500).includes('subscribe') ||
            code.substring(i, i + 500).includes('setInterval');
          if (hasSubscription) {
            issues.push({
              title: `Missing cleanup in useEffect at line ${i + 1}`,
              description: `A useEffect at line ${i + 1} sets up a subscription or event listener but has no cleanup function. This can cause memory leaks.`,
              severity: 'high',
              type: 'performance',
              category: 'memory_leak',
              filePath: filePath,
              codeSnippet: lines.slice(i, Math.min(i + 5, lines.length)).join('\n'),
              rootCause: 'The useEffect hook subscribes to events or intervals but does not return a cleanup function to unsubscribe when the component unmounts.',
              aiExplanation: `Line ${i + 1}: useEffect without cleanup. If the component unmounts before the effect is cleaned up, event listeners or subscriptions will continue running, causing memory leaks and potential bugs.`,
              recommendedFix: `Add a cleanup return function:\n\`\`\`js\nuseEffect(() => {\n  // your effect code\n  return () => {\n    // cleanup: removeEventListener, clearInterval, unsubscribe\n  };\n}, []);\n\`\`\``,
              assignee: TEAM_ASSIGNMENTS[detectCategoryFromFile(filePath)],
              status: 'detected',
            });
          }
        }
      }
    });

    // Memory Leak: setInterval without clearInterval
    lines.forEach((l, i) => {
      const intervalMatch = l.match(/setInterval\s*\(/);
      if (intervalMatch) {
        const varName = l.match(/const\s+(\w+)\s*=\s*setInterval/);
        const nameToCheck = varName ? varName[1] : 'interval';
        const hasClear = code.includes(`clearInterval(${nameToCheck})`) || code.includes(`clearInterval(${nameToCheck}`);
        if (!hasClear) {
          issues.push({
            title: `setInterval without clearInterval at line ${i + 1}`,
            description: `setInterval at line ${i + 1} is never cleared. This interval will run indefinitely even after the component unmounts.`,
            severity: 'high',
            type: 'performance',
            category: 'memory_leak',
            filePath: filePath,
            codeSnippet: l.trim(),
            rootCause: 'The interval reference is stored but clearInterval is never called in a cleanup or unmount lifecycle.',
            aiExplanation: `Line ${i + 1}: setInterval without clearInterval creates a repeating timer that survives component unmounts, leading to memory leaks and unexpected behavior.`,
            recommendedFix: `Store the interval ID and clear it on unmount:\n\`\`\`js\nconst intervalId = setInterval(() => {}, 1000);\n// later:\nclearInterval(intervalId);\n\`\`\``,
            assignee: 'Developer',
            status: 'detected',
          });
        }
      }
    });

    // Memory Leak: addEventListener without removeEventListener
    lines.forEach((l, i) => {
      const addListenerMatch = l.match(/addEventListener\s*\(\s*['"`](\w+)['"`]/);
      if (addListenerMatch) {
        const eventName = addListenerMatch[1];
        const hasRemove = code.includes(`removeEventListener('${eventName}')`) || code.includes(`removeEventListener("${eventName}")`);
        if (!hasRemove) {
          issues.push({
            title: `addEventListener without removeEventListener at line ${i + 1}`,
            description: `Event listener for '${eventName}' at line ${i + 1} is added but never removed. This leaks memory over time.`,
            severity: 'medium',
            type: 'performance',
            category: 'memory_leak',
            filePath: filePath,
            codeSnippet: l.trim(),
            rootCause: 'Event listeners are attached to DOM elements or global objects but never detached when the component unmounts.',
            aiExplanation: `Line ${i + 1}: addEventListener('${eventName}') without a corresponding removeEventListener. Each mount adds a new listener, causing accumulated memory usage and potential duplicate handler execution.`,
            recommendedFix: `Store the handler reference and remove it on unmount:\n\`\`\`js\nconst handler = () => {};\nwindow.addEventListener('${eventName}', handler);\n// cleanup:\nwindow.removeEventListener('${eventName}', handler);\n\`\`\``,
            assignee: 'Developer',
            status: 'detected',
          });
        }
      }
    });
  }

  // Performance: Large bundle assets
  if (fileName.endsWith('.json')) {
    const jsonStr = code.replace(/\s/g, '');
    if (jsonStr.length > 10000) {
      issues.push({
        title: `Large JSON file: ${fileName}`,
        description: `'${fileName}' is ${(jsonStr.length / 1024).toFixed(1)}KB. Large JSON files increase bundle size and loading times.`,
        severity: 'medium',
        type: 'performance',
        category: 'large_bundle',
        filePath: filePath,
        codeSnippet: `File size: ~${(jsonStr.length / 1024).toFixed(1)}KB`,
        rootCause: 'Static JSON data was bundled directly instead of being fetched at runtime or paginated.',
        aiExplanation: `At ${(jsonStr.length / 1024).toFixed(1)}KB, this JSON file adds significant weight to the initial bundle. Users must download this entire file before the page becomes interactive.`,
        recommendedFix: '1. Move large data to an API endpoint\n2. Implement pagination for large datasets\n3. Use lazy loading for non-critical data\n4. Consider using a database instead of static files',
        assignee: 'Developer',
        status: 'detected',
      });
    }
  }

  // Security: .env file exposure
  if (fileName === '.env' || fileName.endsWith('.env')) {
    issues.push({
      title: 'Environment file detected in scan',
      description: `An environment file '${fileName}' was found. .env files should never be committed to version control.`,
      severity: 'high',
      type: 'security',
      category: 'env_exposure',
      filePath: filePath,
      codeSnippet: 'File: ' + fileName,
      rootCause: 'Environment configuration file was included in the project root without being gitignored.',
      aiExplanation: '.env files contain sensitive environment variables like API keys and database URLs. If committed, these secrets are exposed to anyone with repository access.',
      recommendedFix: '1. Add .env to .gitignore\n2. Create .env.example with placeholder values\n3. Use a secrets manager for production\n4. Rotate any exposed credentials',
      assignee: 'Admin',
      status: 'detected',
    });
  }

  // Dependency Vulnerability: package.json analysis
  if (fileName === 'package.json') {
    try {
      const pkg = JSON.parse(code);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      const knownVulnerable: Record<string, { version: string; vuln: string; severity: 'low' | 'medium' | 'high' | 'critical' }> = {
        'lodash': { version: '<4.17.21', vuln: 'Prototype pollution (CVE-2020-8203)', severity: 'high' },
        'axios': { version: '<0.21.1', vuln: 'Server-Side Request Forgery (CVE-2020-28168)', severity: 'high' },
        'minimist': { version: '<1.2.6', vuln: 'Prototype pollution (CVE-2021-44906)', severity: 'high' },
        'node-fetch': { version: '<2.6.7', vuln: 'URL request smuggling (CVE-2022-0235)', severity: 'high' },
        'moment': { version: '', vuln: 'Moment.js is deprecated — use date-fns or dayjs instead', severity: 'medium' },
        'ejs': { version: '<3.1.7', vuln: 'Remote code execution (CVE-2022-29078)', severity: 'critical' },
        'underscore': { version: '<1.13.0-2', vuln: 'Arbitrary code execution via template (CVE-2021-23358)', severity: 'critical' },
        'shelljs': { version: '<0.8.5', vuln: 'Improper privilege management (CVE-2022-0144)', severity: 'high' },
        'json5': { version: '<2.2.2', vuln: 'Prototype pollution (CVE-2022-46175)', severity: 'high' },
        'nth-check': { version: '<2.0.1', vuln: 'Inefficient regex (ReDoS) (CVE-2021-3803)', severity: 'medium' },
      };
      for (const [dep, info] of Object.entries(knownVulnerable)) {
          if (deps && dep in deps) {
            const ver = String((deps as Record<string, unknown>)[dep]);
          issues.push({
            title: `Known vulnerability in dependency: ${dep}`,
            description: `${dep}@${ver} — ${info.vuln}`,
            severity: info.severity,
            type: 'security',
            category: 'dependency_vulnerability',
            filePath: filePath,
            codeSnippet: `"${dep}": "${ver}"`,
            rootCause: `The project includes ${dep}@${ver} which has known security vulnerabilities. ${info.vuln}.`,
            aiExplanation: `Dependency '${dep}' at version ${ver} has a known vulnerability: ${info.vuln}. ${info.severity === 'critical' ? 'This should be addressed immediately.' : 'Consider upgrading to a patched version.'}`,
            recommendedFix: `1. Update ${dep} to the latest version: npm install ${dep}@latest\n2. Run npm audit for a full report\n3. Check for breaking changes in the upgrade`,
            assignee: 'Admin',
            status: 'detected',
          });
        }
      }
    } catch {}
  }

  // Folder Structure: check file's directory depth
  const dirs = filePath.split('/');
  if (dirs.length <= 2 && isJsLike) {
    issues.push({
      title: 'File in shallow directory: ' + fileName,
      description: `'${filePath}' is only ${dirs.length - 1} level(s) deep from root. Consider organizing files into feature-based directories.`,
      severity: 'low',
      type: 'architecture',
      category: 'folder_structure',
      filePath: filePath,
      codeSnippet: `Path: ${filePath}`,
      rootCause: 'Files placed directly in src/ or root without subdirectory organization reduce project scalability.',
      aiExplanation: `Files at shallow paths like '${filePath}' make it harder to navigate large projects. Organizing by feature or layer improves maintainability.`,
      recommendedFix: 'Move file into a feature-based directory:\n- `src/components/` for UI components\n- `src/services/` for API calls\n- `src/utils/` for helpers\n- `src/hooks/` for custom hooks',
      assignee: 'Lead Developer',
      status: 'detected',
    });
  }

  return issues;
}

function detectCrossFileIssues(files: { name: string; path: string; content: string }[], scanId: string, repositoryId: string): Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>[] {
  const issues: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  // Duplicate Code Detection: compare normalized code blocks across files
  const jsFiles = files.filter(f => /\.(js|jsx|ts|tsx)$/.test(f.name));
  for (let i = 0; i < jsFiles.length; i++) {
    for (let j = i + 1; j < jsFiles.length; j++) {
      const a = jsFiles[i];
      const b = jsFiles[j];
      const linesA = a.content.split('\n').filter(l => l.trim() && !l.trim().startsWith('import') && !l.trim().startsWith('//'));
      const linesB = b.content.split('\n').filter(l => l.trim() && !l.trim().startsWith('import') && !l.trim().startsWith('//'));

      // Find longest common subsequence of 5+ lines
      for (let si = 0; si < linesA.length - 4; si++) {
        for (let sj = 0; sj < linesB.length - 4; sj++) {
          let matchLen = 0;
          while (si + matchLen < linesA.length && sj + matchLen < linesB.length &&
                 linesA[si + matchLen].trim() === linesB[sj + matchLen].trim()) {
            matchLen++;
          }
          if (matchLen >= 5) {
            const existing = issues.find(ex =>
              ex.title.includes('Duplicate code') &&
              ex.filePath === a.path &&
              ex.codeSnippet === linesA.slice(si, si + 5).join('\n')
            );
            if (!existing) {
              issues.push({
                scanId,
                repositoryId,
                title: `Duplicate code block (${matchLen} lines)`,
                description: `Found a ${matchLen}-line duplicate code block between '${a.name}' and '${b.name}'. Duplicate code increases maintenance cost.`,
                severity: 'medium',
                type: 'code_quality',
                category: 'duplicate_code',
                filePath: a.path,
                codeSnippet: linesA.slice(si, si + Math.min(matchLen, 5)).join('\n'),
                rootCause: 'Code was copied-and-pasted between files instead of being extracted into a shared utility or hook.',
                aiExplanation: `A ${matchLen}-line code block in '${a.name}' is identical to code in '${b.name}'. Changes must now be made in both files, increasing the chance of bugs.`,
                recommendedFix: '1. Extract the duplicated code into a shared module (e.g., `src/utils/shared.ts`)\n2. Import and use the shared function in both files\n3. Remove the duplicate code blocks',
                assignee: TEAM_ASSIGNMENTS[detectCategoryFromFile(a.path)],
                status: 'detected',
              });
            }
            break;
          }
        }
      }
    }
  }

  return issues;
}

export function runScan(
  files: { name: string; path: string; content: string }[],
  scanId: string,
  repositoryId: string,
): Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>[] {
  const allIssues: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  files.forEach(file => {
    const detected = detectIssuesFromCode(file.name, file.content, file.path);
    detected.forEach(issue => {
      allIssues.push({
        ...issue,
        scanId,
        repositoryId,
      });
    });
  });

  // Cross-file analysis
  const crossFileIssues = detectCrossFileIssues(files, scanId, repositoryId);
  allIssues.push(...crossFileIssues);

  // If no issues found in real files, add a synthetic structure/readability issue
  if (allIssues.length === 0 && files.length > 0) {
    const jsFiles = files.filter(f => /\.(js|jsx|ts|tsx)$/.test(f.name));
    if (jsFiles.length === 0) {
      allIssues.push({
        scanId,
        repositoryId,
        title: 'No JavaScript/TypeScript files found for analysis',
        description: `The scanned project contains ${files.length} file(s), but none are JavaScript or TypeScript source files. The scanner analyzes .js, .jsx, .ts, .tsx, and related files.`,
        severity: 'low',
        type: 'architecture',
        category: 'unsupported_files',
        filePath: files[0]?.path || '/',
        codeSnippet: `Files found: ${files.map(f => f.name).join(', ')}`,
        rootCause: 'The uploaded project may contain files in languages not supported by the current scanner.',
        aiExplanation: 'CodePilot AI currently scans JavaScript/TypeScript ecosystems. Non-JS projects will have limited analysis capability.',
        recommendedFix: 'Ensure your project contains analyzable source files (.js, .ts, .jsx, .tsx) for comprehensive scanning.',
        assignee: 'Lead Developer',
        status: 'detected',
      });
    }
  }

  return allIssues;
}

export function calculateScores(issues: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>[]) {
  const total = issues.length;
  const resolved = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const securityIssues = issues.filter(i => i.type === 'security');
  const performanceIssues = issues.filter(i => i.type === 'performance');

  const baseScore = 100;
  const deductPerIssue = Math.min(total * 3, 60);
  const deductPerSecurity = Math.min(securityIssues.length * 10, 30);
  const deductPerPerformance = Math.min(performanceIssues.length * 5, 20);

  const codeQualityScore = Math.max(0, Math.min(100, baseScore - deductPerIssue));
  const securityScore = Math.max(0, Math.min(100, baseScore - deductPerSecurity));
  const performanceScore = Math.max(0, Math.min(100, baseScore - deductPerPerformance));
  const teamProductivityScore = resolved > 0 ? Math.min(100, Math.round((resolved / Math.max(total, 1)) * 100)) : 0;
  const improvementScore = resolved > 0 ? Math.min(100, Math.round((resolved / Math.max(total, 1)) * 100)) : 0;

  return { codeQualityScore, securityScore, performanceScore, teamProductivityScore, improvementScore };
}

export function parseFileTree(files: { path: string; content: string }[]): { name: string; path: string; content: string }[] {
  return files.map(f => ({
    name: f.path.split('/').pop() || f.path,
    path: f.path,
    content: f.content,
  }));
}

import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, CheckCircle, Copy, Keyboard, X } from 'lucide-react';
import { useNotificationHelpers } from './NotificationSystem';

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onReset: () => void;
  isValidating: boolean;
  validationResult?: {
    isValid: boolean;
    message: string;
    score?: number;
  };
  language?: string;
  // placeholder?: string;
  readOnly?: boolean;
}

const THEMES = ["vs-dark", "vs-light", "solarized-dark"];
const Editor: React.FC<EditorProps> = ({
  code,
  onChange,
  onRun,
  onReset,
  isValidating,
  validationResult,
  language = 'python',
  readOnly = false
}) => {
  const [showShortcuts, setShowShortcuts] = React.useState(false);
  const { showSuccessToast, showErrorToast, showInfoToast } = useNotificationHelpers();
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S - Format code
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        let formatted = code;
        if (language === 'javascript' || language === 'typescript') {
          // @ts-ignore
          formatted = window.prettier?.format?.(code, { parser: language, plugins: window.prettierPlugins }) || code;
        } else if (language === 'python') {
          formatted = code.split('\n').map((line: string) => line.trim()).join('\n');
        }
        onChange(formatted);
      }
      
      // Ctrl/Cmd + Enter - Run code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onRun();
      }
      
      // Ctrl/Cmd + R - Reset code
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        onReset();
      }
      
      // F9 - Run code (alternative)
      if (e.key === 'F9') {
        e.preventDefault();
        onRun();
      }
      
      // Ctrl/Cmd + Shift + F - Format code (alternative)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        let formatted = code;
        if (language === 'javascript' || language === 'typescript') {
          // @ts-ignore
          formatted = window.prettier?.format?.(code, { parser: language, plugins: window.prettierPlugins }) || code;
        } else if (language === 'python') {
          formatted = code.split('\n').map((line: string) => line.trim()).join('\n');
        }
        onChange(formatted);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, onChange, onRun]);
  const [theme, setTheme] = React.useState("vs-dark");
  const [showOutput, setShowOutput] = React.useState(false);

  const editorOptions = React.useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 14,
    theme: theme,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    lineNumbers: 'on' as const,
    roundedSelection: false,
    cursorStyle: 'line' as const,
    folding: true,
    showFoldingControls: 'mouseover' as const,
    readOnly,
    contextmenu: !readOnly,
    renderLineHighlight: 'all' as const,
    tabSize: 2,
    insertSpaces: true,
    bracketPairColorization: { enabled: true },
    suggest: {
      showKeywords: true,
      showSnippets: true,
    },
  }), [readOnly, theme]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 bg-dark-800 border-b border-dark-700">
        <h3 className="text-lg font-semibold">Code Editor</h3>
        <div className="flex space-x-2 items-center">
          <label htmlFor="theme-select" className="mr-2">Theme:</label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTheme(e.target.value)}
            className="px-2 py-1 rounded bg-dark-700 text-white border border-dark-600"
          >
            {THEMES.map((t: string) => (
              <option key={t} value={t}>{t === "vs-dark" ? "Dark" : t === "vs-light" ? "Light" : "Solarized Dark"}</option>
            ))}
          </select>
          <motion.button
            onClick={() => {
              onReset();
              showInfoToast('Code reset to original state');
            }}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </motion.button>
          <motion.button
            onClick={() => {
              // Simple Prettier formatting for JS/TS/Python
              let formatted = code;
              let success = false;
              try {
                if (language === 'javascript' || language === 'typescript') {
                  // @ts-ignore
                  formatted = window.prettier.format(code, { parser: language, plugins: window.prettierPlugins });
                  success = true;
                } else if (language === 'python') {
                  // For Python, just basic indentation fix (mock)
                  formatted = code.split('\n').map(line => line.trim()).join('\n');
                  success = true;
                }
              } catch (e) {
                showErrorToast('Formatting failed', 'Please check your code syntax');
              }
              onChange(formatted);
              if (success) {
                showSuccessToast('Code formatted successfully!');
              }
            }}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Format</span>
          </motion.button>
          <motion.button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(code);
                showSuccessToast('Code copied to clipboard!');
              } catch (err) {
                console.error('Failed to copy code:', err);
                showErrorToast('Failed to copy code', 'Please try again or copy manually');
              }
            }}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </motion.button>
          <motion.button
            onClick={onRun}
            disabled={isValidating}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="h-4 w-4" />
            <span>{isValidating ? 'Validating...' : 'Run & Validate'}</span>
          </motion.button>
          <motion.button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Keyboard Shortcuts"
          >
            <Keyboard className="h-4 w-4" />
            <span className="hidden sm:inline">Shortcuts</span>
          </motion.button>
          <motion.button
            onClick={() => setShowOutput(true)}
            className="btn-primary flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Run Code</span>
          </motion.button>
  const [showOutput, setShowOutput] = React.useState(false);
      {showOutput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-900 p-6 rounded shadow-lg w-96">
            <h4 className="text-lg font-bold mb-2">Output</h4>
            <pre className="bg-dark-800 p-2 rounded text-green-400 text-sm mb-4">{`Mock output for code:\n${code.slice(0, 120)}...`}</pre>
            <button className="btn-primary w-full" onClick={() => setShowOutput(false)}>Close</button>
          </div>
        </div>
      )}
        </div>
      </div>

      <div className="flex-1">
        <MonacoEditor
          height="400px"
          language={language}
          value={code}
          onChange={(value: string | undefined) => onChange(value || '')}
          options={editorOptions}
          theme={theme}
        />
      </div>

      {validationResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border-t border-dark-700 ${
            validationResult.isValid 
              ? 'bg-green-900/20 text-green-400' 
              : 'bg-red-900/20 text-red-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            {validationResult.isValid ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-red-400" />
            )}
            <span className="font-medium">
              {validationResult.isValid ? 'Success!' : 'Validation Failed'}
            </span>
            {validationResult.score && (
              <span className="ml-auto font-mono">
                Score: {validationResult.score}/100
              </span>
            )}
          </div>
          <p className="mt-2 text-sm">{validationResult.message}</p>
        </motion.div>
      )}

      {/* Keyboard Shortcuts Panel */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-dark-800 border-t border-dark-700 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold">Keyboard Shortcuts</h4>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Run Code</span>
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-dark-700 rounded text-xs">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-dark-700 rounded text-xs">Enter</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Format Code</span>
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-dark-700 rounded text-xs">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-dark-700 rounded text-xs">S</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Reset Code</span>
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-dark-700 rounded text-xs">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-dark-700 rounded text-xs">R</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Run Code (Alt)</span>
                <kbd className="px-2 py-1 bg-dark-700 rounded text-xs">F9</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Format (Alt)</span>
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-dark-700 rounded text-xs">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-dark-700 rounded text-xs">Shift</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-dark-700 rounded text-xs">F</kbd>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
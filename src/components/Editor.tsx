import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, CheckCircle } from 'lucide-react';

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
}

const Editor: React.FC<EditorProps> = ({
  code,
  onChange,
  onRun,
  onReset,
  isValidating,
  validationResult,
  language = 'python'
}) => {
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    theme: 'vs-dark',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    lineNumbers: 'on' as const,
    roundedSelection: false,
    cursorStyle: 'line' as const,
    folding: true,
    showFoldingControls: 'mouseover' as const,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 bg-dark-800 border-b border-dark-700">
        <h3 className="text-lg font-semibold">Code Editor</h3>
        <div className="flex space-x-2">
          <motion.button
            onClick={onReset}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
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
        </div>
      </div>

      <div className="flex-1">
        <MonacoEditor
          height="400px"
          language={language}
          value={code}
          onChange={(value) => onChange(value || '')}
          options={editorOptions}
          theme="vs-dark"
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
    </div>
  );
};

export default Editor;
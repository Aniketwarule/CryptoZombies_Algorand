import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Target, Lightbulb, CheckCircle, Clock, Trophy } from 'lucide-react';
import Editor from '../components/Editor';
import ProgressTracker from '../components/ProgressTracker';
import { useProgress } from '../context/ProgressContext';

const LessonDetail = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { completeLesson, progress } = useProgress();
  
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    score?: number;
  } | undefined>();

  const currentProgress = lessonId ? progress[lessonId] : undefined;

  // Mock lesson data
  const lessons = {
    'intro-algorand': {
      title: 'Introduction to Algorand',
      description: 'Learn the fundamentals of Algorand blockchain technology',
      content: `
# Welcome to Algorand!

Algorand is a pure proof-of-stake blockchain that provides the foundation for a decentralized economy.

## Key Features:
- Fast finality (< 4 seconds)
- High throughput (1000+ TPS)
- Energy efficient
- Secure and decentralized

## Your Challenge:
Complete the basic Algorand account setup function below.
      `,
      starterCode: `from algosdk import account, mnemonic

def create_algorand_account():
    """
    Create a new Algorand account
    TODO: Implement account creation
    """
    # Your code here
    pass

def get_account_info(address):
    """
    Get account information
    TODO: Return account address and mnemonic
    """
    # Your code here
    pass

# Test your implementation
if __name__ == "__main__":
    # Create account
    private_key, address = create_algorand_account()
    print(f"Address: {address}")
    
    # Get mnemonic
    account_mnemonic = mnemonic.from_private_key(private_key)
    print(f"Mnemonic: {account_mnemonic}")`,
      expectedOutput: 'Account creation with valid address and mnemonic'
    },
    'first-pyteal-contract': {
      title: 'Your First PyTeal Contract',
      description: 'Write your first smart contract using PyTeal',
      content: `
# PyTeal Smart Contracts

PyTeal is a Python library for generating TEAL programs that run on the Algorand blockchain.

## Basic Structure:
- Import PyTeal modules
- Define contract logic
- Compile to TEAL

## Your Challenge:
Create a simple approval program that always returns True.
      `,
      starterCode: `from pyteal import *

def approval_program():
    """
    Simple approval program
    TODO: Return a program that always approves
    """
    # Your code here
    pass

def clear_state_program():
    """
    Clear state program
    TODO: Return a program that always approves clearing
    """
    # Your code here
    pass

if __name__ == "__main__":
    # Compile programs
    approval = approval_program()
    clear_state = clear_state_program()
    
    print("Contract compiled successfully!")`,
      expectedOutput: 'Valid PyTeal programs that compile successfully'
    }
  };

  const currentLesson = lessons[lessonId as keyof typeof lessons];

  useEffect(() => {
    if (currentLesson) {
      setCode(currentLesson.starterCode);
    }
  }, [lessonId, currentLesson]);

  const handleRun = async () => {
    setIsValidating(true);
    setValidationResult(undefined);

    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock validation logic
    const isValid = code.includes('def ') && code.length > 100;
    const score = isValid ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 50) + 20;

    const result = {
      isValid,
      message: isValid 
        ? 'Great job! Your code meets the requirements. The contract compiles successfully and follows best practices.'
        : 'Your code needs some improvements. Make sure to implement all required functions and follow the PyTeal syntax.',
      score
    };

    setValidationResult(result);
    setIsValidating(false);

    if (isValid && lessonId) {
      completeLesson(lessonId, score);
    }
  };

  const handleReset = () => {
    if (currentLesson) {
      setCode(currentLesson.starterCode);
      setValidationResult(undefined);
    }
  };

  if (!currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lesson Not Found</h2>
          <button onClick={() => navigate('/lessons')} className="btn-primary">
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => navigate('/lessons')}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">{currentLesson.title}</h1>
              <p className="text-gray-400">{currentLesson.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Instructions Panel */}
            <div className="xl:col-span-1">
              <div className="card sticky top-24">
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary-500" />
                  <h3 className="text-lg font-semibold">Instructions</h3>
                </div>
                <div className="prose prose-sm text-gray-400 mb-6">
                  <div dangerouslySetInnerHTML={{ 
                    __html: currentLesson.content.replace(/\n/g, '<br />') 
                  }} />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Expected Output:</span>
                    </div>
                    <p className="text-sm text-gray-400">{currentLesson.expectedOutput}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Hint:</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Use the PyTeal documentation and remember to import necessary modules.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <ProgressTracker lessonId={lessonId} />
              </div>
            </div>

            {/* Editor Panel */}
            <div className="xl:col-span-3">
              <div className="card p-0 overflow-hidden">
                <Editor
                  code={code}
                  onChange={setCode}
                  onRun={handleRun}
                  onReset={handleReset}
                  isValidating={isValidating}
                  validationResult={validationResult}
                  language="python"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LessonDetail;
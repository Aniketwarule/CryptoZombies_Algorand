import React from 'react';
import { Github, Twitter, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-800 border-t border-dark-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Learn
            </h3>
            <div className="mt-4 space-y-4">
              <a href="/lessons" className="text-base text-gray-300 hover:text-white transition-colors">
                Browse Lessons
              </a>
              <a href="/about" className="text-base text-gray-300 hover:text-white transition-colors">
                About AlgoZombies
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Resources
            </h3>
            <div className="mt-4 space-y-4">
              <a
                href="https://developer.algorand.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <span>Algorand Developer Portal</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://pyteal.readthedocs.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <span>PyTeal Documentation</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Connect
            </h3>
            <div className="mt-4 flex space-x-6">
              <a
                href="https://github.com/algorand"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <Github className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com/algorand"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-dark-700 pt-8 text-center">
          <p className="text-base text-gray-400">
            © 2024 AlgoZombies. Built for the Algorand community with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
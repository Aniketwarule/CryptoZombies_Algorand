// Footer component with social links and navigation
import React from 'react';
import { Github, Twitter, ExternalLink, Heart, Code } from 'lucide-react';
import { APP_CONFIG } from '../constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-800 border-t border-dark-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Code className="h-6 w-6 text-primary-500" />
              <span className="text-xl font-bold text-white">{APP_CONFIG.name}</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              {APP_CONFIG.description}
            </p>
            <p className="text-sm text-gray-500 flex items-center">
              Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for the Algorand community
            </p>
          </div>
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
              <a
                href="https://github.com/algorand/smart-contracts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <span>Smart Contract Examples</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Community
            </h3>
            <div className="mt-4 space-y-4">
              <a
                href="https://discord.gg/algorand"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-gray-300 hover:text-white transition-colors"
              >
                Discord
              </a>
              <a
                href="https://forum.algorand.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-gray-300 hover:text-white transition-colors"
              >
                Forum
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
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Users, Code, Globe, Award, Shield, Rocket } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Code,
      title: 'Interactive Learning',
      description: 'Learn by doing with real PyTeal code challenges and interactive exercises.',
      color: 'text-blue-500'
    },
    {
      icon: Globe,
      title: 'Blockchain Integration',
      description: 'Deploy and test your smart contracts directly on Algorand TestNet.',
      color: 'text-green-500'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join a growing community of Algorand developers and builders.',
      color: 'text-purple-500'
    },
    {
      icon: Award,
      title: 'Gamified Experience',
      description: 'Earn points, unlock achievements, and track your learning progress.',
      color: 'text-yellow-500'
    },
    {
      icon: Shield,
      title: 'Secure Development',
      description: 'Learn security best practices and common smart contract vulnerabilities.',
      color: 'text-red-500'
    },
    {
      icon: Rocket,
      title: 'Fast & Scalable',
      description: 'Build on Algorand\'s fast, secure, and carbon-neutral blockchain.',
      color: 'text-primary-500'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Developers Learning' },
    { number: '50+', label: 'Interactive Lessons' },
    { number: '95%', label: 'Success Rate' },
    { number: '24/7', label: 'Community Support' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-dark-900 via-dark-800 to-purple-900/20 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-8">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="p-4 bg-primary-500/10 rounded-full"
              >
                <Zap className="h-16 w-16 text-primary-500" />
              </motion.div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About <span className="text-primary-500">AlgoZombies</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              AlgoZombies is a gamified learning platform that makes learning Algorand 
              smart contract development fun, interactive, and accessible to developers 
              of all skill levels.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Target className="h-8 w-8 text-primary-500" />
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-400 mb-6">
                We believe that learning blockchain development should be engaging, 
                practical, and fun. AlgoZombies transforms traditional tutorials into 
                interactive adventures where you build real projects while mastering 
                Algorand smart contracts.
              </p>
              <p className="text-lg text-gray-400">
                Inspired by CryptoZombies, we've created a comprehensive curriculum 
                that takes you from blockchain basics to advanced DeFi applications, 
                all while building games and interactive projects on Algorand.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Learn. Build. Deploy.</h3>
                <p className="text-gray-400">
                  From zero to hero in Algorand development through hands-on learning
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose AlgoZombies?</h2>
            <p className="text-xl text-gray-400">
              The most effective way to learn Algorand smart contract development
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card text-center"
                >
                  <div className="bg-primary-500/10 rounded-full p-4 w-fit mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
            <p className="text-xl text-gray-400">
              Thousands of developers are already building on Algorand
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Algorand Foundation Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6">Powered by Algorand</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
              AlgoZombies is built on Algorand, the world's most powerful and 
              sustainable blockchain. With its unique Pure Proof-of-Stake consensus 
              mechanism, Algorand enables fast, secure, and scalable decentralized 
              applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://developer.algorand.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-6 py-3"
              >
                Explore Algorand
              </a>
              <a
                href="https://algorand.foundation/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-6 py-3"
              >
                Algorand Foundation
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
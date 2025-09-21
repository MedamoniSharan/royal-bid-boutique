"use client";
import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { motion } from "motion/react";

export function SparklesFooter() {
  return (
    <motion.div 
      className="h-[40rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md relative"
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ 
        duration: 0.8,
        ease: "easeOut"
      }}
    >
      {/* Main title with reveal animation */}
      <motion.h1 
        className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20 mb-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ 
          duration: 0.6,
          delay: 0.2,
          ease: "easeOut"
        }}
      >
        Royal Bid Boutique
      </motion.h1>
      
      {/* SparklesCore container with reveal animation */}
      <motion.div 
        className="w-[40rem] h-40 relative"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ 
          duration: 0.8,
          delay: 0.4,
          ease: "easeOut"
        }}
      >
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </motion.div>

      {/* Additional footer content with reveal animation */}
      <motion.div 
        className="mt-8 text-center text-white/70 relative z-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ 
          duration: 0.6,
          delay: 0.6,
          ease: "easeOut"
        }}
      >
        <p className="text-lg mb-4">Experience the luxury of premium auctions</p>
        <div className="flex justify-center space-x-8 text-sm">
          <motion.span
            whileHover={{ scale: 1.1, color: "#ffffff" }}
            transition={{ duration: 0.2 }}
          >
            Privacy Policy
          </motion.span>
          <motion.span
            whileHover={{ scale: 1.1, color: "#ffffff" }}
            transition={{ duration: 0.2 }}
          >
            Terms of Service
          </motion.span>
          <motion.span
            whileHover={{ scale: 1.1, color: "#ffffff" }}
            transition={{ duration: 0.2 }}
          >
            Contact Us
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}

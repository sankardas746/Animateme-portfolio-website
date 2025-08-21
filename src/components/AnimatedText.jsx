import React, { useEffect, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

const AnimatedText = ({ text, className = '', el: Wrapper = 'div' }) => {
  const words = text.split(" ");
  const controls = useAnimationControls();
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const sequence = async () => {
    await controls.start("visible");
    timeoutRef.current = setTimeout(async () => {
      await controls.start("hidden");
    }, 4500); // Wait for 4.5 seconds after animation starts, then hide
  };

  useEffect(() => {
    // Clear any existing timeouts/intervals when text changes or component unmounts
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);

    if (text) {
      sequence(); // Start initial animation

      // Set up the interval for looping
      intervalRef.current = setInterval(() => {
        sequence();
      }, 6000); // Loop every 6 seconds
    }

    // Cleanup function
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, [controls, text]); // Re-run effect only if controls or text change

  const container = {
    hidden: { opacity: 1 }, // Keep opacity 1 for the container to avoid flickering issues with child hidden states
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const child = {
    hidden: {
      opacity: 0,
      y: '100%',
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
    visible: {
      opacity: 1,
      y: '0%',
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
  };

  return (
    <Wrapper className={className}>
      <motion.span
        variants={container}
        initial="hidden"
        animate={controls}
        className="inline-block"
      >
        {words.map((word, index) => (
          <span key={index} className="inline-block overflow-hidden mr-[0.25em]">
            <motion.span variants={child} className="inline-block">
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Wrapper>
  );
};

export default AnimatedText;
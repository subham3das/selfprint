import React from 'react';
import clsx from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hover?: boolean;
  glass?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  glass = true,
  className,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'rounded-2xl p-5 transition-all duration-200',
        glass
          ? 'bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-xl shadow-black/20'
          : 'bg-slate-900 border border-slate-800',
        hover && 'hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/5',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

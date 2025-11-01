import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'light' | 'medium' | 'subtle';
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ 
  variant = 'light', 
  children, 
  className,
  ...props 
}: GlassCardProps) {
  const variants = {
    light: 'bg-white/40 backdrop-blur-glass',
    medium: 'bg-white/50 backdrop-blur-glass-strong',
    subtle: 'bg-white/25 backdrop-blur-glass'
  };

  return (
    <motion.div
      className={cn(
        'rounded-lg border border-white/30 shadow-glass',
        'transition-all duration-normal',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function GlassButton({ 
  variant = 'primary', 
  size = 'md',
  children, 
  className,
  ...props 
}: GlassButtonProps) {
  const variants = {
    primary: 'bg-metro-blue-500 text-white shadow-[0_4px_12px_rgba(0,120,212,0.3)] hover:bg-metro-blue-700',
    secondary: 'bg-white/25 backdrop-blur-[10px] border border-white/30 text-neutral-900 hover:bg-white/40',
    glass: 'bg-white/25 backdrop-blur-[10px] border-1.5 border-white/30 text-neutral-900 hover:bg-white/40 hover:border-white/45'
  };

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-14 px-8 text-base',
    lg: 'h-16 px-10 text-lg'
  };

  return (
    <motion.button
      className={cn(
        'rounded-md font-semibold transition-all duration-fast',
        'hover:scale-[1.02] active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function GlassInput({ 
  icon, 
  className,
  ...props 
}: GlassInputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
          {icon}
        </div>
      )}
      <input
        className={cn(
          'w-full h-14 px-4 bg-white/25 backdrop-blur-[10px]',
          'border border-white/30 rounded-md',
          'text-neutral-900 placeholder:text-neutral-500',
          'transition-all duration-normal',
          'focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40 focus:border-metro-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          icon && 'pl-12',
          className
        )}
        {...props}
      />
    </div>
  );
}

interface MetroLineBadgeProps {
  line: 'blue' | 'red' | 'aqua' | 'yellow';
  className?: string;
}

export function MetroLineBadge({ line, className }: MetroLineBadgeProps) {
  const colors = {
    blue: 'bg-metro-blue-500',
    red: 'bg-metro-red-500',
    aqua: 'bg-metro-aqua-500',
    yellow: 'bg-metro-yellow-500'
  };

  const names = {
    blue: 'Blue Line',
    red: 'Red Line',
    aqua: 'Aqua Line',
    yellow: 'Yellow Line'
  };

  return (
    <span className={cn(
      'inline-flex items-center h-8 px-4 rounded-full text-white text-sm font-semibold',
      colors[line],
      className
    )}>
      {names[line]}
    </span>
  );
}

interface StatusDotProps {
  status: 'on-time' | 'delayed' | 'maintenance' | 'cancelled';
  showLabel?: boolean;
  className?: string;
}

export function StatusDot({ status, showLabel = false, className }: StatusDotProps) {
  const colors = {
    'on-time': 'bg-success-500',
    'delayed': 'bg-warning-500',
    'maintenance': 'bg-neutral-500',
    'cancelled': 'bg-error-500'
  };

  const labels = {
    'on-time': 'On Time',
    'delayed': 'Delayed',
    'maintenance': 'Maintenance',
    'cancelled': 'Cancelled'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn(
        'w-3 h-3 rounded-full border-2 border-white shadow-sm',
        colors[status],
        status === 'on-time' && 'animate-pulse-slow'
      )} />
      {showLabel && (
        <span className="text-sm text-neutral-700">{labels[status]}</span>
      )}
    </div>
  );
}

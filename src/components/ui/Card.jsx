import React from 'react';

const Card = ({ children, className, ...props }) => (
  <div
    className={`bg-[var(--secondary-bg)] rounded-lg shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:border-[var(--highlight)]/20 border border-[var(--secondary-bg)] ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default React.memo(Card);
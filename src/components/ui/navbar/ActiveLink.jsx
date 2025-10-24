
import { useState, useEffect } from 'react';

const ActiveLink = ({ href, children, ...props }) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(window.location.pathname === href);
  }, [href]);

  return (
    <a
      href={href}
      className={`
        text-white font-semibold uppercase tracking-wider
        relative pb-1
        after:content-[''] after:absolute after:bottom-0 after:left-0 
        after:h-[2px] after:bg-white
        after:transition-all after:duration-300
        ${isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}
      `}
      {...props}
    >
      {children}
    </a>
  );
};

export default ActiveLink;
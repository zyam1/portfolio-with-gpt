import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function Background({ children }: Props) {
  return (
    <div className="gradients-container">
      <main id="main" role="main" className="gradients-bg">
        {children}
      </main>
    </div>
  );
}

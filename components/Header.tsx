
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
        Generational Embrace
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
        Create a heartwarming image of your past and present selves embracing.
        Upload a childhood photo and a recent one to see the magic happen.
      </p>
    </header>
  );
};

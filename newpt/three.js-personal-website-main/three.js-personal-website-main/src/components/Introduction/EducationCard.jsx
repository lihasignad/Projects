import React from 'react';

const EducationCard = () => {
  return (
    <div className="bg-white rounded-lg shadow p-3 md:col-span-7 md:row-span-1 transform transition-transform duration-300 md:hover:scale-[1.03]">
      <div className="flex items-center mb-2">
        <img
          src="/emojis/emoji-edu.webp"
          alt="Education"
          className="w-5 h-5 mr-2"
        />
        <h2 className="text-lg font-bold">Education</h2>
      </div>

      <h3 className="text-lg font-bold">
        B.Tech in <span className="text-green-600">Computer Science (AI/ML)</span>
      </h3>
      <p className="text-sm text-gray-600">Medhavi Skills University | 2025 - 2029</p>

      <p className="text-sm mt-2">
        I am currently in my 2nd year of a 4-year B.Tech program in{' '}
        <span className="text-green-600 font-bold">Computer Science and Engineering</span> with a specialization in{' '}
        <span className="text-green-600 font-bold">Artificial Intelligence and Machine Learning</span> at Medhavi Skills University.
      </p>
    </div>
  );
};

export default EducationCard; 
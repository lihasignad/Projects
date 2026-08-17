import React, { useEffect, useState } from "react";

const LocationCard = () => {
  const [indiaTime, setIndiaTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const timeOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      const now = new Date();
      setIndiaTime(now.toLocaleTimeString('en-US', timeOptions));
    };

    updateTime();
    const intervalId = setInterval(updateTime, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-white rounded-lg px-1 py-1 md:col-span-5 md:row-span-1 relative overflow-hidden transform transition-transform duration-300 hover:scale-105 min-h-[200px] md:min-h-0">
      <a 
        href="https://www.google.com/maps/place/Gangtok,+Sikkim"
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-full h-full cursor-pointer"
      >
        <div className="relative w-full h-full">
          <img
            src="/images/Introduction/gangtok-map.webp"
            alt="Gangtok Map"
            className="w-full h-full md:h-[204px] object-cover rounded-lg"
          />
          <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full absolute top-0 left-0"></div>
          </div>
          <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-0.5 rounded text-xs text-gray-700 origin-bottom-left">
            Gangtok, Sikkim, India
          </div>
          <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-0.5 rounded text-xs text-gray-700 origin-bottom-right">
            {indiaTime}
          </div>
        </div>
      </a>
    </div>
  );
};

export default LocationCard;

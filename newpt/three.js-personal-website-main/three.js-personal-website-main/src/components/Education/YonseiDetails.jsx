import React from 'react';

const YonseiDetails = () => {
    return (
        <div className="relative md:absolute md:top-8 left-1/2 -translate-x-1/2 md:right-8 md:left-auto md:translate-x-0 w-full max-w-[320px] px-2 md:w-auto md:max-w-none flex justify-center items-center p-1.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
            <div className="bg-white w-full md:w-[240px] rounded-2xl shadow-lg flex flex-col items-center overflow-hidden">
                {/* Campus Image*/}
                <div className="w-full p-2 pb-1 flex justify-center items-center">
                    <img
                        src="/images/Education/education-yonseicampus.webp"
                        alt="High School Campus"
                        className="w-full h-[110px] object-cover rounded-xl border border-blue-100"
                    />
                </div>
                {/* Card Content */}
                <div className="w-full p-3 pt-2 flex flex-col items-center">
                    {/* Logo and Title */}
                    <div className="flex items-center w-full mb-2 mt-0">
                        <img
                            src="/images/Education/education-yonsei_logo.webp"
                            alt="School Logo"
                            className="w-10 h-10 mr-2"
                        />
                        <div>
                            <div className="text-lg font-bold leading-tight">Secondary School</div>
                            <div className="flex items-center text-gray-600 text-[13px]">
                                Sikkim, India 🇮🇳
                            </div>
                        </div>
                    </div>
                    <hr className="w-[60%] my-2 border-gray-200" />
                    {/* Details */}
                    <div className="text-gray-700 text-[13px] w-full text-left pl-2">
                        <div className="mb-1 mt-1 font-semibold">Higher Secondary Schooling</div>
                        <div className="mb-1">Stream : <span className="font-medium">Science</span></div>
                        <div className="mb-1">Completed : <span className="font-medium">2024</span></div>
                        <div className="mb-1 flex items-center">Colors :
                            <span className="inline-block w-4 h-4 bg-red-600 rounded-full mx-1 border border-gray-500"></span>
                            <span className="inline-block w-4 h-4 bg-blue-600 rounded-full mx-1 border border-gray-500"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YonseiDetails;
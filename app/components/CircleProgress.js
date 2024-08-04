"use client";
import React, { useEffect, useState } from "react";
// import CountUp from "react-countup";

const CircleProgress = ({ value, max, size = 160 }) => {
  const [progress, setProgress] = useState(0);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Ensure that the client-side rendering handles the progress
    setProgress(value);
  }, [value]);

  const offset = circumference - (progress / max) * circumference;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e0e0e0"
        strokeWidth="10"
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        // stroke="#2a3c47"
        stroke="#033363"
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        fill="none"
        style={{ transition: "stroke-dashoffset 0.35s" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} // Rotate the circle so the progress starts from the top
      />
      <text
        x="50%"
        y="50%"
        alignmentBaseline="middle"
        textAnchor="middle"
        fontSize="40px"
        fill="#000"
      >
        {/* <CountUp start={0} end={value} duration={2.5} /> */}
        {value}
      </text>
    </svg>
  );
};

export default CircleProgress;

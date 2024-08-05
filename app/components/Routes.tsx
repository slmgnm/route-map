"use client";
import React, { useState } from "react";
import Image from "next/image";

interface Route {
  id: string;
  src: string;
  alt: string;
}

const routes: Route[] = [
  { id: "route1", src: "/route1.png", alt: "Route 1 Image" },
  { id: "route2", src: "/route2.png", alt: "Route 2 Image" },
  { id: "route3", src: "/route3.png", alt: "Route 3 Image" },
];

const Routes: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [hoverRoute, setHoverRoute] = useState<string | null>(null);

  const handleMouseEnter = (routeId: string) => {
    setHoverRoute(routeId);
  };

  const handleMouseLeave = () => {
    setHoverRoute(null);
  };

  const handleClick = (routeId: string) => {
    setActiveRoute(routeId);
  };

  const getCurrentRoute = () => hoverRoute || activeRoute;

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center relative">
        {/* Base Image and Overlay Container */}
        <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl h-auto">
          {/* Base Image */}
          <Image
            src="/base.png"
            alt="Base Image"
            layout="responsive"
            width={600}
            height={600}
            className="transition-opacity duration-500"
          />

          {/* Overlay Image */}
          {routes.map((route) => (
            <Image
              key={route.id}
              src={route.src}
              alt={route.alt}
              layout="responsive"
              width={600}
              height={600}
              className={`absolute inset-0 transition-opacity duration-500 ${
                getCurrentRoute() === route.id ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {/* Drawer Toggle Button for small screens */}
        <label
          htmlFor="my-drawer-2"
          className="btn btn-primary drawer-button lg:hidden mt-4"
        >
          Open drawer
        </label>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          {/* Sidebar content */}
          {routes.map((route) => (
            <li key={route.id}>
              <button
                onMouseEnter={() => handleMouseEnter(route.id)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(route.id)}
                className="btn my-2 btn-ghost bg-purple-700 hover:bg-purple-300 text-white"
              >
                {`Route ${route.id.replace("route", "")}`}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Routes;

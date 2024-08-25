import Image from "next/image";

export default function Home() {
  return (
    <main>
      {/* Parent container for the navbar */}
      <div className="flex items-center justify-between h-16 pl-[25%] pr-[30%] border-b">
        {/* Logo section */}
        <div className="flex items-center   ">
          <img
            src="/img/logo3.png"
            alt="logo"
            className="h-full max-h-32" // Full height, no width set to maintain aspect ratio
          />
        </div>

        {/* Middle section for Search and Social */}
        <div className="flex items-center space-x-8">
          <div className="text-base">Search</div>
          <div className="text-base">Social</div>
        </div>

        {/* Sign In / Sign Out section */}
        <div className="flex items-center space-x-4">
          <div className="text-base">Sign In</div>
          <div className="text-base">Sign Out</div>
        </div>
      </div>
    </main>
  );
}

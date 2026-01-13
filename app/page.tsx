"use client";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="game-container w-full max-w-md">
        <div className="bg-gray-900 rounded-lg shadow-2xl p-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">
            Mobile Game
          </h1>
          <p className="text-gray-400 mb-8">
            Game content will go here
          </p>
          <div className="bg-gray-800 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
            <p className="text-gray-500">Game area</p>
          </div>
        </div>
      </div>
    </main>
  );
}

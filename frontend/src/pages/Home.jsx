import { useState } from "react";
import Slidebar from "../components/slidebar";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Myurl } from "../vitesurl";
import { homeContributors } from "../data/homeData";

export default function Home() {
  const [hover, setHover] = useState(false);

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen overflow-x-hidden">

      {/* MAIN */}
      <div className="w-full md:w-2/3 flex flex-col justify-center px-4 md:px-16 py-10">
        
        <h1 className="text-2xl md:text-4xl font-bold">
          Groupe <span className="text-green-500">13</span>
        </h1>

        <div className="mt-10 md:mt-16 w-[70%] md:max-w-xl">
          <h2 className="text-2xl md:text-4xl font-bold">
            Gère plus facilement tes <span className="text-green-500">notes</span>
          </h2>

          <p className="mt-4 text-base md:text-xl text-gray-600">
            Interface simple et rapide.
          </p>
        </div>

        {/* QR CODE */}
        <div className="hidden md:flex p-3 bg-gray-200 w-fit mt-10 rounded-md">
          <QRCodeCanvas value={Myurl} />
        </div>

        {/* BUTTONS */}
        <div className="mt-10 flex flex-wrap gap-4 text-base md:text-xl font-medium">

          <Link
            className="text-green-500 border border-green-500 px-4 py-2 rounded-md hover:bg-green-500 hover:text-white transition"
            to="/login"
          >
            Se connecter
          </Link>

          <Link
            className="text-blue-500 border border-blue-500 px-4 py-2 rounded-md hover:bg-blue-500 hover:text-white transition"
            to="/register"
          >
            S'inscrire
          </Link>

          <a
            href="https://github.com/inovachrist-eng/projet-g12.git"
            target="_blank"
            rel="noreferrer"
            className="text-black border border-black px-4 py-2 rounded-md hover:bg-black hover:text-white transition"
          >
            Dépôt GitHub
          </a>

        </div>
      </div>

      {/* SIDEBAR */}
      <div
        className="hidden md:flex md:w-1/3 relative overflow-hidden h-screen"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <img
          className={`w-full h-full object-cover transition duration-500 ${
            hover ? "scale-110 blur-sm" : "scale-100"
          }`}
          src="home_image.png"
          alt="student"
        />

        <div
          className={`absolute inset-0 flex items-center justify-center transition duration-500 ${
            hover ? "opacity-100 bg-black/40 backdrop-blur-sm" : "opacity-0"
          }`}
        >
          <Slidebar data={{ contributeur: homeContributors }} />
        </div>
      </div>

    </div>
  );
}
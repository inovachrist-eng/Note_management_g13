export default function Slidebar({ data }) {
  return (
    <div className="w-full h-full flex flex-row md:flex-col gap-6 items-center py-6 overflow-x-scroll md:over md:overflow-y-scroll">

      <h1 className="text-2xl font-bold text-white">
        Les collaborateurs
      </h1>

      {data.contributeur.map((contributor) => (
        <div
          key={contributor.id}
          className="flex flex-col items-center gap-3 rounded-xl bg-white w-[80%] p-4 shadow-md hover:scale-105 transition"
        >
          <img
            className="w-20 h-20 rounded-full object-cover"
            src={contributor.img}
            alt={contributor.name}
          />

          <div className="text-center">
            <h1 className="text-lg font-semibold">
              {contributor.name}
            </h1>
            <h2 className="text-gray-500 text-sm">
              {contributor.email}
            </h2>
          </div>
        </div>
      ))}

    </div>
  );
}
import { FaHeart, FaStar } from "react-icons/fa";

export default function RecipeCard({
  title,
  desc,
  imageLink,
  link,
  validated,
  favorited,
  categories = [],
  ratings,
}) {
  return (
    <div className="flex flex-col items-center justify-start mx-0 my-5 p-5 max-w-2xs h-[360px] border-2 border-pastelgreen-200 dark:border-pastelgreen-800 bg-background rounded-md shadow-sm shadow-background shadow-inline">
      <div className="relative flex justify-center bg-black w-3xs aspect-[16/9]">
        <img
          src={imageLink || "/Cookie.png"}
          alt={title}
          className="absolute w-full h-full object-cover border-2 border-pastelyellow-800 dark:border-pastelyellow-100 hover:border-pastelgreen-200 hover:dark:border-pastelgreen-800 transition-all duration-200"
        />
      </div>
      <div className="flex flex-col items-center h-full overflow-hidden">
        {validated ? (
          <a
            href={link}
            className="my-2 text-md md:text-lg text-center text-foreground font-bold visited:text-pastelgreen-800 visited:dark:text-pastelgreen-200 hover:text-pastelyellow-500 hover:dark:text-pastelyellow-200"
          >
            {title}
          </a>
        ) : (
          <a
            href={link}
            className="my-2 text-md md:text-lg text-center text-foreground font-bold hover:text-neutral-500 hover:dark:text-neutral-200 text-neutral-700 dark:text-neutral-300"
          >
            {title}
          </a>
        )}

        <p className="text-sm md:text-md text-center text-pastelyellow-800 dark:text-pastelyellow-100">
          {desc}
        </p>

        {categories?.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="px-2 py-1 rounded-full border text-xs md:text-sm text-foreground"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>

      {!validated ? (
        <div className="flex justify-center relative w-full">
          <div className="absolute top-1 btn-danger p-2 rounded-md">
            <p className="text-2xs md:text-sm text-center text-white">
              Pending Validation
            </p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center relative w-full">
          <div className="absolute top-0">
            <div
              className={`relative inline-block`}
              aria-label={`${ratings.toFixed(1)} out of 5`}
            >
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar
                    key={`grey-star${i}`}
                    size={18}
                    className="text-neutral-300 dark:text-neutral-600"
                    aria-hidden
                  />
                ))}
              </div>
              {ratings && ratings > 0 ? (
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{
                    WebkitMaskImage: `linear-gradient(90deg, black 0%, black ${
                      ratings * 20
                    }%, rgba(0,0,0,0) ${ratings * 20}%, rgba(0,0,0,0) 100%)`,
                    maskImage: `linear-gradient(90deg, black 0%, black ${
                      ratings * 20
                    }%, rgba(0,0,0,0) ${ratings * 20}%, rgba(0,0,0,0) 100%)`,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                  }}
                  aria-hidden
                >
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar
                        key={`fill-star${i}`}
                        size={18}
                        className="text-pastelyellow-500"
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {favorited ? (
        <div className="flex justify-center relative w-full">
          <div className="absolute left-60 top-[-2px] text-pastelmagenta-500 text-md md:text-lg">
            <FaHeart />
          </div>
        </div>
      ) : null}
    </div>
  );
}

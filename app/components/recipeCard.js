export default function RecipeCard({
  title,
  desc,
  imageLink,
  link,
  validated,
}) {
  return (
    <div className="flex flex-col items-center justify-center mx-0 my-5 p-5 max-w-2xs border-2 border-pastelgreen-200 dark:border-pastelgreen-800 bg-background rounded-md shadow-sm shadow-background shadow-inline">
      <div className="relative flex justify-center bg-black w-3xs aspect-[16/9]">
        <img
          src={imageLink || "/Cookie.png"}
          alt={title}
          className="absolute w-full h-full object-cover border-2 border-pastelyellow-800 dark:border-pastelyellow-100 hover:border-pastelgreen-200 hover:dark:border-pastelgreen-800 transition-all duration-200"
        />
      </div>
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
      {!validated ? (
        <div className="flex justify-center relative w-full">
          <div className="absolute top-1 btn-danger p-2 rounded-md">
            <p className="text-2xs md:text-sm text-center text-pastelyellow-800 dark:text-pastelyellow-100">
              Pending Validation
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

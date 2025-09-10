export default function SearchBar({ searchInput = () => {}, categories }) {
  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex">
        <input
          type="text"
          name="title"
          placeholder="Search cookies..."
          className="border rounded-md px-2 py-1 w-full"
          onChange={searchInput}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <select
          name="category"
          className="bg-background color-foreground border rounded-md px-2 py-1 min-w-3xs"
          onChange={searchInput}
          defaultValue="_"
          size={Math.min(categories.length + 1, 6)}
        >
          <option value="_">Any Category</option>
          {categories
            ? categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))
            : null}
        </select>

        <select
          name="type"
          className="bg-background color-foreground border rounded-md px-2 py-1 min-w-3xs"
          onChange={searchInput}
          defaultValue="_"
          size={Math.min(categories.length + 1, 6)}
        >
          <option value="_">Default</option>
          <option value="new">New</option>
          <option value="popular">Best Rated</option>
          <option value="favorited">Favorites</option>
        </select>
      </div>
    </div>
  );
}

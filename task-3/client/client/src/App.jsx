import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/properties";

function App() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Search and filter
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  const [formData, setFormData] = useState({
    property_name: "",
    location: "",
    price: "",
    property_type: "Apartment",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
    image: null,
  });

  const fetchProperties = async () => {
    try {
      setFetching(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load properties");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      property_name: "",
      location: "",
      price: "",
      property_type: "Apartment",
      bedrooms: "",
      bathrooms: "",
      area: "",
      description: "",
      image: null,
    });

    const imageInput = document.getElementById("property-image");

    if (imageInput) {
      imageInput.value = "";
    }

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId && !formData.image) {
      setMessage("Please select a property image");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = new FormData();

      data.append("property_name", formData.property_name);
      data.append("location", formData.location);
      data.append("price", formData.price);
      data.append("property_type", formData.property_type);
      data.append("bedrooms", formData.bedrooms);
      data.append("bathrooms", formData.bathrooms);
      data.append("area", formData.area);
      data.append("description", formData.description);

      if (formData.image) {
        data.append("image", formData.image);
      }

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Request failed");
      }

      setMessage(
        editingId
          ? "Property updated successfully!"
          : "Property added successfully!"
      );

      resetForm();
      await fetchProperties();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property) => {
    setEditingId(property.id);

    setFormData({
      property_name: property.property_name || "",
      location: property.location || "",
      price: property.price || "",
      property_type: property.property_type || "Apartment",
      bedrooms: property.bedrooms ?? "",
      bathrooms: property.bathrooms ?? "",
      area: property.area ?? "",
      description: property.description || "",
      image: null,
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) return;

    try {
      setMessage("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete property");
      }

      setMessage("Property deleted successfully!");

      if (editingId === id) {
        resetForm();
      }

      await fetchProperties();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Failed to delete property");
    }
  };

  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  // Search + filter
  const filteredProperties = properties.filter((property) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      property.property_name?.toLowerCase().includes(searchText) ||
      property.location?.toLowerCase().includes(searchText);

    const matchesType =
      filterType === "All" ||
      property.property_type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-white/80">
                Growfinix Technology
              </p>

              <h1 className="mt-1 text-3xl font-bold md:text-4xl">
                Real Estate Property Listing
              </h1>

              <p className="mt-2 max-w-2xl text-white/80">
                Manage properties and publish beautiful property listings
                with Cloudinary image storage.
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 px-5 py-4 backdrop-blur-sm">
              <p className="text-sm text-white/80">Total Properties</p>
              <p className="text-3xl font-bold">{properties.length}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Add / Edit Property */}
        <section className="mb-10 rounded-3xl bg-white p-6 shadow-xl md:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {editingId ? "Edit Property" : "Add New Property"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingId
                  ? "Update the property details below."
                  : "Enter property details and upload a property image."}
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Property Name
                </label>

                <input
                  type="text"
                  name="property_name"
                  value={formData.property_name}
                  onChange={handleChange}
                  placeholder="Green Valley Residency"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Hyderabad"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="7500000"
                  required
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Property Type
                </label>

                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>House</option>
                  <option>Plot</option>
                  <option>Commercial</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Bedrooms
                </label>

                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="3"
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Bathrooms
                </label>

                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="2"
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Area (sq ft)
                </label>

                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="1800"
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Property Image
                </label>

                <input
                  id="property-image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  required={!editingId}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-100 file:px-4 file:py-2 file:font-semibold file:text-indigo-700"
                />

                {editingId && (
                  <p className="mt-2 text-xs text-slate-500">
                    Leave empty to keep the current image.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the property..."
                rows="4"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {message && (
              <div
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  message.toLowerCase().includes("success")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? editingId
                  ? "Updating Property..."
                  : "Uploading Property..."
                : editingId
                ? "Update Property"
                : "Add Property"}
            </button>
          </form>
        </section>

        {/* Search and Filter */}
        <section className="mb-8 rounded-3xl bg-white p-5 shadow-lg md:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Find a Property
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search by property name or location and filter by type.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔎 Search property name or location..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="All">All Property Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="House">House</option>
              <option value="Plot">Plot</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          {(search || filterType !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterType("All");
              }}
              className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Clear Search & Filter
            </button>
          )}
        </section>

        {/* Listings */}
        <section>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Property Listings
              </h2>

              <p className="mt-1 text-slate-500">
                {filteredProperties.length} matching{" "}
                {filteredProperties.length === 1
                  ? "property"
                  : "properties"}
              </p>
            </div>

            <div className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
              {properties.length} Total
            </div>
          </div>

          {fetching ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-md">
              Loading properties...
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-md">
              <h3 className="text-xl font-semibold text-slate-700">
                No matching properties
              </h3>

              <p className="mt-2 text-slate-500">
                Try a different search or property type.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
              {filteredProperties.map((property) => (
                <article
                  key={property.id}
                  className="group overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={property.image_url}
                      alt={property.property_name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow">
                      {property.property_type}
                    </div>

                    <div className="absolute bottom-4 left-4 rounded-xl bg-slate-900/80 px-4 py-2 text-lg font-bold text-white backdrop-blur-sm">
                      {formatPrice(property.price)}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-800">
                      {property.property_name}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      📍 {property.location}
                    </p>

                    <div className="my-5 grid grid-cols-3 gap-2 border-y border-slate-100 py-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-slate-800">
                          {property.bedrooms ?? "-"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Bedrooms
                        </p>
                      </div>

                      <div className="border-x border-slate-100">
                        <p className="text-lg font-bold text-slate-800">
                          {property.bathrooms ?? "-"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Bathrooms
                        </p>
                      </div>

                      <div>
                        <p className="text-lg font-bold text-slate-800">
                          {property.area ?? "-"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Sq Ft
                        </p>
                      </div>
                    </div>

                    <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                      {property.description ||
                        "Beautiful property with modern amenities and excellent surroundings."}
                    </p>

                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(property)}
                        className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(property.id)}
                        className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-16 border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-500">
          Growfinix Technology Internship • Real Estate Property Listing
        </div>
      </footer>
    </div>
  );
}

export default App;
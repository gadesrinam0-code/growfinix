import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/enquiries";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  destination: "",
  travel_date: "",
  number_of_people: "",
  message: "",
  status: "Pending",
};

function App() {
  const [enquiries, setEnquiries] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // -----------------------------
  // FETCH ENQUIRIES
  // -----------------------------

  const fetchEnquiries = async () => {
    try {
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load enquiries");
      }

      const data = await response.json();
      setEnquiries(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // -----------------------------
  // INPUT CHANGE
  // -----------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // -----------------------------
  // VALIDATION
  // -----------------------------

  const validateForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const destination = formData.destination.trim();

    if (!name) {
      return "Please enter the customer's name.";
    }

    if (name.length < 2) {
      return "Name must contain at least 2 characters.";
    }

    if (!email) {
      return "Please enter an email address.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!destination) {
      return "Please enter a destination.";
    }

    if (destination.length < 2) {
      return "Destination must contain at least 2 characters.";
    }

    if (formData.number_of_people !== "") {
      const people = Number(formData.number_of_people);

      if (!Number.isInteger(people) || people < 1) {
        return "Number of people must be at least 1.";
      }
    }

    return "";
  };

  // -----------------------------
  // CREATE / UPDATE
  // -----------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            destination: formData.destination.trim(),
            travel_date: formData.travel_date || null,
            number_of_people: formData.number_of_people
              ? Number(formData.number_of_people)
              : null,
            message: formData.message.trim(),
            status: formData.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Operation failed.");
      }

      await fetchEnquiries();

      setFormData(emptyForm);
      setEditingId(null);

      setSuccess(
        isEditing
          ? "Enquiry updated successfully."
          : "Enquiry submitted successfully."
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // EDIT
  // -----------------------------

  const handleEdit = (enquiry) => {
    setEditingId(enquiry.id);

    setFormData({
      name: enquiry.name || "",
      email: enquiry.email || "",
      phone: enquiry.phone || "",
      destination: enquiry.destination || "",
      travel_date: enquiry.travel_date
        ? enquiry.travel_date.substring(0, 10)
        : "",
      number_of_people: enquiry.number_of_people ?? "",
      message: enquiry.message || "",
      status: enquiry.status || "Pending",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // -----------------------------
  // CANCEL EDIT
  // -----------------------------

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
    setSuccess("");
  };

  // -----------------------------
  // DELETE
  // -----------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this enquiry?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete enquiry.");
      }

      await fetchEnquiries();

      if (editingId === id) {
        cancelEdit();
      }

      setSuccess("Enquiry deleted successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // -----------------------------
  // COUNTS
  // -----------------------------

  const total = enquiries.length;

  const pending = enquiries.filter(
    (item) => item.status === "Pending"
  ).length;

  const contacted = enquiries.filter(
    (item) => item.status === "Contacted"
  ).length;

  const confirmed = enquiries.filter(
    (item) => item.status === "Confirmed"
  ).length;

  const cancelled = enquiries.filter(
    (item) => item.status === "Cancelled"
  ).length;

  // -----------------------------
  // SEARCH + FILTER
  // -----------------------------

  const filteredEnquiries = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return enquiries.filter((item) => {
      const matchesSearch =
        !search ||
        item.name?.toLowerCase().includes(search) ||
        item.email?.toLowerCase().includes(search) ||
        item.phone?.toLowerCase().includes(search) ||
        item.destination?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, searchTerm, statusFilter]);

  // -----------------------------
  // STATUS STYLE
  // -----------------------------

  const getStatusStyle = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "Contacted":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =========================================
          HEADER
      ========================================== */}

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex min-h-20 items-center justify-between gap-4">

            <div>
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-xl font-bold text-white shadow-lg shadow-blue-200">
                  G
                </div>

                <div>
                  <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Tour Enquiry Management
                  </h1>

                  <p className="text-xs text-slate-500 sm:text-sm">
                    Manage customer enquiries in one place
                  </p>
                </div>

              </div>
            </div>

            <div className="hidden rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 sm:block">
              Growfinix Technology
            </div>

          </div>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* =========================================
            ALERTS
        ========================================== */}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
              ✓
            </span>
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
              !
            </span>
            {error}
          </div>
        )}

        {/* =========================================
            DASHBOARD CARDS
        ========================================== */}

        <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">

          {/* Total */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Total
              </span>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-lg">
                📋
              </span>
            </div>

            <p className="text-3xl font-bold text-slate-900">
              {total}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              All enquiries
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Pending
              </span>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg">
                ⏳
              </span>
            </div>

            <p className="text-3xl font-bold text-amber-600">
              {pending}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Need attention
            </p>
          </div>

          {/* Contacted */}
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Contacted
              </span>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg">
                📞
              </span>
            </div>

            <p className="text-3xl font-bold text-blue-600">
              {contacted}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              In progress
            </p>
          </div>

          {/* Confirmed */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Confirmed
              </span>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                ✓
              </span>
            </div>

            <p className="text-3xl font-bold text-emerald-600">
              {confirmed}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Bookings confirmed
            </p>
          </div>

          {/* Cancelled */}
          <div className="col-span-2 rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md md:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Cancelled
              </span>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-lg">
                ✕
              </span>
            </div>

            <p className="text-3xl font-bold text-red-600">
              {cancelled}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Cancelled enquiries
            </p>
          </div>

        </section>

        {/* =========================================
            FORM
        ========================================== */}

        <section className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Form heading */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-violet-50 px-5 py-6 sm:px-7">

            <div className="flex items-start justify-between gap-4">

              <div>
                <div className="mb-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {editingId ? "UPDATE ENQUIRY" : "NEW ENQUIRY"}
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  {editingId
                    ? "Edit Tour Enquiry"
                    : "Create New Tour Enquiry"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update the customer's enquiry details."
                    : "Enter the customer's details to create a new enquiry."}
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}

            </div>
          </div>

          {/* Form body */}
          <div className="p-5 sm:p-7">

            <form onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Customer Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Destination */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Destination
                  </label>

                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="e.g. Goa, Kerala, Manali"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Travel Date */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Travel Date
                  </label>

                  <input
                    type="date"
                    name="travel_date"
                    value={formData.travel_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* People */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Number of People
                  </label>

                  <input
                    type="number"
                    name="number_of_people"
                    value={formData.number_of_people}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    placeholder="e.g. 4"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Enquiry Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

              </div>

              {/* Message */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Customer Message
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Enter customer requirements or additional details..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Submit */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Enquiry"
                    : "Submit Enquiry"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}

              </div>

            </form>

          </div>
        </section>

        {/* =========================================
            ENQUIRIES
        ========================================== */}

        <section>

          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">
                  Customer Enquiries
                </h2>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {filteredEnquiries.length}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Search, filter and manage incoming enquiries.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search by name, email, destination..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:w-80"
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Contacted">Contacted</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

            </div>

          </div>

          {/* Loading */}
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              <p className="text-sm font-medium text-slate-600">
                Loading enquiries...
              </p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📭
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                No enquiries found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {searchTerm || statusFilter !== "All"
                  ? "Try changing your search or filter."
                  : "Create a new enquiry using the form above."}
              </p>

            </div>
          ) : (
            <>

              {/* =================================
                  DESKTOP TABLE
              ================================= */}

              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[900px]">

                    <thead className="bg-slate-50">
                      <tr>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Customer
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Contact
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Destination
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Travel Date
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          People
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Actions
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {filteredEnquiries.map((enquiry) => (

                        <tr
                          key={enquiry.id}
                          className="border-t border-slate-100 transition hover:bg-slate-50"
                        >

                          <td className="px-5 py-4">

                            <div className="font-semibold text-slate-900">
                              {enquiry.name}
                            </div>

                            <div className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                              {enquiry.message || "No message"}
                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <div className="text-sm text-slate-700">
                              {enquiry.email}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              {enquiry.phone || "No phone"}
                            </div>

                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-slate-700">
                            {enquiry.destination}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {enquiry.travel_date
                              ? new Date(
                                  enquiry.travel_date
                                ).toLocaleDateString()
                              : "—"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {enquiry.number_of_people || "—"}
                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                enquiry.status
                              )}`}
                            >
                              {enquiry.status}
                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(enquiry)
                                }
                                className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(enquiry.id)
                                }
                                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* =================================
                  MOBILE CARDS
              ================================= */}

              <div className="space-y-4 md:hidden">

                {filteredEnquiries.map((enquiry) => (

                  <article
                    key={enquiry.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {enquiry.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {enquiry.email}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          enquiry.status
                        )}`}
                      >
                        {enquiry.status}
                      </span>

                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 text-sm">

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Phone
                        </p>

                        <p className="mt-1 font-medium text-slate-700">
                          {enquiry.phone || "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-blue-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">
                          Destination
                        </p>

                        <p className="mt-1 font-medium text-blue-800">
                          {enquiry.destination}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">

                        <div className="rounded-xl bg-violet-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
                            Travel Date
                          </p>

                          <p className="mt-1 font-medium text-violet-800">
                            {enquiry.travel_date
                              ? new Date(
                                  enquiry.travel_date
                                ).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-emerald-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                            People
                          </p>

                          <p className="mt-1 font-medium text-emerald-800">
                            {enquiry.number_of_people || "—"}
                          </p>
                        </div>

                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Message
                        </p>

                        <p className="mt-1 text-slate-700">
                          {enquiry.message || "No message"}
                        </p>

                      </div>

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <button
                        type="button"
                        onClick={() => handleEdit(enquiry)}
                        className="rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(enquiry.id)
                        }
                        className="rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        Delete
                      </button>

                    </div>

                  </article>

                ))}

              </div>

            </>
          )}

        </section>

      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          Tour Enquiry Management Platform · Growfinix Technology
        </div>
      </footer>

    </div>
  );
}

export default App;
import { useEffect, useState } from "react";

function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("Loading your dashboard...");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You are not logged in.");
      return;
    }

    fetch("http://localhost:5000/api/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Access denied");
        }

        setUser(data.user);
        setMessage("");
      })
      .catch(() => {
        setMessage("Session expired. Please login again.");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setTimeout(() => {
          onLogout();
        }, 1500);
      });
  }, [onLogout]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    onLogout();
  };

  return (
    <div className="min-h-screen px-4 py-10">

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">

          <div>
            <p className="text-blue-300 text-sm font-medium">
              SECUREAUTH
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1">
              Dashboard
            </h1>

            <p className="text-blue-200 mt-2">
              Your secure account overview
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg"
          >
            Logout
          </button>

        </div>

        {message ? (
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
            <div className="text-4xl mb-4">
              ⏳
            </div>

            <p className="text-gray-600">
              {message}
            </p>
          </div>
        ) : (
          <>

            {/* Welcome Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">

              <div className="flex items-center gap-5">

                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Welcome back
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.email}
                  </h2>
                </div>

              </div>

            </div>

            {/* Security Status */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="text-3xl mb-3">🛡️</div>

                <h3 className="font-bold text-gray-900">
                  Authentication
                </h3>

                <p className="text-green-600 font-medium mt-2">
                  Protected
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="text-3xl mb-3">🔑</div>

                <h3 className="font-bold text-gray-900">
                  JWT Session
                </h3>

                <p className="text-green-600 font-medium mt-2">
                  Active
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="text-3xl mb-3">☁️</div>

                <h3 className="font-bold text-gray-900">
                  Database
                </h3>

                <p className="text-green-600 font-medium mt-2">
                  Connected
                </p>
              </div>

            </div>

            {/* User Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8">

              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Account Information
              </h2>

              <div className="space-y-4">

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">
                    User ID
                  </p>

                  <p className="font-semibold text-gray-900 break-all">
                    {user?.userId}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">
                    Email Address
                  </p>

                  <p className="font-semibold text-gray-900">
                    {user?.email}
                  </p>
                </div>

              </div>

              <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-700 font-semibold">
                  🔐 Protected route accessed successfully.
                </p>

                <p className="text-green-600 text-sm mt-1">
                  Your JWT token has been verified by the server.
                </p>
              </div>

            </div>

          </>
        )}

      </div>

    </div>
  );
}

export default Dashboard;
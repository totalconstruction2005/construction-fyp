import React, { useState } from "react";
import { apiClient } from "@shared/api/apiClient";
import { Link } from "react-router-dom";
import { MyNavbar, Footer } from "@layouts";

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    queryType: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryOptions = [
    "Design Your Home",
    "Construct Your Home",
    "Design Your Commercial Project",
    "Buy Designer Villa",
    "Others",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.queryType) {
      newErrors.queryType = "Please select a query type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [showThankYou, setShowThankYou] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      if (submitting) return;
      setSubmitting(true);
      try {
        const result = await apiClient.post<any>("/api/contact/meeting", formData);
        if (result.success) {
          setShowThankYou(true);
          handleReset();
        } else {
          alert(result.message || "Failed to submit request");
        }
      } catch (error: any) {
        console.error("Error submitting contact request:", error);
        alert(error?.message || "Something went wrong. Please check your connection and try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      queryType: "",
      message: "",
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MyNavbar transparent={false} />

      {/* Hero Section with Breadcrumb */}
      <section className="bg-gradient-to-br from-emerald-50 to-emerald-100 py-3 sm:py-5 mt-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center text-xs text-gray-600 mb-3">
            <Link to="/" className="hover:text-emerald-600 transition">
              Home
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="text-emerald-600 font-semibold">Contact Us</span>
          </nav>

          {/* Page Title */}
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Contact Us
            </h1>
            <p className="text-base sm:text-md text-gray-700">
              Get in touch with us to schedule a meeting and discuss your construction project needs.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Location Map */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-emerald-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                  Our Location
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Visit us at our office or reach out through the contact form.
                </p>
              </div>

              {/* Google Map Embed */}
              <div className="relative w-full h-64 lg:h-80">
                <iframe
                  title="Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d212270.5254171164!2d72.8776559!3d33.6844202!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df948974419acb%3A0x984357e1632d30f!2sRawalpindi%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                ></iframe>
              </div>

              {/* Contact Details */}
              <div className="p-6 bg-gray-50 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Phone</p>
                    <p className="text-gray-600 text-sm">+92 332 0515161</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Email</p>
                    <p className="text-gray-600 text-sm">totalconstruction2005@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Address</p>
                    <p className="text-gray-600 text-sm">Rawalpindi, Pakistan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Schedule Your Meeting
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-900 mb-1"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-emerald-500"
                    } focus:ring-2 focus:outline-none transition`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-900 mb-1"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      errors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-emerald-500"
                    } focus:ring-2 focus:outline-none transition`}
                    placeholder="+92 300 0000000"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-900 mb-1"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-emerald-500"
                    } focus:ring-2 focus:outline-none transition`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Query Type Dropdown */}
                <div>
                  <label
                    htmlFor="queryType"
                    className="block text-sm font-semibold text-gray-900 mb-1"
                  >
                    Select Query Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="queryType"
                    name="queryType"
                    value={formData.queryType}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      errors.queryType
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-emerald-500"
                    } focus:ring-2 focus:outline-none transition bg-white`}
                  >
                    <option value="">-- Select a query type --</option>
                    {queryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.queryType && (
                    <p className="mt-1 text-xs text-red-500">{errors.queryType}</p>
                  )}
                </div>

                {/* Message Field (Optional) */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-900 mb-1"
                  >
                    Message <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition resize-none"
                    placeholder="Tell us more about your project..."
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-5 text-sm rounded-lg transition shadow-sm hover:shadow-md"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2.5 px-5 text-sm rounded-lg transition"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal Overlay */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative border border-gray-100 shadow-2xl">
            <button
              onClick={() => setShowThankYou(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
            <div className="text-emerald-500 text-6xl mb-4">✔</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600 text-sm mb-4">
              We have received your request.
            </p>
            <p className="text-gray-600 text-sm">
              Our team will contact you shortly.
            </p>
            <button
              onClick={() => setShowThankYou(false)}
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ContactUs;

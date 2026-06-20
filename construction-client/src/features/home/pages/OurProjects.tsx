import React from "react";
import { MyNavbar } from "@layouts";
import { Footer } from "@layouts";
import img1 from "@assets/img6.jpg";
import img2 from "@assets/img8.jpg";
import img3 from "@assets/img9.jpg";
import img4 from "@assets/img7.jpg";
import img5 from "@assets/img2.jpg";
import img6 from "@assets/img3.jpg";

const OurProjects: React.FC = () => {
  const projects = [
    {
      id: 1,
      title: "Modern Residential Villa",
      description: "A stunning 4-bedroom villa with contemporary design and sustainable features.",
      category: "Residential",
      location: "Austin, TX",
      year: "2024",
      image: img1,
    },
    {
      id: 2,
      title: "Downtown Office Complex",
      description: "Commercial office space with modern amenities and smart building technology.",
      category: "Commercial",
      location: "Chicago, IL",
      year: "2023",
      image: img2,
    },
    {
      id: 3,
      title: "Luxury Home Renovation",
      description: "Complete transformation of a classic home into a modern living space.",
      category: "Renovation",
      location: "Houston, TX",
      year: "2024",
      image: img3,
    },
    {
      id: 4,
      title: "Retail Shopping Center",
      description: "Multi-level shopping center with parking and modern retail spaces.",
      category: "Commercial",
      location: "Dallas, TX",
      year: "2023",
      image: img4,
    },
    {
      id: 5,
      title: "Custom Family Home",
      description: "Spacious family home with open floor plan and outdoor entertainment area.",
      category: "Residential",
      location: "San Antonio, TX",
      year: "2024",
      image: img5,
    },
    {
      id: 6,
      title: "Historic Building Restoration",
      description: "Careful restoration preserving architectural heritage while modernizing interiors.",
      category: "Renovation",
      location: "Austin, TX",
      year: "2023",
      image: img6,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <MyNavbar transparent={false} />
      
      {/* Header Section */}
      <section className="pt-24 pb-12 bg-teal-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase text-lime-300 tracking-wider mb-3">
              Our Portfolio
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Our Projects
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Explore our portfolio of completed projects showcasing quality craftsmanship 
              and innovative design solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 group"
              >
                {/* Project Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-teal-900 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {project.category}
                  </div>
                </div>

                {/* Project Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{project.year}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-teal-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Let's bring your vision to life with our expert construction services.
          </p>
          <a
            href="/book-project"
            className="inline-block bg-lime-300 text-teal-950 px-8 py-3 rounded-full text-sm font-semibold hover:bg-lime-400 transition"
          >
            GET STARTED
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OurProjects;

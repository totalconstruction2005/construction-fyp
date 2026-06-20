import React from "react";
import { Link } from "react-router-dom";
import { MyNavbar, Footer } from "@layouts";

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MyNavbar transparent={false} />
      
      <main className="flex-grow pt-16">
        
        {/* Hero / Intro Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-emerald-100 py-3 sm:py-5 ">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                About Total Construction
              </h1>
              <p className="text-base sm:text-md text-gray-700">
                A modern platform connecting property owners with professional construction services 
                through transparency, technology, and trust.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8 space-y-16">
          
          {/* Company Overview Card */}
          <section>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Who We Are
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Total Construction is a comprehensive construction management platform designed to streamline
                  the entire project lifecycle. We bridge the gap between property owners and construction
                  professionals, making it easier to plan, execute, and monitor building projects with 
                  complete transparency.
                </p>
                <p>
                  Whether you're a homeowner planning a renovation, a developer managing multiple projects, 
                  or a contractor looking for opportunities, Total Construction provides the tools and connections 
                  you need to succeed. Our platform eliminates guesswork and brings clarity to every phase 
                  of construction.
                </p>
                <p>
                  We believe that great construction projects start with great planning, honest communication, 
                  and professional execution. That's why we've built a platform that prioritizes these values 
                  at every step.
                </p>
              </div>
            </div>
          </section>

          {/* Core Services Grid */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                What We Offer
              </h2>
              <p className="text-gray-600">
                Comprehensive tools for every stage of your construction journey
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-1 h-16 bg-emerald-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Cost Estimation
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Accurate, transparent cost breakdowns for your construction projects. Get detailed 
                      estimates for materials, labor, and timelines before you commit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-1 h-16 bg-emerald-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Contractor Hiring
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Connect with vetted, professional contractors who match your project requirements 
                      and budget. Choose from flexible plans and transparent pricing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-1 h-16 bg-emerald-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Project Monitoring
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Real-time updates and milestone tracking keep you informed throughout the construction 
                      process. Stay connected with your team and track progress effortlessly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-1 h-16 bg-emerald-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Design & Visualization
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Transform your ideas into visual plans with our design tools. Create custom layouts 
                      and view 3D visualizations before construction begins.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Values / Differentiators */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Our Approach
              </h2>
              <p className="text-gray-600">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white rounded-lg border border-emerald-200 shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Transparency
                </h3>
                <p className="text-gray-600 text-sm">
                  Clear pricing, honest timelines, and open communication at every stage of your project.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-emerald-200 shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Quality
                </h3>
                <p className="text-gray-600 text-sm">
                  We partner with professionals who maintain the highest standards of workmanship and reliability.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-emerald-200 shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Professional Execution
                </h3>
                <p className="text-gray-600 text-sm">
                  Streamlined workflows and modern tools ensure efficient and timely project delivery.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-emerald-200 shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Client-Focused
                </h3>
                <p className="text-gray-600 text-sm">
                  Your vision and satisfaction drive every decision we make throughout the process.
                </p>
              </div>

            </div>
          </section>

          {/* Call to Action */}
          <section>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 shadow-sm py-10 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Ready to Start Your Project?
              </h3>
              <p className="text-base text-gray-700 max-w-2xl mx-auto">
                Have a project in mind? Let's build it the right way. We're here to help you 
                turn your vision into reality with professional guidance every step of the way.{" "}
                <Link to="/book-project" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">
                  Click here
                </Link>
              </p>
            </div>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default About;

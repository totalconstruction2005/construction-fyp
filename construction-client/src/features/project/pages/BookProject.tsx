import React from "react";
import { useNavigate } from "react-router-dom";
import { MyNavbar, Footer } from "@layouts";

type StepCardProps = {
  stepNumber: number;
  title: string;
  description: React.ReactNode;
  actions?: React.ReactNode;
};

const StepCard: React.FC<StepCardProps> = ({ stepNumber, title, description, actions }) => {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
          {stepNumber}
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          <div className="text-gray-700 mt-2 text-sm sm:text-base">{description}</div>
          {actions && <div className="mt-4 flex flex-col sm:flex-row gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  );
};

const BookProject: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col pt-10">
      <MyNavbar transparent={false} />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <header className="mb-8 sm:mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Guided Journey</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">Start Your Project</h1>
          <p className="text-gray-600 mt-2">
            Follow these simple steps to get your construction project started. This is a friendly guide, not a form.
          </p>
        </header>

        <div className="space-y-6 sm:space-y-8">
          {/* Step 1 */}
          <StepCard
            stepNumber={1}
            title="Step 1: Hire a Contractor"
            description={
              <>
                Booking a project begins by selecting a contractor plan and submitting a request. This helps us match you with the right team and kickstart your project.
              </>
            }
            actions={
              <button
                type="button"
                onClick={() => navigate("/construct-your-house")}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
              >
                Open Construct Your House
              </button>
            }
          />

          {/* Step 2 */}
          <StepCard
            stepNumber={2}
            title="Step 2: Provide Map or Design"
            description={
              <>
                You can upload your house/site map during the contractor request. If you don’t have one, you can generate a map or request a custom design using our visualization tools.
              </>
            }
            actions={
              <>
                <button
                  type="button"
                  onClick={() => navigate("/design-studio")}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm transition"
                >
                  Create / View House Map
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/design-studio/custom-design")}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
                >
                  Request Custom Design
                </button>
              </>
            }
          />

          {/* Step 3 */}
          <StepCard
            stepNumber={3}
            title="Step 3: Track Your Project"
            description={
              <>
                Once your project is submitted and approved, you can track its status, view updates, and follow progress on your personal projects page.
              </>
            }
            actions={
              <button
                type="button"
                onClick={() => navigate("/my-projects")}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
              >
                View Progress Tracking
              </button>
            }
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookProject;

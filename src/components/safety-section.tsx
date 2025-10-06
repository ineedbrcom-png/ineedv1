import { CheckCircle, ShieldCheck } from "lucide-react";

export function SafetySection() {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Safety and Reliability
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Verified Profiles
            </h3>
            <p className="text-gray-600 mb-4">
              All users go through an identity verification process to ensure the security of transactions.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Rating System
            </h3>
            <p className="text-gray-600 mb-4">
              Rate and be rated after each transaction. The 1 to 5-star rating helps maintain a trustworthy community.
            </p>

            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Digital Contract
            </h3>
            <p className="text-gray-600">
              Every deal closed on the platform generates a digital contract with the agreed-upon terms, protecting both parties.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <ShieldCheck className="text-3xl text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">
                Safety Tips
              </h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                <span>Never share sensitive personal data</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                <span>
                  Arrange meetings in public places when necessary
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                <span>
                  Use the platform's messaging system for communication
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                <span>Be wary of proposals well below market value</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                <span>
                  Check user ratings before closing a deal
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

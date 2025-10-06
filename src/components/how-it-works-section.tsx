
"use client";

import { Edit, Handshake, CheckCircle } from "lucide-react";

export function HowItWorksSection() {
  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          How iNeed works?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              1. Create your request
            </h3>
            <p className="text-gray-600">
              Describe what you need, whether it's a product or a service, with as much detail as possible.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Handshake className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              2. Receive offers
            </h3>
            <p className="text-gray-600">
              People interested in fulfilling your request will contact you with proposals and prices.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 text-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              3. Close the deal
            </h3>
            <p className="text-gray-600">
              Choose the best offer, arrange the details, and finalize it securely through the platform.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

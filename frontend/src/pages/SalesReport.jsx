import React from 'react';
import SalesReportComponent from '../components/SalesReport';

function SalesReportPage() {
  const merchantId = "2e8a5"; // You might want to get this from a context or route params

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <SalesReportComponent merchantId={merchantId} />
      </div>
    </div>
  );
}

export default SalesReportPage;

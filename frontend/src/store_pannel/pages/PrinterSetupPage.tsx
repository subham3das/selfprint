import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PrinterSetupWizard } from '../components/printer/PrinterSetupWizard';

export const PrinterSetupPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans antialiased">
      <PrinterSetupWizard
        isOpen={true}
        onClose={() => navigate('/store/dashboard')}
        onPrinterConfigured={() => navigate('/store/dashboard')}
      />
    </div>
  );
};

export default PrinterSetupPage;

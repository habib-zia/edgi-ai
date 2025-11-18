import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { FAQ_DATA } from '@/lib/constants';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: LucideIcon;
}

const FAQSection = () => {
  const [activeTab, setActiveTab] = useState('Series & Videos');
  const [openAccordion, setOpenAccordion] = useState<string | null>('what-is-edge-ai-realty');

  const tabs = [
    'Series & Videos',
    'Billing', 
    'Account',
    'Technical'
  ];


  const currentFAQs = FAQ_DATA[activeTab as keyof typeof FAQ_DATA] || [];

  const toggleAccordion = (questionId: string) => {
    setOpenAccordion(openAccordion === questionId ? null : questionId);
  };

  return (
    <section className="max-w-[1260px] mx-auto px-3 py-4 lg:py-10" aria-labelledby="faq-heading">        
        <div className="text-center mb-8 sm:mb-12 lg:mb-16" id="faq">
        <h1 
          id="faq-heading"
          className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-semibold mb-2 sm:mb-4 lg:mb-1" 
          style={{ color: '#171717' }}
        >
          Frequently Asked Questions
        </h1>
        <p className="text-base sm:text-lg lg:text-[20px] leading-[24px] font-normal px-4 sm:px-0" style={{ color: '#5F5F5F' }}>
          Find answers to common questions about our AI video service.
        </p>
      </div>

      {/* Tabs */}
      <div 
        className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-5 mb-6 sm:mb-8 lg:mb-10 bg-[#ECEFFD] rounded-[30px] sm:rounded-[40px] lg:rounded-[60px] px-2 sm:px-3 lg:px-4 py-4 sm:py-1.5 lg:py-2 w-fit mx-auto"
        role="tablist"
        aria-label="FAQ categories"
      >
        {tabs.map((tabName) => {
          const isActive = activeTab === tabName;

          return (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              className={`px-3 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-[6.4px] rounded-full cursor-pointer text-sm sm:text-base md:text-lg lg:text-[20px] leading-tight sm:leading-normal lg:leading-[32px] font-semibold transition-all duration-300 whitespace-nowrap border-2
                  ${isActive
                  ? 'text-white bg-[#5046E5] border-[#5046E5]'
                  : 'text-[#5046E5] border-[#5046E5] bg-transparent hover:bg-[#5046E5] hover:text-white hover:border-[#5046E5]'
                  }`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`faq-panel-${tabName.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {tabName}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordions */}
      <div 
        className="space-y-3 sm:space-y-4 lg:space-y-6 bg-[#FAFAFA] rounded-[12px] sm:rounded-[14px] lg:rounded-[16px] p-3 sm:p-4 lg:p-6"
        role="tabpanel"
        id={`faq-panel-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
        aria-labelledby={`faq-tab-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {currentFAQs.map((faq: FAQItem, index: number) => {
          const IconComponent = faq.icon;
          const isOpen = openAccordion === faq.id;
          
          return (
            <div
              key={faq.id}
              className="overflow-hidden transition-all duration-300 rounded-none hover:rounded-[12px] sm:hover:rounded-[14px] lg:hover:rounded-[16px] border-b border-[#F1F2F9] mb-0"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <button
                onClick={() => toggleAccordion(faq.id)}
                className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5 lg:py-8 cursor-pointer text-left flex items-center justify-between transition-all duration-200"
                aria-expanded={isOpen}
                aria-controls={`faq-content-${faq.id}`}
              >
                <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-6 flex-1 min-w-0">
                  <div 
                    className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] lg:w-[40px] lg:h-[40px] rounded-full flex items-center justify-start transition-all duration-300 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <IconComponent 
                      size={18} 
                      className="sm:w-[24px] sm:h-[24px] lg:w-[30px] lg:h-[30px]"
                      color={isOpen ? '#4A3AFF' : '#A0A3BD'}
                    />
                  </div>
                  <h3 
                    className="text-base sm:text-[20px] md:text-[24px] lg:text-[32px] leading-tight sm:leading-normal lg:leading-[32px] font-semibold flex-1 min-w-0"
                    style={{ color: '#101010' }}
                  >
                    {faq.question}
                  </h3>
                </div>
                <div className="flex-shrink-0 ml-2 sm:ml-3 lg:ml-4">
                  {isOpen ? (
                    <Minus
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-[28px] lg:h-[28px] transition-all duration-300"
                      style={{ color: '#4A3AFF' }}
                      aria-hidden="true"
                    />
                  ) : (
                      <Plus
                        className="w-5 h-5 sm:w-6 sm:h-6 lg:w-[28px] lg:h-[28px] transition-all duration-300"
                        style={{ color: '#A0A3BD' }}
                        aria-hidden="true"
                      />
                    )}
                </div>
              </button>
              
              <div
                id={`faq-content-${faq.id}`}
                className={`transition-all duration-500 ease-in-out ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                aria-hidden={!isOpen}
              >
                <div className="px-3 sm:px-4 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
                  <div className="pl-0 sm:pl-[41px] lg:pl-[28px] ml-0 sm:ml-2 lg:ml-6">
                    <p 
                      className="text-sm sm:text-[18px] lg:text-[20px] leading-relaxed sm:leading-normal lg:leading-[28px] font-normal"
                      style={{ color: '#5F5F5F' }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default FAQSection;
import React from 'react';
import LoanCalculator from '../components/LoanCalculator';
import { Calculator, ArrowRight, ShieldCheck, Compass, Info } from 'lucide-react';

const LoanCalculatorPage = () => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div className="flex-center" style={{
          width: '55px',
          height: '55px',
          background: 'var(--accent-gradient)',
          color: 'white',
          borderRadius: '12px',
          margin: '0 auto 1.25rem auto'
        }}>
          <Calculator size={26} />
        </div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
          Mortgage <span className="glow-text">EMI Loan Calculator</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0.5rem auto 0 auto', lineHeight: '1.6' }}>
          Evaluate financing thresholds, break down principal vs interest ratios, and forecast amortizations in real-time.
        </p>
      </div>

      {/* Main Grid: Left Calculator / Right Educational Guides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        
        {/* Left Column: Embed Component */}
        <div style={{ gridColumn: 'span 2' }}>
          <LoanCalculator defaultAmount={650000} />
        </div>

        {/* Right Column: Financial Guide */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Guide Card 1 */}
          <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
              <Info size={18} style={{ color: 'var(--primary-color)' }} />
              Mortgage Glossary
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
              <div>
                <strong style={{ color: 'var(--primary-color)' }}>Loan Principal</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  The base capital sum borrowed from the bank or mortgage broker to acquire the property, excluding fees and interest.
                </p>
              </div>
              
              <div>
                <strong style={{ color: 'var(--primary-color)' }}>Annual Interest Rate (%)</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  The annual percentage charged by the lender for the credit facility. Lower interest rates significantly decrease overall repayment.
                </p>
              </div>

              <div>
                <strong style={{ color: 'var(--primary-color)' }}>EMI (Equated Monthly Installment)</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  The fixed payment amount made by the borrower to the lender every calendar month to amortize the loan principal and interest charges.
                </p>
              </div>
            </div>
          </div>

          {/* Tips Card 2 */}
          <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(99,102,241,0.02)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Smart Borrowing Tips</h3>
            
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <ShieldCheck size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '0.15rem' }} />
                <span><strong>The 28/36 Threshold:</strong> Ensure your housing expenses (mortgage EMI, taxes, insurance) do not exceed 28% of your gross monthly income.</span>
              </li>
              
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <ShieldCheck size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '0.15rem' }} />
                <span><strong>Amortization Duration:</strong> Opting for a 15-year tenure instead of 30 increases your monthly EMI but cuts total interest paid by over 50%.</span>
              </li>

              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <ShieldCheck size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '0.15rem' }} />
                <span><strong>Down Payments:</strong> Providing a 20% down payment eliminates the requirement for Private Mortgage Insurance (PMI) in most banks.</span>
              </li>
            </ul>
          </div>

        </aside>

      </div>

    </div>
  );
};

export default LoanCalculatorPage;

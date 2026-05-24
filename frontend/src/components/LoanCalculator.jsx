import React, { useState, useEffect } from 'react';
import { DollarSign, Percent, Calendar, RefreshCw } from 'lucide-react';

const LoanCalculator = ({ defaultAmount = 500000 }) => {
  const [amount, setAmount] = useState(defaultAmount);
  const [interestRate, setInterestRate] = useState(6.5);
  const [duration, setDuration] = useState(15);

  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalRepayment, setTotalRepayment] = useState(0);

  useEffect(() => {
    calculateLoan();
  }, [amount, interestRate, duration]);

  const calculateLoan = () => {
    const P = Number(amount);
    const annualRate = Number(interestRate);
    const years = Number(duration);

    if (P <= 0 || annualRate <= 0 || years <= 0) {
      setEmi(0);
      setTotalInterest(0);
      setTotalRepayment(0);
      return;
    }

    const r = (annualRate / 12) / 100; // Monthly interest rate
    const n = years * 12; // Total number of monthly installments

    // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emiValue = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalRepayValue = emiValue * n;
    const totalInterestValue = totalRepayValue - P;

    setEmi(emiValue);
    setTotalRepayment(totalRepayValue);
    setTotalInterest(totalInterestValue);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const principalPercent = (amount / (totalRepayment || 1)) * 100;
  const interestPercent = 100 - principalPercent;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', background: 'var(--bg-card)' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <DollarSign style={{ color: 'var(--primary-color)' }} />
        <span>Mortgage Loan Calculator</span>
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        
        {/* Sliders Input Block */}
        <div>
          {/* Amount input */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>Loan Principal Amount</label>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(amount)}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="range" 
                min="10000" 
                max="5000000" 
                step="10000" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ flexGrow: 1, accentColor: 'var(--primary-color)' }}
              />
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="form-control"
                style={{ width: '120px', padding: '0.4rem 0.6rem' }}
              />
            </div>
          </div>

          {/* Interest rate input */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>Annual Interest Rate (%)</label>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{interestRate}%</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="range" 
                min="1" 
                max="15" 
                step="0.1" 
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                style={{ flexGrow: 1, accentColor: 'var(--primary-color)' }}
              />
              <input 
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="form-control"
                style={{ width: '120px', padding: '0.4rem 0.6rem' }}
              />
            </div>
          </div>

          {/* Duration in years */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>Loan Duration (Years)</label>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{duration} Years</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="range" 
                min="1" 
                max="30" 
                step="1" 
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{ flexGrow: 1, accentColor: 'var(--primary-color)' }}
              />
              <input 
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="form-control"
                style={{ width: '120px', padding: '0.4rem 0.6rem' }}
              />
            </div>
          </div>
        </div>

        {/* Visual Calculations Dashboard */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          
          {/* Main EMI Card */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Monthly EMI Repayment
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
              {formatCurrency(emi)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              For {duration * 12} monthly payments
            </div>
          </div>

          {/* Details breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Principal Amount:</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Interest Payable:</span>
              <span style={{ fontWeight: 600, color: 'var(--secondary-color)' }}>{formatCurrency(totalInterest)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '0.8rem' }}>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Total Repayment:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formatCurrency(totalRepayment)}</span>
            </div>
          </div>

          {/* Graphical Split bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span>Principal: {principalPercent.toFixed(1)}%</span>
              <span>Interest: {interestPercent.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${principalPercent}%`, background: 'var(--primary-color)', height: '100%' }}></div>
              <div style={{ width: `${interestPercent}%`, background: 'var(--secondary-color)', height: '100%' }}></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LoanCalculator;

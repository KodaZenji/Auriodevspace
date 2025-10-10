
"use client";

import React from "react";

export default function SonicRewardsCalculator() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ 
      background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
      color: 'white',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '48px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div 
            <img
                src="/sonic-labs-logo.png"
                alt="sonic"
              />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-center mb-6" style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #fb923c 0%, #f97316 25%, #ea580c 50%, #3b82f6 75%, #1d4ed8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: '1.2'
        }}>
          Sonic Yaps Rewards Calculator
        </h1>

        {/* Status Badge */}
        <div className="text-center mb-8">
          <div style={{
            display: 'inline-block',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '24px',
            padding: '8px 20px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#22c55e'
          }}>
            Round 1 Rewards Distributed
          </div>
        </div>

        {/* Maintenance Message */}
        <div style={{
          background: 'rgba(251, 146, 60, 0.1)',
          border: '1px solid rgba(251, 146, 60, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            🔧
          </div>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '12px',
            color: 'white'
          }}>
            Site Under Maintenance
          </h2>
          <p style={{
            fontSize: '1.1rem',
            opacity: '0.9',
            lineHeight: '1.6'
          }}>
            The calculator is temporarily unavailable while we update for Season 2.<br/>
            Thank you for your patience!
          </p>
        </div>

        {/* Announcement Box */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: '12px',
            color: '#3b82f6'
          }}>
           Season 1 Complete
          </h3>
          <p style={{
            opacity: '0.9',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            Sonic Yap rewards for Round 1 have been successfully distributed!
          </p>
          <a 
            href="https://x.com/DraculaPresley/status/1976660450751447114" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            📋 View Official Announcement
          </a>
        </div>

        {/* Disclaimer */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <p style={{
            fontSize: '0.95rem',
            opacity: '0.9',
            lineHeight: '1.6',
            margin: 0
          }}>
            <strong> Disclaimer:</strong> This calculator provided unofficial estimates to keep you motivated. 
            The Sonic Labs team decides all final allocations. Always refer to official announcements.
          </p>
        </div>

        {/* Stats Grid - Historical Data */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #fb923c, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              2.5M
            </div>
            <div style={{ fontSize: '0.875rem', opacity: '0.7' }}>
              Total S Tokens
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              1000
            </div>
            <div style={{ fontSize: '0.875rem', opacity: '0.7' }}>
              Total Winners
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center" style={{
          paddingTop: '32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          opacity: '0.7',
          fontSize: '0.875rem'
        }}>
          <p>
            Built for the Sonic community 💚 |{' '}
            <a 
              href="https://x.com/auriosweb3" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: '#94c182',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              auriosweb3
            </a>
            {' '}| Round 2 is live now. Next snapshot Nov1
          </p>
        </div>
      </div>
    </div>
  );
}

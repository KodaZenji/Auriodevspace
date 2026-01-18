'use client';

import { useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';

export default function BuyMeCoffee({ isOpen, onClose }) {
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('base');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Wallet addresses
  const walletAddresses = {
    base: '0x6D8985eC2B7a1101Bfa4Ae5E04EC6B424aAF87fB',
    solana: 'Dr55KeoDYmNCBhF23Nsrrc8ErFtFwGLotq5z8DRKRtGf',
    bnb: '0x6D8985eC2B7a1101Bfa4Ae5E04EC6B424aAF87fB'
  };

  const usdcContracts = {
    base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    solana: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    bnb: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
  };

  const networkInfo = {
    base: { name: 'Base', chainId: 8453, explorer: 'https://basescan.org' },
    solana: { name: 'Solana', explorer: 'https://solscan.io' },
    bnb: { name: 'BNB Chain', chainId: 56, explorer: 'https://bscscan.com' }
  };

  const amounts = [5, 10, 15, 20, 25];

  const getAmount = () => {
    return customAmount ? parseFloat(customAmount) : selectedAmount;
  };

  const copyAddress = async () => {
    await navigator.clipboard.writeText(walletAddresses[selectedNetwork]);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const generatePaymentLink = () => {
    const amount = getAmount();
    const address = walletAddresses[selectedNetwork];

    if (selectedNetwork === 'solana') {
      // Solana Pay link
      return `solana:${address}?amount=${amount}&spl-token=${usdcContracts.solana}&label=Buy%20Me%20Coffee`;
    } else {
      // Ethereum-based chains (Base, BNB)
      const { chainId } = networkInfo[selectedNetwork];
      // MetaMask deep link
      return `https://metamask.app.link/send/${usdcContracts[selectedNetwork]}@${chainId}/transfer?address=${address}&uint256=${amount * 1e6}`;
    }
  };

  const openPaymentLink = () => {
    window.open(generatePaymentLink(), '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-3xl">☕</span>
            <h2 className="text-xl font-bold text-white">Buy Me a Coffee</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Network Selection */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Select Network
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(networkInfo).map((network) => (
                <button
                  key={network}
                  onClick={() => setSelectedNetwork(network)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    selectedNetwork === network
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {networkInfo[network].name}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Select Amount (USDC)
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {amounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedAmount === amount && !customAmount
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Wallet Address */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Wallet Address ({networkInfo[selectedNetwork].name})
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm font-mono break-all">
                {walletAddresses[selectedNetwork]}
              </div>
              <button
                onClick={copyAddress}
                className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg px-3 transition-colors"
              >
                {copiedAddress ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* USDC Contract Info */}
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-gray-400 mb-1">USDC Contract</div>
            <div className="text-xs text-gray-300 font-mono break-all">
              {usdcContracts[selectedNetwork]}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={openPaymentLink}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Open in Wallet</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            
            <div className="text-center text-xs text-gray-400">
              Amount: <span className="text-white font-semibold">${getAmount()} USDC</span>
            </div>
          </div>

          {/* Explorer Link */}
          <div className="text-center">
            <a
              href={`${networkInfo[selectedNetwork].explorer}/address/${walletAddresses[selectedNetwork]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
            >
              View on Explorer
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

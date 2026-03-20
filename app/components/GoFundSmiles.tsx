import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ethers } from 'ethers';
import { Heart, Sparkles, Gift, Users, TrendingUp } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { Modal } from "./ui/modal";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { mockBlockchain } from '../../lib/mockBlockchain';

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const RECIPIENT_ADDRESS = "0xf5526Ff322FBE97c31160A94A380093151Aa442F";

const USDC_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

interface GoFundSmilesProps {
  wallet: any;
}

const GoFundSmiles = ({ wallet }: GoFundSmilesProps) => {
  const { login, authenticated } = usePrivy();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [totalFunds, setTotalFunds] = useState<string>("0");
  const [userBalance, setUserBalance] = useState<string>("0");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useGSAP(() => {
    gsap.fromTo('.fund-animate', 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
    );
  }, []);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!wallet) return;
      try {
        // ==== REAL BLOCKCHAIN LOGIC ====
        /*
        const provider = await wallet.getEthersProvider();
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
        const decimals = await usdcContract.decimals();
        const totalFundsRaw = await usdcContract.balanceOf(RECIPIENT_ADDRESS);
        setTotalFunds(parseFloat(ethers.utils.formatUnits(totalFundsRaw, decimals)).toFixed(2));
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        const userBalanceRaw = await usdcContract.balanceOf(userAddress);
        setUserBalance(parseFloat(ethers.utils.formatUnits(userBalanceRaw, decimals)).toFixed(2));
        */

        // ==== MOCK BLOCKCHAIN LOGIC ====
        setTotalFunds(mockBlockchain.getMockPoolFunds());
        setUserBalance(mockBlockchain.getMockUserBalance());
        
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };
    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [wallet]);

  const handleDonate = async () => {
    if (!amount || !wallet) return;
    setLoading(true);
    try {
      // ==== REAL BLOCKCHAIN LOGIC ====
      /*
      const provider = await wallet.getEthersProvider();
      const signer = provider.getSigner();
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
      const decimals = await usdcContract.decimals();
      const parsedAmount = ethers.utils.parseUnits(amount, decimals);
      const tx = await usdcContract.transfer(RECIPIENT_ADDRESS, parsedAmount);
      await tx.wait();
      */

      // ==== MOCK BLOCKCHAIN LOGIC ====
      const provider = await wallet.getEthersProvider();
      const userAddress = await provider.getSigner().getAddress();
      
      const mockTx = await mockBlockchain.sendTransaction({
        from: userAddress,
        to: RECIPIENT_ADDRESS,
        amount: amount,
        type: 'transfer_usdc'
      });
      await mockTx.wait(1);

      // Simulate balance updates
      setUserBalance((prev) => Math.max(0, parseFloat(prev) - parseFloat(amount)).toFixed(2));
      setTotalFunds((prev) => (parseFloat(prev) + parseFloat(amount)).toFixed(2));
      
      setAmount("");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error donating:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 mx-auto mb-4 flex items-center justify-center">
          <Heart size={28} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Join the Joy Pool</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Connect your wallet to help fund more smiles around the world</p>
        <button onClick={login}
          className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-gray-800 transition-all">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 fund-animate">
        {/* Pool Visualization */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Community Joy Pool</p>
          <div className="text-6xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-1">
            ${totalFunds}
          </div>
          <p className="text-sm text-gray-400">USDC available for smile rewards</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-1000"
              style={{ width: `${Math.min((parseFloat(totalFunds) / 500) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>${totalFunds} raised</span>
            <span>Goal: $500</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto fund-animate">
          {[
            { icon: Heart, label: 'Pool Size', value: `$${totalFunds}`, color: 'text-rose-400' },
            { icon: Users, label: 'Smilers', value: '1,247', color: 'text-sky-400' },
            { icon: Gift, label: 'Per Smile', value: '$0.001', color: 'text-amber-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
              <stat.icon size={18} className={`${stat.color} mx-auto mb-1.5`} />
              <div className="font-bold text-lg">{stat.value}</div>
              <div className="text-[11px] text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Contribution Box */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-md mx-auto fund-animate">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">Your Balance</span>
            <span className="font-semibold flex items-center gap-1.5">
              {userBalance}
              <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" alt="USDC" className="w-4 h-4" />
            </span>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="pr-20 rounded-xl border-gray-200 h-12 text-lg focus:ring-amber-400 focus:border-amber-400"
                min="0" step="0.1"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button onClick={() => setAmount(userBalance)}
                  className="text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-lg transition-all">
                  MAX
                </button>
                <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" alt="USDC" className="w-4 h-4" />
              </div>
            </div>
            <button
              onClick={handleDonate}
              disabled={loading || !amount}
              className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold px-6 rounded-xl transition-all disabled:opacity-40 active:scale-95 shadow-lg shadow-amber-200/50"
            >
              {loading ? "..." : "Fund 💛"}
            </button>
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-4">
            100% goes directly to smile rewards
          </p>
        </div>
      </div>

      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <div className="text-center py-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 mx-auto mb-4 flex items-center justify-center animate-celebrate">
            <Sparkles size={36} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Thank You! 💛</h3>
          <p className="text-gray-500 mb-6">Your contribution will help spread more smiles worldwide</p>
          <button onClick={() => setShowSuccessModal(false)}
            className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-gray-800 transition-all">
            Continue
          </button>
        </div>
      </Modal>
    </>
  );
};

export default GoFundSmiles;
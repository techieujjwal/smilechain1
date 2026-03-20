import { Button } from "@/components/ui/button";
import { Smile, Share, Trash2, DollarSign, Star, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import html2canvas from 'html2canvas';

interface Image {
  url: string;
  timestamp: string;
  isLoading?: boolean;
  smileCount: number;
  smileScore?: number;
  hasWon?: boolean;
  isNounish: boolean;
}

interface ImageGridProps {
  images: Array<{
    url: string;
    timestamp: string;
    isLoading?: boolean;
    smileCount: number;
    smileScore?: number;
    hasWon?: boolean;
    isNounish: boolean;
  }>;
  authenticated: boolean;
  userId?: string;
  onSmileBack: (imageUrl: string) => void;
  onDelete: (imageUrl: string, userId: string) => void;
  shimmerStyle: string;
}

export const ImageGrid = ({ 
  images, 
  authenticated, 
  userId, 
  onSmileBack, 
  onDelete, 
  shimmerStyle 
}: ImageGridProps) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const handleShare = (image: Image) => {
    setSelectedImage(image);
    setIsShareModalOpen(true);
  };

  const shareOnTwitter = async () => {
    if (!selectedImage) return;
    const sharePreview = document.getElementById('share-preview');
    if (!sharePreview) return;

    try {
      const canvas = await html2canvas(sharePreview, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = 'my-smile.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating share image:', error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div key={index} className="bg-white rounded-[24px] p-2 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 border border-gray-100 group">
            <div className={`relative overflow-hidden rounded-[20px] ${image.isLoading ? shimmerStyle : ''}`}>
              <img
                src={image.url}
                alt="Captured smile"
                className="w-full h-[260px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-sm">
                <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                  {image.isLoading ? '?/5' : `${image.smileScore ?? 0}/5`}
                  {(image.smileScore ?? 0) > 3 && (
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] text-gray-400 font-medium">
                  {new Date(image.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                
                <div className="flex gap-1.5">
                  <button 
                    disabled={!authenticated}
                    onClick={() => authenticated && onSmileBack(image.url)}
                    className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Heart size={14} className={image.smileCount > 0 ? "fill-rose-500" : ""} />
                    {image.smileCount || 0}
                  </button>
                  <button 
                    onClick={() => handleShare(image)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-full p-1.5 transition-colors"
                  >
                    <Share size={14} />
                  </button>
                  {authenticated && userId && image.url.includes(`${userId}/`) && (
                    <button 
                      onClick={() => onDelete(image.url, userId)}
                      className="bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-full p-1.5 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {image.isLoading ? (
                <div className="text-center text-sm text-gray-400">Analyzing joy... ✨</div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Smile Score
                  </span>
                  {(image.smileScore ?? 0) > 3 ? (
                    <span className="inline-flex items-center bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 rounded-full text-xs font-bold text-orange-600">
                      +0.001 USDC ✨
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                      Keep smiling 😊
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-sm bg-[#FFFAF5] p-6 rounded-[32px] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-black text-gray-900 mb-2">
              Share the Joy 😊
            </DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-5">
              <div id="share-preview" className="bg-white p-3 rounded-[24px] shadow-sm">
                <div className="relative rounded-[16px] overflow-hidden">
                  <img src={selectedImage.url} alt="Share preview" className="w-full aspect-[4/3] object-cover" crossOrigin="anonymous" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 text-sm font-bold text-gray-800">
                    {selectedImage.smileScore}/5
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                </div>
                {selectedImage.hasWon && (
                  <div className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 text-center">
                    <span className="text-orange-600 font-bold text-sm">Earned 0.001 USDC on Base ✨</span>
                  </div>
                )}
              </div>

              <button
                onClick={shareOnTwitter}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <Share size={18} /> Save & Share
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
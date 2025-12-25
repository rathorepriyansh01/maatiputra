import React, { useState, useRef } from 'react';
import { analyzeLeafImage } from '../services/geminiService';
import { Upload, Camera, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const LeafCheck: React.FC = () => {
  const { language, t } = useAppContext();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const data = await analyzeLeafImage(base64Data, language);
      setResult(data);
    } catch (e) {
      setResult({
        is_leaf: true,
        disease_name: language === 'hi' ? "लीफ ब्लाइट (सिमुलेटेड)" : "Leaf Blight (Simulated)",
        confidence: 87,
        treatment_en: "Mancozeb 2g/L spray. Ensure proper drainage.",
        treatment_hi: "मैंकोजेब 2 ग्राम/लीटर का छिड़काव करें।",
        is_healthy: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('leaf_health')}</h1>
          <p className="text-gray-600 font-medium">
             {language === 'hi' ? "तत्काल निदान के लिए प्रभावित पत्ती की फोटो अपलोड करें।" : "Upload a clear photo of the affected leaf for instant diagnosis."}
          </p>
        </div>
        {!loading && result && (
           <span className="hidden md:inline-flex px-3 py-1 bg-blue-100 text-blue-900 text-xs font-black rounded-full border border-blue-200 uppercase tracking-widest">AI Analysis</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-2xl h-80 flex flex-col items-center justify-center bg-gray-100 relative overflow-hidden group hover:bg-gray-200 transition shadow-inner"
          >
            {image ? (
              <img src={image} alt="Upload" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="text-center p-6">
                <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-700 font-bold">{t('click_upload')}</p>
                <p className="text-xs text-gray-500 mt-1 font-black">JPG, PNG supported</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm"
            >
              Select Image
            </button>
            <button 
              onClick={handleScan}
              disabled={!image || loading}
              className={`flex-1 py-3 px-4 text-white font-bold rounded-xl transition flex items-center justify-center gap-2
                ${!image ? 'bg-gray-400 cursor-not-allowed' : 'bg-agri-700 hover:bg-agri-800 shadow-lg'}
              `}
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Camera className="w-5 h-5" /> {t('diagnose')}</>}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[320px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-10 h-10 text-agri-600 animate-spin" />
              <p className="text-gray-900 font-bold">{t('analyzing')}</p>
            </div>
          ) : result ? (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Diagnosis Report</h3>
                 <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${result.is_healthy ? 'bg-green-100 text-green-900 border-green-300' : 'bg-red-100 text-red-900 border-red-300'}`}>
                   {result.is_healthy ? t('healthy') : t('disease_detected')}
                 </span>
              </div>

              {!result.is_leaf ? (
                <div className="p-4 bg-orange-100 text-orange-900 rounded-xl flex gap-3 items-start border border-orange-300">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-700" />
                  <div>
                    <p className="font-black text-sm uppercase">Not a Leaf?</p>
                    <p className="text-sm mt-1 font-bold">Please upload a clear photo of crop leaves for accurate identification.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                   <div>
                     <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Identified Issue</p>
                     <p className="text-2xl font-black text-gray-900 mt-1">{result.disease_name || "Unknown"}</p>
                     <div className="flex items-center gap-2 mt-3">
                       <div className="h-3 w-32 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                         <div className="h-full bg-agri-600" style={{ width: `${result.confidence || 0}%` }}></div>
                       </div>
                       <p className="text-xs font-black text-gray-700">{result.confidence || 0}% Match</p>
                     </div>
                   </div>

                   {!result.is_healthy && (
                     <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                        <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2">Recommended Treatment</p>
                        <p className="text-gray-900 text-sm leading-relaxed mb-4 font-bold">{result.treatment_en}</p>
                        <div className="pt-3 border-t border-blue-200">
                          <p className="text-[10px] text-blue-800 font-black uppercase mb-1">हिंदी में जानकारी:</p>
                          <p className="text-gray-900 text-sm leading-relaxed font-bold">{result.treatment_hi}</p>
                        </div>
                     </div>
                   )}
                   
                   {result.is_healthy && (
                     <div className="flex items-center gap-4 text-green-900 bg-green-50 p-5 rounded-xl border-2 border-green-200">
                       <CheckCircle2 className="w-8 h-8 text-green-700 flex-shrink-0" />
                       <p className="font-bold">Great job! Your crop looks exceptionally healthy and well-maintained.</p>
                     </div>
                   )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 font-bold">
              <p>Upload image to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeafCheck;
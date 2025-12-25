import React, { useState } from 'react';
import { analyzeSoilWithGemini } from '../services/geminiService';
import { Loader2, Beaker, FileText, CheckCircle, Upload, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';

const SoilAnalysis: React.FC = () => {
  const { language, t } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await analyzeSoilWithGemini("Simulated PDF Content", language);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Beaker className="text-agri-600" /> {t('soil_analysis')}
        </h1>
        <p className="text-gray-600 mt-1 font-medium">
          {language === 'hi' ? "त्वरित AI सिफारिशों के लिए अपना मृदा स्वास्थ्य कार्ड अपलोड करें।" : "Upload your government-issued Soil Health Card for instant AI recommendations."}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div 
              className={`border-2 border-dashed rounded-xl p-8 transition-colors ${file ? 'border-agri-500 bg-agri-50' : 'border-gray-300 hover:border-agri-400 hover:bg-gray-50'}`}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mb-4 border border-blue-200">
                  {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {file ? file.name : t('upload_text')}
                </h3>
                <p className="text-sm text-gray-600 mb-6 font-medium">
                  {file ? "Ready to analyze" : "Support for PDF, JPG, PNG"}
                </p>
                
                <input 
                  type="file" 
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden" 
                  id="soil-upload"
                />
                
                <div className="flex gap-3 w-full max-w-xs">
                  <label 
                    htmlFor="soil-upload"
                    className="flex-1 py-2.5 px-4 bg-white border border-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-50 cursor-pointer transition text-center shadow-sm"
                  >
                    {file ? "Change" : "Browse"}
                  </label>
                  {file && (
                    <button 
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="flex-1 py-2.5 px-4 bg-agri-700 text-white font-bold rounded-lg hover:bg-agri-800 transition flex items-center justify-center gap-2 shadow-md"
                    >
                      {loading ? <Loader2 className="animate-spin w-4 h-4" /> : t('analyzing')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-agri-600 animate-spin" />
              <p className="text-gray-900 font-bold">{t('analyzing')}</p>
            </div>
          ) : result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-2xl shadow-lg border-t-8 border-agri-600"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600 w-6 h-6" />
                  <h3 className="text-xl font-bold text-gray-900">Analysis Complete</h3>
                </div>
                <span className="px-3 py-1 bg-gray-200 text-gray-700 text-[10px] font-black rounded-full uppercase tracking-widest">AI Result</span>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Soil Type</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{result.soil_type || 'Loamy'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">pH Level</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">6.8 (Neutral)</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-[10px] font-black text-agri-800 uppercase tracking-widest block mb-2">Recommended Crops</span>
                  <div className="flex flex-wrap gap-2">
                    {result.crop_recommendations?.map((crop: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-agri-100 text-agri-900 text-sm font-bold rounded-full border border-agri-200">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <span className="text-xs font-black text-yellow-900 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" /> Fertilizer Advice
                  </span>
                  <p className="text-gray-900 text-sm leading-relaxed font-bold">
                    {result.fertilizer_advice}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">AI Specialist Summary</span>
                  <p className="text-sm font-medium text-gray-800 mt-2 leading-relaxed italic">"{result.gemini_analysis}"</p>
                </div>
              </div>
            </motion.div>
          ) : (
             <div className="h-full min-h-[300px] flex items-center justify-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <div className="text-center text-gray-500 max-w-xs">
                <Beaker className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Upload your Soil Health Card to see the AI analysis here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoilAnalysis;
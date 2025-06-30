'use client';

import React, { useState, useEffect } from 'react';

// Interface untuk hasil prediksi yang lebih detail
interface PredictionResult {
  success: boolean;
  input?: {
    elastisitas: string;
    tekstur: string;
    ketebalan: number;
  };
  prediction?: {
    bahanKain: string;
    jenisPakaian: string;
    confidence?: {
      bahanKain: number;
      jenisPakaian: number;
    };
  };
  message?: string;
  error?: string;
  availableOptions?: {
    elastisitas: string[];
    tekstur: string[];
  };
}

// Interface untuk informasi model yang dimuat di awal
interface ModelInfo {
  success: boolean;
  availableOptions?: {
    elastisitas: string[];
    tekstur: string[];
    bahanKain: string[];
    jenisPakaian: string[];
  };
  datasetInfo?: {
    totalRecords: number;
  };
  modelInfo?: {
    algorithm: string;
    kernelType: string;
    features: string[];
    accuracy?: number; // Akurasi bersifat opsional
  };
  error?: string;
}

export default function KlasifikasiPage() {
  // State untuk form input
  const [elastisitas, setElastisitas] = useState('');
  const [tekstur, setTekstur] = useState('');
  const [ketebalan, setKetebalan] = useState('');
  
  // State untuk hasil, loading, dan info model
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // URL Backend Python Anda
  const BACKEND_URL = 'http://127.0.0.1:5001';

  // Load model info saat komponen pertama kali dimuat
  useEffect(() => {
    const loadModelInfo = async () => {
      setLoadingModel(true);
      try {
        // Langsung memanggil endpoint /info dari backend Python
        const response = await fetch(`${BACKEND_URL}/info`);
        const data: ModelInfo = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Gagal memuat informasi dari server backend.');
        }
        
        setModelInfo(data);
      } catch (error: any) {
        console.error('Error loading model info:', error);
        setModelInfo({ success: false, error: error.message });
      } finally {
        setLoadingModel(false);
      }
    };

    loadModelInfo();
  }, []);

  // Fungsi untuk menangani submit form prediksi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validasi input
    if (!elastisitas || !tekstur || !ketebalan) {
      setFormError('Semua field harus diisi!');
      return;
    }
    const ketebalanNum = parseFloat(ketebalan);
    if (isNaN(ketebalanNum) || ketebalanNum < 0.2 || ketebalanNum > 2.0) {
      setFormError('Ketebalan harus dalam rentang 0.2 - 2.0 mm');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Langsung memanggil endpoint /predict dari backend Python
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Mengirim body sesuai nama field yang diharapkan backend Python
        body: JSON.stringify({
          Elastisitas: elastisitas,
          Tekstur: tekstur,
          Ketebalan: ketebalanNum
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error submitting prediction:', error);
      setResult({
        success: false,
        message: 'Terjadi kesalahan saat mengirim request.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mereset form
  const resetForm = () => {
    setElastisitas('');
    setTekstur('');
    setKetebalan('');
    setResult(null);
    setFormError(null);
  };

  // Fungsi bantuan untuk tampilan confidence
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Tinggi';
    if (confidence >= 0.6) return 'Sedang';
    return 'Rendah';
  };

  // Tampilan saat model sedang dimuat
  if (loadingModel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Menghubungkan & memuat model SVM...</p>
        </div>
      </div>
    );
  }
  
  // Tampilan jika gagal memuat info model
  if (!modelInfo?.success) {
      return (
          <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                  <h1 className="text-2xl font-bold text-red-700 mb-4">Gagal Terhubung ke Backend</h1>
                  <p className="text-gray-600 mb-2">Tidak dapat memuat informasi model yang diperlukan.</p>
                  <p className="text-sm text-gray-500 bg-red-100 p-3 rounded-md">
                      <strong>Detail Error:</strong> {modelInfo?.error || "Tidak ada pesan error."}
                  </p>
                  <p className="mt-4 text-gray-600">Pastikan server backend Python (Flask) Anda sedang berjalan dan dapat diakses.</p>
              </div>
          </div>
      )
  }

  // Tampilan utama aplikasi
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Klasifikasi Bahan Pakaian
          </h1>
          <p className="text-lg text-gray-600">
            Prediksi jenis bahan kain dan jenis pakaian menggunakan algoritma Support Vector Machine (SVM)
          </p>
        </div>

        {/* Informasi Model */}
        {modelInfo && modelInfo.success && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Model & Dataset</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Data Training:</p>
                <p className="text-lg font-semibold text-indigo-600">
                  {modelInfo.datasetInfo?.totalRecords || 0} records
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Algoritma:</p>
                <p className="text-lg font-semibold text-purple-600">
                  {modelInfo.modelInfo?.algorithm || 'SVM'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kernel:</p>
                <p className="text-lg font-semibold text-blue-600">
                  {modelInfo.modelInfo?.kernelType || 'RBF'}
                </p>
              </div>
            </div>
            {modelInfo.modelInfo?.accuracy && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Akurasi Model:</p>
                <p className="text-lg font-semibold text-green-700">
                  {(modelInfo.modelInfo.accuracy * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Input */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Input Karakteristik Material</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dropdown Elastisitas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Elastisitas Material</label>
                <select value={elastisitas} onChange={(e) => setElastisitas(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                  <option value="">Pilih Tingkat Elastisitas</option>
                  {modelInfo?.availableOptions?.elastisitas?.map((option) => (<option key={option} value={option}>{option}</option>))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Pilih tingkat elastisitas bahan</p>
              </div>

              {/* Dropdown Tekstur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tekstur Permukaan</label>
                <select value={tekstur} onChange={(e) => setTekstur(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                  <option value="">Pilih Jenis Tekstur</option>
                  {modelInfo?.availableOptions?.tekstur?.map((option) => (<option key={option} value={option}>{option}</option>))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Pilih karakteristik tekstur permukaan</p>
              </div>

              {/* Input Ketebalan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ketebalan Material (mm)</label>
                <input type="number" step="0.01" min="0.2" max="2.0" value={ketebalan} onChange={(e) => setKetebalan(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Contoh: 1.2" required />
                <p className="text-xs text-gray-500 mt-1">Masukkan ketebalan (0.2 - 2.0 mm)</p>
              </div>
              
              {/* Pesan Error Form */}
              {formError && (<div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">{formError}</div>)}

              {/* Tombol Aksi */}
              <div className="flex space-x-4">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">
                  {loading ? (<span className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Memproses...</span>) : ('Klasifikasi dengan SVM')}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-colors">Reset</button>
              </div>
            </form>
          </div>

          {/* Hasil Prediksi */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Hasil Prediksi SVM</h2>
            {!result && (<div className="text-center py-12"><div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"><svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg></div><p className="text-gray-500">Masukkan karakteristik material untuk mendapatkan prediksi</p></div>)}
            {result && (<div className="space-y-4">{result.success ? (<>{/* Ringkasan Input */}<div className="bg-gray-50 rounded-lg p-4"><h3 className="font-semibold text-gray-800 mb-2">Data Input:</h3><div className="space-y-1 text-sm"><p><span className="font-medium">Elastisitas:</span> {result.input?.elastisitas}</p><p><span className="font-medium">Tekstur:</span> {result.input?.tekstur}</p><p><span className="font-medium">Ketebalan:</span> {result.input?.ketebalan} mm</p></div></div>{/* Prediksi */}<div className="space-y-3"><div className="bg-green-50 border border-green-200 rounded-lg p-4"><div className="flex justify-between items-start mb-2"><h3 className="font-semibold text-green-800">Prediksi Bahan Kain:</h3>{result.prediction?.confidence?.bahanKain && (<span className={`text-xs font-medium px-2 py-1 rounded ${result.prediction.confidence.bahanKain >= 0.8 ? 'bg-green-100 text-green-700' : result.prediction.confidence.bahanKain >= 0.6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>Confidence: {getConfidenceLabel(result.prediction.confidence.bahanKain)}</span>)}</div><p className="text-lg font-bold text-green-700">{result.prediction?.bahanKain}</p>{result.prediction?.confidence?.bahanKain && (<p className={`text-sm mt-1 ${getConfidenceColor(result.prediction.confidence.bahanKain)}`}>Tingkat keyakinan: {(result.prediction.confidence.bahanKain * 100).toFixed(1)}%</p>)}</div><div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><div className="flex justify-between items-start mb-2"><h3 className="font-semibold text-blue-800">Prediksi Jenis Pakaian:</h3>{result.prediction?.confidence?.jenisPakaian && (<span className={`text-xs font-medium px-2 py-1 rounded ${result.prediction.confidence.jenisPakaian >= 0.8 ? 'bg-green-100 text-green-700' : result.prediction.confidence.jenisPakaian >= 0.6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>Confidence: {getConfidenceLabel(result.prediction.confidence.jenisPakaian)}</span>)}</div><p className="text-lg font-bold text-blue-700">{result.prediction?.jenisPakaian}</p>{result.prediction?.confidence?.jenisPakaian && (<p className={`text-sm mt-1 ${getConfidenceColor(result.prediction.confidence.jenisPakaian)}`}>Tingkat keyakinan: {(result.prediction.confidence.jenisPakaian * 100).toFixed(1)}%</p>)}</div></div></>) : (<div className="bg-red-50 border border-red-200 rounded-lg p-4"><h3 className="font-semibold text-red-800 mb-2">Prediksi Gagal:</h3><p className="text-red-700">{result.message}</p>{result.availableOptions && (<div className="mt-3 text-sm"><p className="font-medium">Opsi yang tersedia:</p><ul className="list-disc list-inside mt-1 space-y-1">{result.availableOptions.elastisitas && (<li>Elastisitas: {result.availableOptions.elastisitas.join(', ')}</li>)}{result.availableOptions.tekstur && (<li>Tekstur: {result.availableOptions.tekstur.join(', ')}</li>)}</ul></div>)}</div>)}</div>)}
          </div>
        </div>

        {/* Informasi Opsi Tersedia */}
        {modelInfo?.availableOptions && (<div className="mt-8 bg-white rounded-lg shadow-md p-6"><h2 className="text-xl font-semibold text-gray-800 mb-4">Dataset & Opsi yang Tersedia</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><div><h3 className="font-medium text-gray-700 mb-2">Input - Elastisitas:</h3><ul className="text-sm text-gray-600 space-y-1">{modelInfo.availableOptions.elastisitas?.map((item) => (<li key={item} className="bg-gray-50 px-2 py-1 rounded">{item}</li>))}</ul></div><div><h3 className="font-medium text-gray-700 mb-2">Input - Tekstur:</h3><ul className="text-sm text-gray-600 space-y-1">{modelInfo.availableOptions.tekstur?.map((item) => (<li key={item} className="bg-gray-50 px-2 py-1 rounded">{item}</li>))}</ul></div><div><h3 className="font-medium text-gray-700 mb-2">Output - Bahan Kain:</h3><ul className="text-sm text-gray-600 space-y-1">{modelInfo.availableOptions.bahanKain?.map((item) => (<li key={item} className="bg-green-50 px-2 py-1 rounded border border-green-200">{item}</li>))}</ul></div><div><h3 className="font-medium text-gray-700 mb-2">Output - Jenis Pakaian:</h3><ul className="text-sm text-gray-600 space-y-1">{modelInfo.availableOptions.jenisPakaian?.map((item) => (<li key={item} className="bg-blue-50 px-2 py-1 rounded border border-blue-200">{item}</li>))}</ul></div></div></div>)}
        
        {/* Informasi Algoritma SVM */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6"><h2 className="text-xl font-semibold text-gray-800 mb-4">Tentang Support Vector Machine (SVM)</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><h3 className="font-medium text-gray-700 mb-2">Keunggulan SVM:</h3><ul className="text-sm text-gray-600 space-y-1"><li>• Efektif untuk data dengan dimensi tinggi</li><li>• Akurat untuk klasifikasi non-linear</li><li>• Tahan terhadap overfitting</li><li>• Menggunakan kernel RBF untuk pola kompleks</li></ul></div><div><h3 className="font-medium text-gray-700 mb-2">Aplikasi dalam Tekstil:</h3><ul className="text-sm text-gray-600 space-y-1"><li>• Identifikasi jenis bahan berdasarkan sifat fisik</li><li>• Klasifikasi kualitas material</li><li>• Prediksi aplikasi penggunaan</li><li>• Quality control dalam produksi</li></ul></div></div></div>
      </div>
    </div>
  );
}

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
import traceback

app = Flask(__name__)
# Mengizinkan request dari semua origin untuk kemudahan development
CORS(app, resources={r"/*": {"origins": "*"}}) 

# --- PATHS ---
MODEL_PAKAIAN_PATH = os.path.join('models', 'pipeline_pakaian.pkl')
MODEL_BAHAN_PATH = os.path.join('models', 'pipeline_bahan.pkl')
# Pastikan nama file CSV ini sesuai dengan yang Anda gunakan untuk training
DATA_PATH = os.path.join('data', 'dataset_bahan_pakaian_100_data.csv')

# --- Globals untuk menyimpan model dan info data ---
model_pakaian = None
model_bahan = None
data_info = {}
is_ready = False # Flag untuk menandakan server siap

def load_resources():
    """Memuat model dan informasi dari dataset. Mengembalikan True jika berhasil."""
    global model_pakaian, model_bahan, data_info, is_ready
    
    print("Mencoba memuat resources...")
    try:
        if not os.path.exists(MODEL_PAKAIAN_PATH) or not os.path.exists(MODEL_BAHAN_PATH):
            raise FileNotFoundError("Satu atau lebih file model .pkl tidak ditemukan di folder 'models'.")
        if not os.path.exists(DATA_PATH):
            raise FileNotFoundError(f"File dataset '{os.path.basename(DATA_PATH)}' tidak ditemukan di folder 'data'.")

        # Memuat model
        model_pakaian = joblib.load(MODEL_PAKAIAN_PATH)
        model_bahan = joblib.load(MODEL_BAHAN_PATH)
        print("=> Model berhasil dimuat.")

        # Memuat informasi dari dataset
        df = pd.read_csv(DATA_PATH)
        df.columns = [col.strip() for col in df.columns]
        
        data_info['availableOptions'] = {
            'elastisitas': sorted(df['Elastisitas'].unique().tolist()),
            'tekstur': sorted(df['Tekstur'].unique().tolist()),
            'bahanKain': sorted(df['Bahan_Kain'].unique().tolist()),
            'jenisPakaian': sorted(df['Jenis_Pakaian'].unique().tolist())
        }
        data_info['datasetInfo'] = {
            'totalRecords': len(df)
        }
        data_info['modelInfo'] = {
            'algorithm': 'SVM (Support Vector Machine)',
            'kernelType': 'RBF (Radial Basis Function)',
            'features': ['Ketebalan', 'Tekstur', 'Elastisitas']
        }
        print("=> Informasi dataset berhasil dimuat.")
        is_ready = True
        return True

    except Exception as e:
        print(f"FATAL: Gagal memuat resources. Server tidak siap.")
        print(traceback.format_exc())
        is_ready = False
        return False

# --- Endpoints API ---

@app.route('/info', methods=['GET'])
def get_info():
    """Endpoint untuk memberikan informasi awal ke frontend."""
    if not is_ready:
        return jsonify({'success': False, 'error': 'Server belum siap atau gagal memuat data model.'}), 503
    
    return jsonify({
        'success': True,
        **data_info
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Endpoint untuk melakukan prediksi."""
    if not is_ready:
        return jsonify({'success': False, 'message': 'Model sedang tidak tersedia, server belum siap.', 'error': 'SERVER_NOT_READY'}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Request body tidak valid (bukan JSON).'}), 400

        # Validasi input sesuai nama kolom di CSV baru
        required_keys = ['Ketebalan', 'Tekstur', 'Elastisitas']
        if not all(key in data for key in required_keys):
            return jsonify({'success': False, 'message': 'Input tidak lengkap. Butuh Ketebalan, Tekstur, dan Elastisitas.'}), 400
        
        # DataFrame harus cocok dengan nama kolom saat training
        input_df = pd.DataFrame({
            'Ketebalan': [float(data['Ketebalan'])],
            'Tekstur': [data['Tekstur']],
            'Elastisitas': [data['Elastisitas']]
        })

        # Prediksi
        pred_pakaian = model_pakaian.predict(input_df)[0]
        pred_bahan = model_bahan.predict(input_df)[0]

        # Kalkulasi Confidence Score
        proba_pakaian = model_pakaian.predict_proba(input_df)[0]
        proba_bahan = model_bahan.predict_proba(input_df)[0]
        
        confidence_pakaian = proba_pakaian.max()
        confidence_bahan = proba_bahan.max()
        
        # Siapkan response JSON sesuai format yang diinginkan frontend
        response = {
            'success': True,
            'input': {
                'elastisitas': data['Elastisitas'],
                'tekstur': data['Tekstur'],
                'ketebalan': float(data['Ketebalan'])
            },
            'prediction': {
                'bahanKain': pred_bahan,
                'jenisPakaian': pred_pakaian,
                'confidence': {
                    'bahanKain': float(confidence_bahan),
                    'jenisPakaian': float(confidence_pakaian)
                }
            }
        }
        return jsonify(response)

    except Exception as e:
        print(f"Error saat prediksi: {e}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': 'Terjadi kesalahan internal di server saat melakukan prediksi.', 'error': str(e)}), 500

if __name__ == '__main__':
    # Muat model dan data saat startup
    load_resources()
    # Jalankan server
    app.run(host='0.0.0.0', port=5001, debug=True)

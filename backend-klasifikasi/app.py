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
        
        # Handle column name inconsistency
        if 'Ketebalan' not in df.columns and 'Ketebalan(mm)' in df.columns:
            df.rename(columns={'Ketebalan(mm)': 'Ketebalan'}, inplace=True)
        
        data_info['availableOptions'] = {
            'elastisitas': sorted(df['Elastisitas'].unique().tolist()),
            'tekstur': sorted(df['Tekstur'].unique().tolist()),
            'bahanKain': sorted(df['Bahan_Kain'].unique().tolist()),
            'jenisPakaian': sorted(df['Jenis_Pakaian'].unique().tolist())
        }
        data_info['datasetInfo'] = {
            'totalRecords': len(df),
            'features': ['Ketebalan', 'Tekstur', 'Elastisitas'],
            'targets': ['Jenis_Pakaian', 'Bahan_Kain']
        }
        data_info['modelInfo'] = {
            'algorithm': 'SVM (Support Vector Machine)',
            'kernelType': 'RBF (Radial Basis Function)',
            'optimization': 'GridSearchCV',
            'features': ['Ketebalan', 'Tekstur', 'Elastisitas']
        }
        print("=> Informasi dataset berhasil dimuat.")
        print(f"=> Total data: {len(df)}")
        print(f"=> Fitur: {data_info['datasetInfo']['features']}")
        print(f"=> Jenis Pakaian: {len(data_info['availableOptions']['jenisPakaian'])} kategori")
        print(f"=> Bahan Kain: {len(data_info['availableOptions']['bahanKain'])} kategori")
        
        is_ready = True
        return True

    except Exception as e:
        print(f"FATAL: Gagal memuat resources. Server tidak siap.")
        print(f"Error: {str(e)}")
        print(traceback.format_exc())
        is_ready = False
        return False

# --- Endpoints API ---

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint untuk mengecek status server."""
    if is_ready:
        return jsonify({
            'status': 'healthy',
            'ready': True,
            'message': 'Server siap untuk melakukan prediksi'
        }), 200
    else:
        return jsonify({
            'status': 'unhealthy', 
            'ready': False,
            'message': 'Server belum siap atau gagal memuat model'
        }), 503

@app.route('/info', methods=['GET'])
def get_info():
    """Endpoint untuk memberikan informasi awal ke frontend."""
    if not is_ready:
        return jsonify({
            'success': False, 
            'error': 'Server belum siap atau gagal memuat data model.'
        }), 503
    
    return jsonify({
        'success': True,
        **data_info
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Endpoint untuk melakukan prediksi."""
    if not is_ready:
        return jsonify({
            'success': False, 
            'message': 'Model sedang tidak tersedia, server belum siap.', 
            'error': 'SERVER_NOT_READY'
        }), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False, 
                'message': 'Request body tidak valid (bukan JSON).'
            }), 400

        # Validasi input sesuai nama kolom di CSV
        required_keys = ['Ketebalan', 'Tekstur', 'Elastisitas']
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            return jsonify({
                'success': False, 
                'message': f'Input tidak lengkap. Butuh: {", ".join(required_keys)}. Missing: {", ".join(missing_keys)}'
            }), 400
        
        # Validasi tipe data
        try:
            ketebalan = float(data['Ketebalan'])
            if ketebalan < 0:
                return jsonify({
                    'success': False,
                    'message': 'Ketebalan tidak boleh negatif.'
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'message': 'Ketebalan harus berupa angka.'
            }), 400
        
        # Validasi kategori
        valid_tekstur = data_info['availableOptions']['tekstur']
        valid_elastisitas = data_info['availableOptions']['elastisitas']
        
        if data['Tekstur'] not in valid_tekstur:
            return jsonify({
                'success': False,
                'message': f'Tekstur tidak valid. Pilihan: {", ".join(valid_tekstur)}'
            }), 400
            
        if data['Elastisitas'] not in valid_elastisitas:
            return jsonify({
                'success': False,
                'message': f'Elastisitas tidak valid. Pilihan: {", ".join(valid_elastisitas)}'
            }), 400

        # DataFrame harus cocok dengan nama kolom saat training
        input_df = pd.DataFrame({
            'Ketebalan': [ketebalan],
            'Tekstur': [data['Tekstur']],
            'Elastisitas': [data['Elastisitas']]
        })

        # Prediksi
        pred_pakaian = model_pakaian.predict(input_df)[0]
        pred_bahan = model_bahan.predict(input_df)[0]

        # Kalkulasi Confidence Score
        proba_pakaian = model_pakaian.predict_proba(input_df)[0]
        proba_bahan = model_bahan.predict_proba(input_df)[0]
        
        confidence_pakaian = float(proba_pakaian.max())
        confidence_bahan = float(proba_bahan.max())
        
        # Siapkan response JSON sesuai format yang diinginkan frontend
        response = {
            'success': True,
            'input': {
                'elastisitas': data['Elastisitas'],
                'tekstur': data['Tekstur'],
                'ketebalan': ketebalan
            },
            'prediction': {
                'bahanKain': pred_bahan,
                'jenisPakaian': pred_pakaian,
                'confidence': {
                    'bahanKain': confidence_bahan,
                    'jenisPakaian': confidence_pakaian
                }
            },
            'metadata': {
                'timestamp': pd.Timestamp.now().isoformat(),
                'model_version': 'v1.0'
            }
        }
        
        print(f"Prediksi berhasil: {pred_pakaian} | {pred_bahan} | Confidence: {confidence_pakaian:.3f}, {confidence_bahan:.3f}")
        return jsonify(response)

    except Exception as e:
        print(f"Error saat prediksi: {e}")
        print(traceback.format_exc())
        return jsonify({
            'success': False, 
            'message': 'Terjadi kesalahan internal di server saat melakukan prediksi.', 
            'error': str(e)
        }), 500

@app.route('/test', methods=['POST'])
def test_prediction():
    """Endpoint untuk testing dengan data sample."""
    if not is_ready:
        return jsonify({
            'success': False, 
            'message': 'Server belum siap'
        }), 503
    
    # Sample data untuk testing
    sample_data = {
        'Ketebalan': 1.5,
        'Tekstur': 'Lembut',
        'Elastisitas': 'Tinggi'
    }
    
    try:
        # Simulate prediction request
        input_df = pd.DataFrame({
            'Ketebalan': [sample_data['Ketebalan']],
            'Tekstur': [sample_data['Tekstur']],
            'Elastisitas': [sample_data['Elastisitas']]
        })
        
        pred_pakaian = model_pakaian.predict(input_df)[0]
        pred_bahan = model_bahan.predict(input_df)[0]
        
        return jsonify({
            'success': True,
            'message': 'Test prediction berhasil',
            'sample_input': sample_data,
            'sample_output': {
                'jenisPakaian': pred_pakaian,
                'bahanKain': pred_bahan
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Test prediction gagal: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("=== STARTING FLASK SERVER ===")
    print("Memuat model dan dataset...")
    
    # Muat model dan data saat startup
    if load_resources():
        print("✓ Server siap untuk menerima request")
        print("✓ Endpoint tersedia:")
        print("  - GET  /health  : Status server")
        print("  - GET  /info    : Informasi dataset dan model")
        print("  - POST /predict : Prediksi klasifikasi")
        print("  - POST /test    : Test prediksi dengan sample data")
        print("\n=== SERVER RUNNING ===")
    else:
        print("✗ Server gagal dimuat. Pastikan file model dan dataset tersedia.")
        print("✗ Jalankan train.py terlebih dahulu untuk membuat model.")
    
    # Jalankan server
    app.run(host='0.0.0.0', port=5001, debug=True)
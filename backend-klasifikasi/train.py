import pandas as pd
from sklearn.svm import SVC
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV
import joblib
import os
import numpy as np

def train_and_save_models():
    """
    Fungsi ini melatih model SVM yang telah dioptimalkan menggunakan GridSearchCV
    untuk menemukan parameter terbaik (C dan gamma).
    """
    print("Memulai proses training model dengan optimasi GridSearchCV...")
    print("Proses ini akan memakan waktu lebih lama, mohon ditunggu.")

    # Pastikan nama file ini sesuai dengan yang Anda gunakan
    DATA_PATH = os.path.join('data', 'dataset_bahan_pakaian_100_data.csv') 
    
    os.makedirs('models', exist_ok=True)
    os.makedirs('data', exist_ok=True)
    
    if not os.path.exists(DATA_PATH):
        print(f"Error: File dataset tidak ditemukan di '{DATA_PATH}'")
        return

    # 1. Memuat & Membersihkan Dataset
    df = pd.read_csv(DATA_PATH)
    # Membersihkan spasi ekstra dari nama kolom
    df.columns = [col.strip() for col in df.columns]

    # --- PERBAIKAN: Cek dan ganti nama kolom ---
    # Cek jika kolom 'Ketebalan' tidak ada, tapi 'Ketebalan(mm)' ada
    if 'Ketebalan' not in df.columns and 'Ketebalan(mm)' in df.columns:
        print("Mendeteksi nama kolom lama 'Ketebalan(mm)'. Mengganti nama menjadi 'Ketebalan'.")
        df.rename(columns={'Ketebalan(mm)': 'Ketebalan'}, inplace=True)
    
    # Cetak nama kolom untuk debugging, agar kita tahu apa yang dilihat oleh Python
    print("\nNama kolom yang terdeteksi di file CSV:", df.columns.tolist(), "\n")

    # 2. Menentukan Fitur (X) dan Target (y)
    try:
        features = ['Ketebalan', 'Tekstur', 'Elastisitas']
        X = df[features]
        y_pakaian = df['Jenis_Pakaian']
        y_bahan = df['Bahan_Kain']
    except KeyError as e:
        print(f"Error: Salah satu kolom fitur atau target tidak ditemukan. Pastikan nama kolom di CSV sudah benar.")
        print(f"Detail error: {e}")
        return

    # 3. Pra-pemrosesan Data
    categorical_features = ['Tekstur', 'Elastisitas']
    numerical_features = ['Ketebalan']
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])

    # 4. Menyiapkan Optimasi GridSearchCV
    param_grid = {
        'classifier__C': [0.1, 1, 10, 100],
        'classifier__gamma': [1, 0.1, 0.01, 0.001],
    }

    pipeline_base = Pipeline(steps=[('preprocessor', preprocessor),
                                    ('classifier', SVC(kernel='rbf', probability=True))])

    # 5. Melatih Model dengan GridSearchCV
    
    # Untuk Jenis Pakaian
    print("\nMencari parameter terbaik untuk model 'Jenis Pakaian'...")
    grid_pakaian = GridSearchCV(pipeline_base, param_grid, refit=True, cv=5, verbose=2)
    grid_pakaian.fit(X, y_pakaian)
    print("\nParameter terbaik ditemukan untuk 'Jenis Pakaian': ", grid_pakaian.best_params_)
    print("Skor akurasi terbaik: ", grid_pakaian.best_score_)

    # Untuk Bahan Kain
    print("\n\n- - - - - - - - - - - - - - - - - - - -\n\n")
    print("Mencari parameter terbaik untuk model 'Bahan Kain'...")
    grid_bahan = GridSearchCV(pipeline_base, param_grid, refit=True, cv=5, verbose=2)
    grid_bahan.fit(X, y_bahan)
    print("\nParameter terbaik ditemukan untuk 'Bahan Kain': ", grid_bahan.best_params_)
    print("Skor akurasi terbaik: ", grid_bahan.best_score_)

    # 6. Menyimpan Model Terbaik
    model_pakaian_path = os.path.join('models', 'pipeline_pakaian.pkl')
    model_bahan_path = os.path.join('models', 'pipeline_bahan.pkl')
    
    joblib.dump(grid_pakaian, model_pakaian_path)
    joblib.dump(grid_bahan, model_bahan_path)

    print(f"\nModel yang telah dioptimalkan berhasil disimpan.")
    print("Proses training selesai.")

if __name__ == '__main__':
    train_and_save_models()

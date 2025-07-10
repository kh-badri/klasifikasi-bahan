import pandas as pd
from sklearn.svm import SVC
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV, StratifiedKFold
import joblib
import os
import numpy as np

def train_and_save_models():
    """
    Fungsi ini melatih model SVM yang telah dioptimalkan dengan beberapa perbaikan:
    1. Menggunakan class_weight='balanced' untuk mengatasi data yang sedikit tidak seimbang.
    2. Memperluas grid hyperparameter untuk pencarian yang lebih baik.
    3. Menggunakan StratifiedKFold untuk cross-validation yang lebih stabil pada data kecil.
    """
    print("Memulai proses training model dengan optimasi lanjutan...")
    print("Proses ini mungkin akan memakan waktu sedikit lebih lama, mohon ditunggu.")

    DATA_PATH = os.path.join('data', 'dataset_bahan_pakaian_100_data.csv')
    
    os.makedirs('models', exist_ok=True)
    os.makedirs('data', exist_ok=True)
    
    if not os.path.exists(DATA_PATH):
        print(f"Error: File dataset tidak ditemukan di '{DATA_PATH}'")
        return

    # 1. Memuat & Membersihkan Dataset
    df = pd.read_csv(DATA_PATH)
    df.columns = [col.strip() for col in df.columns]

    if 'Ketebalan' not in df.columns and 'Ketebalan(mm)' in df.columns:
        df.rename(columns={'Ketebalan(mm)': 'Ketebalan'}, inplace=True)
    
    print("\nNama kolom yang terdeteksi di file CSV:", df.columns.tolist(), "\n")
    print("Distribusi data untuk 'Bahan_Kain':")
    print(df['Bahan_Kain'].value_counts())
    print("-" * 20)

    # 2. Menentukan Fitur (X) dan Target (y)
    try:
        features = ['Ketebalan', 'Tekstur', 'Elastisitas']
        X = df[features]
        y_pakaian = df['Jenis_Pakaian']
        y_bahan = df['Bahan_Kain']
    except KeyError as e:
        print(f"Error: Kolom fitur/target tidak ditemukan: {e}")
        return

    # 3. Pra-pemrosesan Data (Sudah Benar dengan StandardScaler)
    categorical_features = ['Tekstur', 'Elastisitas']
    numerical_features = ['Ketebalan']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ])

    # 4. Menyiapkan Optimasi GridSearchCV
    
    # --- PERBAIKAN 1: Perluas Hyperparameter Grid ---
    param_grid = {
        'classifier__C': [0.1, 1, 10, 100, 1000],
        'classifier__gamma': [1, 0.1, 0.01, 0.001, 0.0001],
    }

    # --- PERBAIKAN 2: Tambahkan class_weight='balanced' pada SVM ---
    pipeline_base = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', SVC(kernel='rbf', probability=True, class_weight='balanced'))
    ])

    # --- PERBAIKAN 3: Gunakan StratifiedKFold untuk hasil CV yang lebih reliable ---
    cv_stratified = StratifiedKFold(n_splits=5)

    # 5. Melatih Model dengan GridSearchCV
    
    # Untuk Jenis Pakaian
    print("\nMencari parameter terbaik untuk model 'Jenis Pakaian'...")
    grid_pakaian = GridSearchCV(pipeline_base, param_grid, refit=True, cv=cv_stratified, verbose=1, n_jobs=-1)
    grid_pakaian.fit(X, y_pakaian)
    print("\nParameter terbaik ditemukan untuk 'Jenis Pakaian': ", grid_pakaian.best_params_)
    print(f"Skor akurasi terbaik: {grid_pakaian.best_score_:.2%}")

    # Untuk Bahan Kain
    print("\n\n- - - - - - - - - - - - - - - - - - - -\n\n")
    print("Mencari parameter terbaik untuk model 'Bahan Kain'...")
    grid_bahan = GridSearchCV(pipeline_base, param_grid, refit=True, cv=cv_stratified, verbose=1, n_jobs=-1)
    grid_bahan.fit(X, y_bahan)
    print("\nParameter terbaik ditemukan untuk 'Bahan Kain': ", grid_bahan.best_params_)
    print(f"Skor akurasi terbaik: {grid_bahan.best_score_:.2%}")

    # 6. Menyimpan Model Terbaik
    model_pakaian_path = os.path.join('models', 'pipeline_pakaian.pkl')
    model_bahan_path = os.path.join('models', 'pipeline_bahan.pkl')
    
    joblib.dump(grid_pakaian.best_estimator_, model_pakaian_path)
    joblib.dump(grid_bahan.best_estimator_, model_bahan_path)

    print(f"\nModel yang telah dioptimalkan berhasil disimpan.")
    print("Proses training selesai.")

if __name__ == '__main__':
    train_and_save_models()
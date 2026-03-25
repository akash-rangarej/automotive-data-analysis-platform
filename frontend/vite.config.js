import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/upload_file': 'http://127.0.0.1:5000',
      '/get_nulls': 'http://127.0.0.1:5000',
      '/get_outliers': 'http://127.0.0.1:5000',
      '/get_value_counts': 'http://127.0.0.1:5000',
      '/get_columns': 'http://127.0.0.1:5000',
      '/generate_plot': 'http://127.0.0.1:5000',
      '/get_processed_data': 'http://127.0.0.1:5000',
    }
  }
})

// file: components/Footer.tsx
import { FaHeart } from 'react-icons/fa';
export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-100 text-gray-600 py-4 mt-auto">
      <div className="max-w-7xl mx-auto text-center px-4">
        <p className="flex items-center justify-center">© {currentYear} FabricAI. Dibuat dengan <FaHeart className="mx-2 text-red-500" /> di Indonesia.</p>
      </div>
    </footer>
  );
};
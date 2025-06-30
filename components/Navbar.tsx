// file: components/Navbar.tsx
import Link from 'next/link';
export default function Navbar() {
  return (
    <nav className="bg-background bg-opacity-80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-accent">FabricAI</Link>
        <div>
          <Link href="/" className="text-primary font-semibold mr-6 px-4 py-1 rounded-full hover:bg-gray-100 transition">Home</Link>
          <Link href="/Klasifikasi" className="bg-accent text-white font-semibold px-4 py-1 rounded-full hover:bg-blue-700 transition">Klasifikasikan</Link>
        </div>
      </div>
    </nav>
  );
}
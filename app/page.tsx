// file: app/page.tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Typewriter } from "react-simple-typewriter";

export default function Home() {
  return (
    <>
      {/* Bagian Hero */}     {" "}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-16">
        {/* Kolom Teks */}       {" "}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-xl text-center ml-0 md:text-left"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-blue-600">
            {" "}
            <Typewriter
              words={["Klasifikasi Bahan Pakaian"]}
              loop={0}
              cursor
              cursorStyle=""
              typeSpeed={120}
              deleteSpeed={100}
              delaySpeed={1800}
            />
          </h1>
          <p className="text-lg md:text-xl text-secondary">Aplikasi ini membantu Anda mengenali jenis bahan pakaian seperti katun, linen, poliester, dan lainnya secara otomatis dan cepat.</p>
        </motion.div>
        {/* Kolom Gambar dengan Animasi Melayang */}
        <motion.div
          className="md:w-1/2 mb-8 md:mb-0 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: ["0%", "-4%", "0%"], // Menambahkan gerakan naik-turun
          }}
          transition={{
            duration: 0.8, // Durasi untuk animasi awal (opacity & scale)
            delay: 0.2,
            y: {
              // Properti transisi spesifik untuk sumbu Y
              duration: 3,
              repeat: Infinity, // Mengulang animasi tanpa henti
              repeatType: "loop",
              ease: "easeInOut",
            },
          }}
        >
                   {" "}
          <Image
            src="/fabric.png"
            alt="Contoh Bahan Pakaian"
            width={400}
            height={400}
            className="rounded-lg"
            priority
          />
                 {" "}
        </motion.div>
             {" "}
      </section>
      {/* --- Bagian Baru: Elastisitas Bahan Pakaian --- */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-accent text-center">
            Elastisitas Bahan Pakaian
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Elastisitas Rendah */}
            <div className="bg-white shadow-lg rounded-lg p-6 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <Image
                src="/kaintenun.png"
                alt="Elastisitas Rendah"
                width={300}
                height={350}
                className="mx-auto mb-4 object-cover rounded-md"
              />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Rendah
              </h3>
              <p className="text-md text-gray-700">
                Sulit melar, kembali ke bentuk asli perlahan. Contoh: Linen,
                Katun (tenun), Denim. Cocok untuk struktur kuat.
              </p>
            </div>

            {/* Elastisitas Sedang */}
            <div className="bg-white shadow-lg rounded-lg p-6 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <Image
                src="/kainwol.png"
                alt="Elastisitas Rendah"
                width={300}
                height={350}
                className="mx-auto mb-4 object-cover rounded-md"
              />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Sedang
              </h3>
              <p className="text-md text-gray-700">
                Melar sedikit, nyaman digerakkan. Contoh: Katun (rajut), Wol,
                Rayon. Fleksibel untuk pakaian sehari-hari.
              </p>
            </div>

            {/* Elastisitas Tinggi */}
            <div className="bg-white shadow-lg rounded-lg p-6 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <Image
                src="/kainjaring.png"
                alt="Elastisitas Rendah"
                width={300}
                height={350}
                className="mx-auto mb-4 object-cover rounded-md"
              />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Tinggi
              </h3>
              <p className="text-md text-gray-700">
                Sangat melar, mengikuti bentuk tubuh. Contoh: Spandex/Lycra,
                Karet, Kain jaring. Ideal untuk olahraga dan pakaian ketat.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
      {/* --- Bagian Baru: Tekstur Bahan Pakaian --- */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }} // Delay sedikit lebih lama agar animasi berurutan
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-accent text-center">
            Tekstur Bahan Pakaian
          </h2>
          {/* Menggunakan grid 2 kolom di md ke atas, dan 1 kolom di mobile */}
          {/* Untuk 5 kolom, kita akan gunakan grid-cols-2 md:grid-cols-5 jika memungkinkan, atau grid-cols-2 md:grid-cols-3 lg:grid-cols-5 untuk responsivitas yang baik */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Tekstur Halus */}
            <div className="bg-white shadow-lg rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <Image
                src="/kainsutra.png"
                alt="Tekstur Halus"
                width={150}
                height={130}
                className="mx-auto mb-3 object-cover rounded-md"
              />
              <h3 className="text-lg font-semibold mb-1 text-gray-800">
                Halus
              </h3>
              <p className="text-sm text-gray-700">
                Permukaan licin dan rata. Contoh: Sutra, Katun Sateen. Nyaman di
                kulit.
              </p>
            </div>

            {/* Tekstur Licin */}
            <div className="bg-white shadow-lg rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <Image
                src="/kainnilon.png"
                alt="Tekstur Halus"
                width={150}
                height={130}
                className="mx-auto mb-3 object-cover rounded-md"
              />
              <h3 className="text-lg font-semibold mb-1 text-gray-800">
                Licin
              </h3>
              <p className="text-sm text-gray-700">
                Cenderung tidak menempel, mudah jatuh. Contoh: Poliester, Nilon.
                Tahan air.
              </p>
            </div>

            {/* Tekstur Lembut */}
            <div className="bg-white shadow-lg rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <Image
                src="/kainwol2.png"
                alt="Tekstur Halus"
                width={150}
                height={130}
                className="mx-auto mb-3 object-cover rounded-md"
              />
              <h3 className="text-lg font-semibold mb-1 text-gray-800">
                Lembut
              </h3>
              <p className="text-sm text-gray-700">
                Nyaman disentuh, sering berbulu halus. Contoh: Wol, Fleece,
                Beludru. Hangat dan empuk.
              </p>
            </div>

            {/* Tekstur Berpori */}
            <div className="bg-white shadow-lg rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <Image
                src="/kainkatun.png"
                alt="Tekstur Halus"
                width={150}
                height={130}
                className="mx-auto mb-3 object-cover rounded-md"
              />
              <h3 className="text-lg font-semibold mb-1 text-gray-800">
                Berpori
              </h3>
              <p className="text-sm text-gray-700">
                Ada rongga kecil, sirkulasi udara baik. Contoh: Katun, Linen,
                Jaring. Menyerap keringat.
              </p>
            </div>

            {/* Tekstur Kasar */}
            <div className="bg-white shadow-lg rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <Image
                src="/kaindenim.png"
                alt="Tekstur Halus"
                width={150}
                height={130}
                className="mx-auto mb-3 object-cover rounded-md"
              />
              <h3 className="text-lg font-semibold mb-1 text-gray-800">
                Kasar
              </h3>
              <p className="text-sm text-gray-700">
                Permukaan tidak rata, terasa bertekstur. Contoh: Denim, Goni,
                Corduroy. Kuat dan tahan lama.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}

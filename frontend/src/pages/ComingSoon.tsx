import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// 🔐 CONFIG SUPABASE
const supabase = createClient(
  "https://ucliznuennmgiyjsxgrk.supabase.co",
  "sb_publishable_Ktuw5fw2JkAr_DnJVWzo1w_aR920Fk8" 
);

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      setMessage("Email invalide.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("customers")
      .insert([{ email }]);

    if (error) {
      if (error.code === "23505") {
        setMessage("Vous êtes déjà inscrit.");
      } else {
        setMessage("Erreur, réessayez.");
      }
    } else {
      setMessage("Bienvenue dans la liste VIP ✨");
      setEmail("");
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center px-6 pt-10 pb-20 overflow-hidden">

      {/* Background effet luxe */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#ffffff10,transparent_40%),radial-gradient(circle_at_80%_80%,#ffffff10,transparent_40%)]"></div>

      {/* Logo */}
      <img
        src="https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/RB_logo2.JPG"
        alt="Rifma Beauty"
        className="w-28 md:w-36 mb-8 object-contain"
      />

      {/* CONTENU */}
      <div className="flex flex-col items-center -mt-10">

        <h1 className="text-xl tracking-[0.5em] text-[#e8a0b7] mb-4">
          RIFMA BEAUTY
        </h1>

        <p className="text-xs tracking-[0.4em] text-gray-400 mb-3">
          SITE EN MAINTENANCE
        </p>

        <div className="w-10 h-[1px] bg-[#e8a0b7] mb-6"></div>

        <h2 className="text-2xl md:text-4xl font-light mb-4 text-center">
          NOUS REVENONS BIENTÔT
        </h2>

        <p className="max-w-lg text-center text-gray-400 leading-relaxed mb-8">
          Nous travaillons actuellement sur une nouvelle expérience.
          <br />
          Le site est temporairement en maintenance le temps de préparer notre
          nouvelle collection et d’intégrer les visuels de notre prochain shooting.
        </p>

        <div className="border border-[#e8a0b7] rounded-full p-5 mb-6">
          <span className="text-[#e8a0b7] text-xl">✦</span>
        </div>

        <p className="text-xs tracking-[0.3em] text-gray-500 mb-6">
          BEAUTY IS COMING
        </p>

        {/* VIP */}
        <div className="border border-[#e8a0b7]/30 rounded-xl p-6 w-full max-w-md backdrop-blur-sm mt-[-10px]">

          <p className="text-sm tracking-[0.3em] text-center mb-3">
            REJOIGNEZ NOTRE LISTE VIP
          </p>

          <p className="text-xs text-gray-400 text-center mb-6">
            Soyez la première informée de notre lancement et de nos exclusivités.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-transparent border border-gray-600 outline-none text-sm"
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-[#e8a0b7] text-black text-sm hover:opacity-80 transition disabled:opacity-50"
            >
              {loading ? "..." : "ACCÈS VIP"}
            </button>
          </div>

          {message && (
            <p className="text-xs text-center mt-4 text-[#e8a0b7]">
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-10 text-xs text-gray-600 text-center">
        © {new Date().getFullYear()} RIFMA BEAUTY. TOUS DROITS RÉSERVÉS.
      </p>
    </div>
  );
}
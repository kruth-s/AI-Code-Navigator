"use client";

import Image from "next/image";
import { ArrowRight, Github, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();



  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="relative h-screen w-full bg-[#1c1a23] overflow-hidden font-sans text-white scrollbar-hide">
      <LoginContent 
        key="login" 
        showPassword={showPassword} 
        setShowPassword={setShowPassword} 
        handleLogin={handleLogin}
      />
    </div>
  );
}

// function IntroAnimation() {
//   return (
//     <motion.div
//       className="fixed inset-0 flex items-center justify-center bg-black z-50 overflow-hidden"
//       exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", transition: { duration: 0.5, ease: "anticipate" } }}
//     >
//       <div className="relative w-[150vw] h-[150vh] origin-center rotate-[-60deg] flex flex-col justify-center">
//         {/* Generates multiple rows of marquee text */}
//         {Array.from({ length: 9 }).map((_, i) => (
//           <MarqueeRow key={i} direction={i % 2 === 0 ? 1 : -1} speed={i % 2 === 0 ? 25 : 18} />
//         ))}
//       </div>
//     </motion.div>
//   );
// }

function MarqueeRow({ direction, speed }: { direction: number; speed: number }) {
  return (
    <div className="flex w-full overflow-hidden whitespace-nowrap -my-4">
      <motion.div
        className="flex gap-4 text-[23vh] font-black uppercase leading-none text-[#ffceb8]"
        initial={{ x: direction > 0 ? "-20%" : "0%" }}
        animate={{ x: direction > 0 ? "0%" : "-20%" }}
        transition={{ repeat: Infinity, ease: "linear", duration: speed }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="mx-2">
            NAVIGATE CODE
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function LoginContent({ showPassword, setShowPassword, handleLogin }: { showPassword: boolean; setShowPassword: (show: boolean) => void; handleLogin: (e: React.FormEvent) => void }) {
  return (
    <motion.main 
      className="flex min-h-screen w-full bg-[#1c1a23] text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Left Column - Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 flex-col justify-between p-8 md:p-12">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/auth-bg.png"
            alt="Authentication Background"
            fill
            className="object-cover opacity-90"
            priority
          />
          {/* Overlay gradient for text readability if needed */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 mix-blend-multiply" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-widest text-white">
            AKAZA
          </h1>
        </div>

        {/* Top Right text (on top of image? Design shows it's part of the image area top right) */}
        <Link 
          href="/" 
          className="absolute top-10 right-10 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-sm font-medium border border-white/10"
        >
          Back to website <ArrowRight className="w-4 h-4" />
        </Link>
        
        {/* Bottom Text */}
        <div className="relative z-10 mt-auto mb-12">
          <h2 className="text-5xl font-medium leading-tight mb-2 tracking-tight">
            Navigate Codebases,<br />
            Amplify Intelligence
          </h2>
          
          {/* Pagination dots */}
          <div className="flex gap-2 mt-8">
            <div className="w-8 h-1.5 rounded-full bg-white"></div>
            <div className="w-2.5 h-1.5 rounded-full bg-white/40 hover:bg-white/60 cursor-pointer transition-colors"></div>
            <div className="w-2.5 h-1.5 rounded-full bg-white/40 hover:bg-white/60 cursor-pointer transition-colors"></div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 relative z-10">
        <div className="w-full max-w-[480px] space-y-8">
          
          <div className="space-y-2">
            <h2 className="text-4xl font-semibold tracking-tight text-white">Welcome Back!</h2>
            <p className="text-zinc-400">
              Don't have an account?{" "}
              <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors underline-offset-4 hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full h-12 rounded-lg bg-[#27252e] border border-zinc-700/50 text-white placeholder:text-zinc-500 px-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
            </div>

            <div className="space-y-2 relative">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full h-12 rounded-lg bg-[#27252e] border border-zinc-700/50 text-white placeholder:text-zinc-500 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
              <button 
                type="button" 
                className="absolute right-4 top-1/3 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
              >
                <Eye className="w-5 h-5" />
              </button>
              <div className="flex justify-end mt-2">
                <Link href="#" className="text-sm text-zinc-400 hover:text-violet-400 transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
               type="submit" 
               className="w-full h-12 rounded-lg bg-[#765cde] hover:bg-[#654aca] text-white font-medium text-lg transition-all shadow-lg shadow-violet-500/20 active:scale-[0.98]"
            >
              Sign in
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-700/50"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1c1a23] px-2 text-zinc-500">Or login with</span>
            </div>
          </div>



          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => signIn("google")}
              className="flex items-center justify-center gap-2 h-12 rounded-lg border border-zinc-700 hover:bg-zinc-800/50 transition-colors text-zinc-300 hover:text-white group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button 
              onClick={() => signIn("github")}
              className="flex items-center justify-center gap-2 h-12 rounded-lg border border-zinc-700 hover:bg-zinc-800/50 transition-colors text-zinc-300 hover:text-white"
            >
              <Github className="w-5 h-5 text-white" fill="currentColor" />
              Github
            </button>
          </div>
        </div>
      </div>
    </motion.main>
  );
}

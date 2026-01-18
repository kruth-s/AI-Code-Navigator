import Image from "next/image";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full bg-[#0d1b2a] text-white overflow-hidden font-sans">
      {/* Left Column - Hero Image */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/auth-bg.png"
            alt="Login Background"
            fill
            className="object-cover"
            priority
          />
           {/* Gradient overlays to match the reference look */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a] via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Branding */}
        <div className="relative z-10">
           {/* Using the red branding color from previous usage if implied, or sticking to white/clean */}
        </div>

        {/* Bottom Text */}
        <div className="relative z-10 mt-auto mb-8 text-center text-white/90">
             <h2 className="text-3xl font-light mb-2">AI Generative</h2>
             <h3 className="text-4xl font-semibold mb-4">Anything you can Imagine</h3>
             <p className="text-sm text-white/60 uppercase tracking-widest">Generate code with Akaza</p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative z-10 bg-[#063e9b] bg-gradient-to-br from-[#021333] to-[#042861]">
         {/* Top Navigation */}
         <div className="absolute top-8 left-8 lg:left-auto lg:right-12 w-full lg:w-auto flex justify-between lg:justify-end px-4 lg:px-0">
             <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                <ArrowRight className="w-4 h-4 rotate-180" /> Back to Signup
             </Link>
         </div>

        <div className="w-full max-w-[420px] space-y-10 relative">
          
          {/* Glow Effect behind the form */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="space-y-2 relative z-10 block">
            <h4 className="text-zinc-400 text-sm font-medium uppercase tracking-wide">Login your account</h4>
            <h1 className="text-5xl font-bold text-white tracking-tight">Welcome Back!</h1>
            <p className="text-zinc-400">Enter your email and password</p>
          </div>

          <form className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 ml-1">Email address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  defaultValue="Hello@basitkhan.design"
                  className="w-full h-14 rounded-2xl bg-[#0a1e3f]/50 border border-blue-500/30 text-white placeholder:text-zinc-600 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-white transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type="password" 
                  placeholder="Enter your password"
                  className="w-full h-14 rounded-2xl bg-[#0a1e3f]/50 border border-blue-500/30 text-white placeholder:text-zinc-600 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                />
                 {/* Blue glow specifically under/around the password field as per design reference */}
                 <div className="absolute inset-0 -z-10 bg-blue-600/10 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex justify-start">
               <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors underline decoration-zinc-600 underline-offset-4">
                 Forgot Password?
               </Link>
            </div>

            <button
               type="button" 
               className="w-full h-14 rounded-2xl bg-gradient-to-r from-black via-zinc-900 to-black hover:from-zinc-900 hover:to-zinc-800 text-white font-medium text-lg transition-all shadow-lg border border-white/10 active:scale-[0.98]"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

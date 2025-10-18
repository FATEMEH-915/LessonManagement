
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/authService'; 

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.login(username, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی در ورود رخ داده است');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen " dir="ltr">
      <div className="hidden md:block md:w-3/4 bg-gray-100"></div>
      <div className="w-full md:w-1/4 flex items-center justify-center p-5 bg-white shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-11 text-center text-black">
            ورود به سامانه
          </h1>
          
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-7">
            <div>
              <label htmlFor="username" className="block text-base font-medium mb-3 text-black text-right">
                نام کاربری
              </label>
              <input
                type="text"
                id="username"
                placeholder="نام کاربری خود را وارد کنید"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-right placeholder:text-right
                transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
                hover:border-gray-400"
                required
              />
            </div>
      
            <div>
              <label htmlFor="password" className="block text-base font-medium mb-3 text-black text-right">
                رمز عبور
              </label>
              <input
                type="password"
                id="password"
                placeholder="رمز عبور خود را وارد کنید"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-right placeholder:text-right
                transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
                hover:border-gray-400"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-500 text-lg text-white py-3 px-4 rounded-2xl hover:bg-blue-700 
              transition-all duration-300 transform hover:scale-[1.02] focus:scale-[0.98] focus:outline-none
              shadow-md hover:shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'در حال ورود...' : 'ورود'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}






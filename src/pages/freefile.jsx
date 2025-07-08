// import { useState } from 'react';

// export default function LoginPage({ onLogin }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleLogin = (e) => {
//     e.preventDefault();
//     onLogin(email); // You can pass or store any value entered in "email"
//   };

//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-100">
//       <form
//         onSubmit={handleLogin}
//         className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
//       >
//         <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
//           Login
//         </h2>

//         <label className="block mb-2 text-sm font-medium text-gray-600">
//           Username / Email
//         </label>
//         <input
//           type="text" // ✅ changed from "email" to "text"
//           className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           placeholder="Enter any text"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <label className="block mb-2 text-sm font-medium text-gray-600">
//           Password
//         </label>
//         <input
//           type="password"
//           className="w-full p-2 border border-gray-300 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           placeholder="••••••••"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button
//           type="submit"
//           className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
//         >
//           Log In
//         </button>
//       </form>
//     </div>
//   );
// }




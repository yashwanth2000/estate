import { FaSearch } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <NavLink to="/" end>
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Property</span>
            <span className="text-slate-700">Plaza</span>
          </h1>
        </NavLink>
        <form className="bg-slate-100 p-3 rounded-lg flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-24 sm:w-64"
          />
          <button>
            <FaSearch className="text-slate-600" />
          </button>
        </form>
        <ul className="flex gap-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-white-700 font-mono relative px-8 py-2 rounded-md bg-slate-200 isolation-auto z-10 border before:absolute before:transition-all before:duration-700 before:w-full before:left-0 before:rounded-full before:bg-blue-500 before:-z-10 before:aspect-square before:scale-150 overflow-hidden"
                : "text-slate-700 font-mono relative px-8 py-2 rounded-md bg-slate-200 isolation-auto z-10 border before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-blue-500 before:-z-10 before:aspect-square before:hover:scale-150 overflow-hidden before:hover:duration-700"
            }
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? "text-white-700 font-mono relative px-8 py-2 rounded-md bg-slate-200 isolation-auto z-10 border before:absolute before:transition-all before:duration-700 before:w-full before:left-0 before:rounded-full before:bg-blue-500 before:-z-10 before:aspect-square before:scale-150 overflow-hidden"
                : "text-slate-700 font-mono relative px-8 py-2 rounded-md bg-slate-200 isolation-auto z-10 border before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-blue-500 before:-z-10 before:aspect-square before:hover:scale-150 overflow-hidden before:hover:duration-700"
            }
          >
            About
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive
                ? "text-white-700 font-mono relative px-8 py-2 rounded-md bg-slate-200 isolation-auto z-10 border before:absolute before:transition-all before:duration-700 before:w-full before:left-0 before:rounded-full before:bg-blue-500 before:-z-10 before:aspect-square before:scale-150 overflow-hidden"
                : "text-slate-700 font-mono relative px-8 py-2 rounded-md bg-slate-200 isolation-auto z-10 border before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-blue-500 before:-z-10 before:aspect-square before:hover:scale-150 overflow-hidden before:hover:duration-700"
            }
          >
            {currentUser ? (
              <img
                className="rounded-full h-7 w-7 object-cover"
                src={currentUser.avatar}
                alt=""
              />
            ) : (
              "Login"
            )}
          </NavLink>
        </ul>
      </div>
    </header>
  );
}

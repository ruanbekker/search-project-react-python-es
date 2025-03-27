import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Movie', 'Book'];
const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState(() => {
    const stored = localStorage.getItem('recentSearches');
    return stored ? JSON.parse(stored) : [];
  });
  const [popularTags, setPopularTags] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return stored ? stored === 'true' : systemPrefersDark;
  });
  const [activeIndex, setActiveIndex] = useState(-1);

  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        const res = await axios.get(`${API_URL}/popular-tags`);
        setPopularTags(res.data);
      } catch (err) {
        console.error('Failed to load popular tags:', err);
      }
    };
    fetchPopularTags();
  }, []);

  useEffect(() => {
    if (!query) return setSuggestions([]);

    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/search?q=${query}`);
        let filtered = res.data;
        if (category !== 'All') {
          filtered = filtered.filter((item) => item.category === category);
        }
        setSuggestions(filtered);
        setActiveIndex(-1);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, category]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', next.toString());
    document.documentElement.classList.toggle('dark', next);
  };

  const saveToRecent = (text) => {
    const updated = [text, ...recent.filter((r) => r !== text)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selected = activeIndex >= 0 ? suggestions[activeIndex].title : query;
    if (!selected) return;
    saveToRecent(selected);
    navigate(`/results?q=${encodeURIComponent(selected)}&category=${category}`);
  };

  const handleSuggestionClick = (text) => {
    saveToRecent(text);
    navigate(`/results?q=${encodeURIComponent(text)}&category=${category}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    }
    if (e.key === 'Escape') {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center px-4 relative">
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:scale-110 transition"
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-700" />}
      </button>

      {/* Search Input + Category Dropdown */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl relative mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              onKeyDown={handleKeyDown}
              className="w-full pl-12 p-4 rounded-lg border shadow text-xl dark:bg-gray-800 dark:text-white"
              placeholder="Search for something..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Dropdown */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 h-full"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded mt-1 w-full shadow z-10"
            >
              {suggestions.map((s, index) => (
                <li
                  key={s.id}
                  className={`px-4 py-2 cursor-pointer ${
                    index === activeIndex
                      ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
                      : 'text-gray-800 dark:text-gray-100'
                  }`}
                  onClick={() => handleSuggestionClick(s.title)}
                >
                  <span className="font-medium">{s.title}</span>
                  {s.category && (
                    <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                      {s.category}
                    </span>
                  )}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </form>

      {/* Recent Searches */}
      {query === '' && recent.length > 0 && (
        <div className="mt-4 w-full max-w-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-gray-700 dark:text-gray-300 text-sm">Recent Searches</h2>
            <button
              onClick={() => {
                localStorage.removeItem('recentSearches');
                setRecent([]);
              }}
              className="text-xs text-red-500 hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(item)}
                className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-full hover:scale-105 transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Tags */}
      <div className="mt-6 w-full max-w-xl">
        <h2 className="text-gray-700 dark:text-gray-300 mb-2 text-sm">Popular Tags</h2>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(tag)}
              className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full hover:scale-105 transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


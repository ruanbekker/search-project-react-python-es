import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertTriangle } from 'lucide-react';

const RESULTS_PER_PAGE = 6;
const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export default function Results() {
  const [results, setResults] = useState([]);
  const [visibleResults, setVisibleResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [expandedCard,] = useState(null);

  const [params] = useSearchParams();
  const query = params.get('q');
  const category = params.get('category');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError('');
      setPage(1);
      try {
        const res = await axios.get(`${API_URL}/search?q=${query}`,
          { 
            headers: {'X-API-Key': API_KEY }
          }
        );
        let filtered = res.data;
        if (category && category !== 'All') {
          filtered = filtered.filter((item) => item.category === category);
        }
	console.log("API response:", filtered);
        setResults(filtered);
      } catch (err) {
        console.error(err);
        setError('Something went wrong while fetching results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, category]);

  useEffect(() => {
    const start = (page - 1) * RESULTS_PER_PAGE;
    const end = start + RESULTS_PER_PAGE;
    setVisibleResults(results.slice(start, end));
  }, [page, results]);

  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);

  return (
    <div className="min-h-screen p-6 md:p-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-6">
        Results for <span className="text-blue-600 dark:text-blue-400">"{query}"</span>
        {category && category !== 'All' && (
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-300">(Category: {category})</span>
        )}
      </h1>

      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin text-blue-600" />
          <span>Loading results...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-500">
          <AlertTriangle />
          <span>{error}</span>
        </div>
      ) : results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-8">
            {visibleResults.map((item) => {
              const isExpanded = expandedCard === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/details/${item.id}`)}
		  className={`cursor-pointer bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${
                    isExpanded ? 'scale-100' : 'hover:scale-105'
                  }`}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-1">{item.title}</h2>
                    {item.category && (
                      <span className="inline-block text-xs text-white bg-blue-500 px-2 py-0.5 rounded-full mb-2">
                        {item.category}
                      </span>
                    )}
                    {item.description && (
                      <p
                        className={`text-sm text-gray-700 dark:text-gray-300 mt-2 transition-all duration-300 ${
                          isExpanded ? '' : 'line-clamp-3'
                        }`}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 items-center">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}


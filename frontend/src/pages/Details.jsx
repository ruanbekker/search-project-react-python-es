import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`${API_URL}/details/${id}`);
        setMovie(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load details.');
      }
    };
    fetchMovie();
  }, [id]);

  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!movie) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen p-6 md:p-12 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">

        {/* Back Button */}
        <div className="p-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700 transition hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="text-sm font-medium">Back to Search</span>
          </button>
        </div>

        {/* Movie Image */}
        {movie.image && (
          <div className="flex justify-center">
            <img
              src={movie.image}
              alt={movie.title}
              className="rounded-t-lg max-h-[500px] w-auto object-contain"
            />
          </div>
        )}

        {/* Movie Info */}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {movie.year} • Directed by {movie.director}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.tags?.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-600 text-white px-3 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-md text-gray-800 dark:text-gray-200">
            {movie.description}
          </p>
        </div>
      </div>
    </div>
  );
}


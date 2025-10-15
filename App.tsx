
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Spinner } from './components/Spinner';
import { generateHugImage } from './services/geminiService';

const App: React.FC = () => {
  const [childhoodPhoto, setChildhoodPhoto] = useState<File | null>(null);
  const [recentPhoto, setRecentPhoto] = useState<File | null>(null);
  const [childhoodPhotoPreview, setChildhoodPhotoPreview] = useState<string | null>(null);
  const [recentPhotoPreview, setRecentPhotoPreview] = useState<string | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChildhoodPhotoUpload = (file: File) => {
    setChildhoodPhoto(file);
    setChildhoodPhotoPreview(URL.createObjectURL(file));
  };

  const handleRecentPhotoUpload = (file: File) => {
    setRecentPhoto(file);
    setRecentPhotoPreview(URL.createObjectURL(file));
  };

  const handleGenerate = useCallback(async () => {
    if (!childhoodPhoto || !recentPhoto) {
      setError("Please upload both photos before generating.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateHugImage(childhoodPhoto, recentPhoto);
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [childhoodPhoto, recentPhoto]);
  
  // Clean up Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (childhoodPhotoPreview) {
        URL.revokeObjectURL(childhoodPhotoPreview);
      }
      if (recentPhotoPreview) {
        URL.revokeObjectURL(recentPhotoPreview);
      }
    };
  }, [childhoodPhotoPreview, recentPhotoPreview]);


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8 bg-white p-6 sm:p-10 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageUploader
              id="childhood_photo"
              label="Childhood Photo"
              onImageUpload={handleChildhoodPhotoUpload}
              previewUrl={childhoodPhotoPreview}
              disabled={isLoading}
            />
            <ImageUploader
              id="recent_photo"
              label="Recent Photo"
              onImageUpload={handleRecentPhotoUpload}
              previewUrl={recentPhotoPreview}
              disabled={isLoading}
            />
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={handleGenerate}
              disabled={!childhoodPhoto || !recentPhoto || isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center px-12 py-4 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Generating Your Moment...
                </>
              ) : (
                'Create Generational Embrace'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
              <p><strong>Oops!</strong> {error}</p>
            </div>
          )}

          {generatedImage && (
            <div className="mt-10">
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">Your Generated Image</h3>
              <div className="bg-gray-100 p-2 rounded-xl shadow-inner">
                 <img
                    src={generatedImage}
                    alt="Generated embrace between younger and older self"
                    className="w-full h-auto object-contain rounded-lg shadow-md"
                  />
              </div>
            </div>
          )}
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

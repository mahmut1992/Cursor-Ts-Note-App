import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { deleteNote } from "../redux/slices/noteSlice";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [animate, setAnimate] = useState(false);

  // Animasyon için
  useEffect(() => {
    setAnimate(true);
  }, []);

  // Store'dan notları al
  const note = useAppSelector((state) =>
    state.notes.notes.find((note) => note.id === id)
  );

  // Not bulunamadıysa
  if (!note) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <svg
            className="w-20 h-20 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h1 className="text-2xl font-bold text-gray-700 mb-2">
            Not Bulunamadı
          </h1>
          <p className="text-gray-500 mb-6">
            Aradığınız not mevcut değil veya silinmiş olabilir.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm("Bu notu silmek istediğinize emin misiniz?")) {
      dispatch(deleteNote(id!));
      toast.success("Not başarıyla silindi!");
      navigate("/");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Başlık ve Buton Alanı */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{note.title}</h1>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors flex items-center"
        >
          <svg
            className="h-5 w-5 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Geri
        </button>
      </div>

      {/* İçerik Kartı */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
        {/* Markdown İçerik */}
        <div className="prose prose-lg max-w-none mb-6">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>

        {/* Etiketler */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm font-medium text-gray-600">
              Etiketler:
            </span>
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Aksiyon Butonları */}
        <div className="flex justify-between pt-4 border-t border-gray-200 mt-8">
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/edit/${note.id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Düzenle
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Sil
            </button>
          </div>
          <div>
            <button
              onClick={() => window.print()}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
              title="Yazdır"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Yazdır
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;

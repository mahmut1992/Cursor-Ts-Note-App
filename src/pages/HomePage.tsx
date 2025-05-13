import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { deleteNote } from "../redux/slices/noteSlice";
import type { Note } from "../redux/slices/noteSlice";
import { toast } from "react-toastify";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const allNotes = useAppSelector((state) => state.notes.notes);

  // Arama ve filtreleme için state
  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(allNotes);

  // Tüm etiketleri topla
  const allTags = Array.from(
    new Set(allNotes.flatMap((note) => note.tags))
  ).filter(Boolean);

  // Etiket filtreleme
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Filtreleme fonksiyonu
  useEffect(() => {
    let result = allNotes;

    // Başlık araması uygula
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      result = result.filter((note) =>
        note.title.toLowerCase().includes(searchLower)
      );
    }

    // Etiket filtresi uygula
    if (selectedTags.length > 0) {
      result = result.filter((note) =>
        selectedTags.some((tag) => note.tags.includes(tag))
      );
    }

    setFilteredNotes(result);
  }, [searchText, selectedTags, allNotes]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bu notu silmek istediğinizden emin misiniz?")) {
      dispatch(deleteNote(id));
      toast.success("Not başarıyla silindi!");
    }
  };

  const navigateToNote = (id: string) => {
    navigate(`/detail/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Başlık ve Yeni Not Ekleme Butonu */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Notlarım</h1>
        <button
          onClick={() => navigate("/new")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Yeni Not Ekle
        </button>
      </div>

      {/* Filtreleme Alanı */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Filtreleme</h2>

        {/* Başlık Arama */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Başlık Ara:
          </label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Not başlığı ara..."
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Etiket Filtreleme */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Etiketlere Göre Filtrele:
          </label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`py-1 px-3 rounded-md text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Not Listesi */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <p className="text-xl font-medium text-gray-700 mb-2">
            {searchText || selectedTags.length > 0
              ? "Arama kriterlerinize uygun not bulunamadı."
              : "Henüz not eklenmemiş."}
          </p>
          <p className="text-gray-500 mb-6">
            {searchText || selectedTags.length > 0
              ? "Farklı bir arama terimi deneyin."
              : "İlk notunuzu eklemek için 'Yeni Not Ekle' butonuna tıklayın."}
          </p>
          {searchText || selectedTags.length > 0 ? (
            <button
              onClick={() => {
                setSearchText("");
                setSelectedTags([]);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Filtreleri Temizle
            </button>
          ) : (
            <button
              onClick={() => navigate("/new")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Yeni Not Ekle
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => navigateToNote(note.id)}
                className="bg-white rounded-lg p-5 border border-gray-200 cursor-pointer hover:shadow-md transition-all"
              >
                <h2 className="text-xl font-bold mb-3 text-gray-800">
                  {note.title}
                </h2>

                {/* Not içerik önizlemesi */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {note.content.replace(/[#*>]/g, "").slice(0, 100)}
                  {note.content.length > 100 ? "..." : ""}
                </p>

                {/* Etiketler */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Butonlar */}
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit/${note.id}`);
                    }}
                    className="text-blue-500 hover:text-blue-700 mr-3"
                    title="Düzenle"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={(e) => handleDelete(note.id, e)}
                    className="text-red-500 hover:text-red-700"
                    title="Sil"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-gray-500">
            {filteredNotes.length} not gösteriliyor (toplam {allNotes.length})
          </p>
        </>
      )}
    </div>
  );
};

export default HomePage;

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { createNote, updateNote } from "../redux/slices/noteSlice";
import type { Note } from "../redux/slices/noteSlice";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";

const FormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const notes = useAppSelector((state) => state.notes.notes);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [errors, setErrors] = useState({});

  // Düzenleme modunda ise mevcut not verilerini yükle
  useEffect(() => {
    if (id) {
      const existingNote = notes.find((note) => note.id === id);
      if (existingNote) {
        setTitle(existingNote.title);
        setContent(existingNote.content);
        setTags(existingNote.tags);
      } else {
        // Not bulunamadıysa ana sayfaya yönlendir
        navigate("/");
      }
    }
  }, [id, notes, navigate]);

  // Etiket ekle
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  // Enter tuşuna basılınca etiket ekle
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Var olan etiketi kaldır
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Önerilen etiketi ekle
  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  // Formu gönderme
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Zorunlu alanları kontrol et
    if (!title.trim()) {
      setErrors((prev) => ({ ...prev, title: "Başlık zorunludur" }));
      toast.error("Başlık alanı boş olamaz!");
      return;
    }

    if (!content.trim()) {
      setErrors((prev) => ({ ...prev, content: "İçerik zorunludur" }));
      toast.error("İçerik alanı boş olamaz!");
      return;
    }

    const noteData = {
      title: title.trim(),
      content,
      tags,
    };

    // Form ID varsa güncelleme, yoksa yeni not oluşturma
    if (id) {
      dispatch(updateNote({ id, ...noteData }));
      toast.success("Not başarıyla güncellendi!");
    } else {
      dispatch(createNote(noteData));
      toast.success("Yeni not başarıyla oluşturuldu!");
    }

    // Ana sayfaya yönlendir
    navigate("/");
  };

  // Markdown formatı ekleme fonksiyonları
  const insertMarkdown = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newText = "";
    let newCursorPos = 0;

    switch (format) {
      case "bold":
        newText =
          content.substring(0, start) +
          `**${selectedText}**` +
          content.substring(end);
        newCursorPos = selectedText ? end + 4 : start + 2;
        break;
      case "italic":
        newText =
          content.substring(0, start) +
          `*${selectedText}*` +
          content.substring(end);
        newCursorPos = selectedText ? end + 2 : start + 1;
        break;
      case "heading":
        newText =
          content.substring(0, start) +
          `# ${selectedText}` +
          content.substring(end);
        newCursorPos = selectedText ? end + 2 : start + 2;
        break;
      case "quote":
        newText =
          content.substring(0, start) +
          `> ${selectedText}` +
          content.substring(end);
        newCursorPos = selectedText ? end + 2 : start + 2;
        break;
      case "unorderedList":
        newText =
          content.substring(0, start) +
          `* ${selectedText}` +
          content.substring(end);
        newCursorPos = selectedText ? end + 2 : start + 2;
        break;
      case "orderedList":
        newText =
          content.substring(0, start) +
          `1. ${selectedText}` +
          content.substring(end);
        newCursorPos = selectedText ? end + 3 : start + 3;
        break;
      case "link":
        newText =
          content.substring(0, start) +
          `[${selectedText || "bağlantı"}](url)` +
          content.substring(end);
        newCursorPos = selectedText ? end + 7 : start + 10;
        break;
      case "image":
        newText =
          content.substring(0, start) +
          `![${selectedText || "resim açıklaması"}](url)` +
          content.substring(end);
        newCursorPos = selectedText ? end + 9 : start + 19;
        break;
      case "table":
        newText =
          content.substring(0, start) +
          `| Başlık 1 | Başlık 2 |\n| --- | --- |\n| İçerik 1 | İçerik 2 |` +
          content.substring(end);
        newCursorPos = start + 53;
        break;
      case "code":
        newText =
          content.substring(0, start) +
          `\`${selectedText}\`` +
          content.substring(end);
        newCursorPos = selectedText ? end + 2 : start + 1;
        break;
      default:
        newText = content;
        break;
    }

    setContent(newText);

    // Set cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Satır ve kelime sayısı
  const lineCount = content.split("\n").length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        {id ? "Notu Düzenle" : "Yeni Not Oluştur"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        {/* Başlık */}
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Başlık:
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Not başlığı"
          />
        </div>

        {/* İçerik */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-600"
            >
              İçerik:
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-blue-500 text-sm font-medium hover:text-blue-700"
            >
              {showPreview ? "Düzenleme" : "Önizleme"}
            </button>
          </div>

          {/* Markdown Araç Çubuğu */}
          <div className="border border-gray-300 rounded-t-lg overflow-hidden">
            <div className="flex flex-wrap items-center p-2 bg-gray-50 border-b border-gray-300">
              <button
                type="button"
                onClick={() => insertMarkdown("bold")}
                className="p-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                title="Kalın (Bold)"
              >
                <span className="font-bold">B</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("italic")}
                className="p-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                title="İtalik (Italic)"
              >
                <span className="italic">I</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("heading")}
                className="p-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                title="Başlık (Heading)"
              >
                <span className="font-bold">H</span>
              </button>
              <span className="h-6 w-px bg-gray-300 mx-1"></span>
              <button
                type="button"
                onClick={() => insertMarkdown("quote")}
                className="p-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                title="Alıntı (Quote)"
              >
                <span>❝</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("unorderedList")}
                className="p-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                title="Sırasız Liste (Bullet List)"
              >
                <span>•</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("orderedList")}
                className="p-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                title="Sıralı Liste (Numbered List)"
              >
                <span>1.</span>
              </button>
              <span className="h-6 w-px bg-gray-300 mx-1"></span>
              <button
                type="button"
                onClick={() => insertMarkdown("link")}
                className="p-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                title="Bağlantı (Link)"
              >
                <span>🔗</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("image")}
                className="p-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                title="Resim (Image)"
              >
                <span>🖼️</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("table")}
                className="p-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                title="Tablo (Table)"
              >
                <span>☰</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("code")}
                className="p-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                title="Kod (Code)"
              >
                <span>⌨</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const textarea = textareaRef.current;
                  if (textarea) textarea.focus();
                }}
                className="p-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                title="Yardım (Help)"
              >
                <span>?</span>
              </button>
            </div>

            {/* İçerik Alanı / Önizleme */}
            <div className="relative min-h-64">
              {showPreview ? (
                <div className="p-4 min-h-64 prose max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 border-none min-h-64 font-mono resize-vertical focus:ring-0 focus:outline-none"
                  required
                  placeholder="İçeriği markdown formatında yazın..."
                ></textarea>
              )}
            </div>
          </div>

          {/* Satır ve Kelime Sayısı */}
          <div className="text-xs text-gray-500 text-right mt-1">
            lines: {lineCount} words: {wordCount}
          </div>
        </div>

        {/* Etiketler */}
        <div className="mb-6">
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Etiketler:
          </label>

          {/* Etiket Ekleme */}
          <div className="flex mb-2">
            <input
              id="newTag"
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyPress}
              className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Yeni etiket..."
            />
            <button
              type="button"
              onClick={addTag}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-r-lg transition-colors"
            >
              Ekle
            </button>
          </div>

          {/* Mevcut Etiketler */}
          {tags.length > 0 && (
            <div className="mt-2">
              <p className="block text-sm font-medium text-gray-600 mb-2">
                Mevcut etiketler:
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-sm font-medium flex items-center group"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-500 group-hover:text-blue-800"
                      title="Etiketi kaldır"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Önerilen Etiketler */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {[
                "iş",
                "eğitim",
                "önemli",
                "deploy",
                "yapay zeka",
                "ai",
                "cursor",
                "eleman",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addSuggestedTag(tag)}
                  disabled={tags.includes(tag)}
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    tags.includes(tag)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            {id ? "Değişiklikleri Kaydet" : "Oluştur"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormPage;

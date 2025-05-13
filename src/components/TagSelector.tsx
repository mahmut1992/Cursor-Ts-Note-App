import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

interface TagSelectorProps {
  availableTags: string[]; // Sisteme kayıtlı tüm etiketler
  selectedTags: string[]; // Seçilmiş etiketler
  onChange: (tags: string[]) => void; // Seçilen etiketler değiştiğinde çağrılacak fonksiyon
  placeholder?: string; // Input için placeholder
  allowCreation?: boolean; // Yeni etiket oluşturmaya izin verilip verilmediği
  className?: string; // Ek CSS sınıfları
}

const TagSelector: React.FC<TagSelectorProps> = ({
  availableTags,
  selectedTags,
  onChange,
  placeholder = "Etiket ara veya ekle...",
  allowCreation = true,
  className = "",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Input değeri değiştiğinde filtreleme yap
  useEffect(() => {
    if (inputValue.trim() === "") {
      // Boşsa ve henüz seçilmemiş tüm etiketleri göster
      setFilteredTags(
        availableTags.filter((tag) => !selectedTags.includes(tag))
      );
    } else {
      // Arama terimine göre filtrele (seçilmiş olanları hariç tut)
      const filtered = availableTags.filter(
        (tag) =>
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.includes(tag)
      );
      setFilteredTags(filtered);
    }

    setActiveIndex(-1);
  }, [inputValue, availableTags, selectedTags]);

  // Input odağı değiştiğinde dropdown'ı göster/gizle
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Dropdown dışına tıklanınca kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Etiket ekleme fonksiyonu
  const addTag = (tag: string) => {
    // Etiket zaten seçiliyse işlem yapma
    if (selectedTags.includes(tag)) {
      toast.warning(`"${tag}" etiketi zaten seçili!`);
      return;
    }

    // Seçilen etiketlere ekle
    const newTags = [...selectedTags, tag];
    onChange(newTags);
    toast.info(`"${tag}" etiketi eklendi.`);

    // Input'u temizle ve dropdown'ı kapat
    setInputValue("");
    setIsOpen(false);

    // Input'a odaklan
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Etiket silme fonksiyonu
  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    onChange(newTags);
    toast.info(`"${tagToRemove}" etiketi kaldırıldı.`);
  };

  // Klavye etkileşimleri için
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter: Seçili etiketi ekle veya yeni etiket oluştur
    if (e.key === "Enter") {
      e.preventDefault();

      if (activeIndex >= 0 && activeIndex < filteredTags.length) {
        // Dropdown'dan seçilen etiketi ekle
        addTag(filteredTags[activeIndex]);
      } else if (inputValue.trim() !== "" && allowCreation) {
        // Yeni etiket oluştur
        if (
          !availableTags.includes(inputValue.trim()) &&
          !selectedTags.includes(inputValue.trim())
        ) {
          addTag(inputValue.trim());
        } else if (
          availableTags.includes(inputValue.trim()) &&
          !selectedTags.includes(inputValue.trim())
        ) {
          // Var olan etiketi ekle
          addTag(inputValue.trim());
        }
      }
    }

    // Aşağı ok: Sonraki öneriye git
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredTags.length - 1 ? prev + 1 : 0));
    }

    // Yukarı ok: Önceki öneriye git
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredTags.length - 1));
    }

    // Backspace: Input boşsa son etiketi sil
    else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      selectedTags.length > 0
    ) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }

    // Escape: Dropdown'ı kapat
    else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Seçilen etiketler ve input */}
      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {/* Seçili etiketler */}
        {selectedTags.map((tag) => (
          <div
            key={tag}
            className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
          >
            {tag}
            <button
              type="button"
              className="ml-1 text-blue-600 hover:text-blue-800"
              onClick={() => removeTag(tag)}
              aria-label={`Kaldır: ${tag}`}
            >
              ×
            </button>
          </div>
        ))}

        {/* Input alanı */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="flex-grow outline-none min-w-20 py-1"
          placeholder={selectedTags.length > 0 ? "" : placeholder}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredTags.length > 0 ? (
            <ul>
              {filteredTags.map((tag, index) => (
                <li
                  key={tag}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    index === activeIndex ? "bg-gray-100" : ""
                  }`}
                  onClick={() => addTag(tag)}
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : inputValue.trim() !== "" && allowCreation ? (
            <div
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-blue-600"
              onClick={() => addTag(inputValue.trim())}
            >
              <span className="font-medium">"{inputValue.trim()}"</span> ekle
            </div>
          ) : (
            <div className="px-4 py-2 text-gray-500">Sonuç yok</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;

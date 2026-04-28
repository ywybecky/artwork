import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, X, ChevronDown, Palette, GraduationCap, Sparkles } from 'lucide-react';
import bannerImage from './banner.png';
import artworksData from './data/artworks.json';

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const allArtworks = shuffleArray(
  artworksData.filter(a => a.title && a.student && a.theme)
);

function MagneticWrapper({ children }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
  };
  const reset = () => setPosition({ x: 0, y: 0 });
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 20, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

const BANNER_IMAGE_URL = bannerImage;

const themes = [
  { id: 'all',         label: '全部作品', emoji: '🎨', color: 'from-pink-400 to-purple-500' },
  { id: 'self',        label: '認識自己', emoji: '🪞', color: 'from-pink-400 to-rose-400' },
  { id: 'animals',     label: '可愛動物', emoji: '🐾', color: 'from-amber-400 to-yellow-400' },
  { id: 'school',      label: '快樂校園', emoji: '🏫', color: 'from-yellow-400 to-orange-400' },
  { id: 'healthy',     label: '健康生活', emoji: '🌿', color: 'from-green-400 to-emerald-400' },
  { id: 'food',        label: '美食博覽', emoji: '🍰', color: 'from-red-400 to-orange-400' },
  { id: 'urban',       label: '都市建築', emoji: '🏙️', color: 'from-blue-400 to-cyan-400' },
  { id: 'design',      label: '創意設計', emoji: '✂️', color: 'from-violet-400 to-purple-400' },
  { id: 'chinese',     label: '中華文化', emoji: '🏮', color: 'from-red-500 to-rose-400' },
  { id: 'masterpiece', label: '名畫致敬', emoji: '🖼️', color: 'from-cyan-400 to-blue-400' },
  { id: 'scenery',     label: '優美風景', emoji: '🏞️', color: 'from-teal-400 to-green-400' },
  { id: 'ink',         label: '水墨畫',   emoji: '🖌️', color: 'from-gray-500 to-slate-400' },
];

const classLevels = [
  '全部', '小一', '小二', '小三', '小四', '小五', '小六',
  '中一', '中二', '中三', '中四', '中五', '中六'
];

function themeInfo(themeId) {
  return themes.find(t => t.id === themeId);
}

function ArtPlaceholder({ hue, title }) {
  const gradientId = useRef('bg-grad-' + Math.random().toString(36).slice(2, 11)).current;
  const h1 = hue;
  const h2 = (hue + 40) % 360;
  const shapes = useMemo(() => {
    const s = [];
    for (let i = 0; i < 5; i++) {
      s.push({
        x: 15 + (i * 17) % 70,
        y: 10 + (i * 23) % 60,
        size: 15 + (i * 7) % 25,
        rotation: i * 37,
        type: i % 3,
      });
    }
    return s;
  }, []);

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={'hsl(' + h1 + ', 70%, 85%)'} />
          <stop offset="100%" stopColor={'hsl(' + h2 + ', 70%, 80%)'} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={'url(#' + gradientId + ')'} />
      {shapes.map((s, i) => {
        const fill = 'hsl(' + ((hue + i * 50) % 360) + ', 65%, 65%)';
        if (s.type === 0) return <circle key={i} cx={s.x} cy={s.y} r={s.size / 2} fill={fill} opacity="0.7" />;
        if (s.type === 1) return <rect key={i} x={s.x} y={s.y} width={s.size} height={s.size} rx="3" fill={fill} opacity="0.6" transform={'rotate(' + s.rotation + ', ' + (s.x + s.size/2) + ', ' + (s.y + s.size/2) + ')'} />;
        return <polygon key={i} points={s.x + ',' + (s.y - s.size/2) + ' ' + (s.x + s.size/2) + ',' + (s.y + s.size/2) + ' ' + (s.x - s.size/2) + ',' + (s.y + s.size/2)} fill={fill} opacity="0.6" />;
      })}
      <text x="50" y="88" textAnchor="middle" fontSize="5" fill={'hsl(' + h1 + ', 40%, 40%)'} fontWeight="bold">{title}</text>
    </svg>
  );
}

function ArtworkImage({ artwork, isFullSize }) {
  const [error, setError] = useState(false);
  const hue = (artwork.id * 37) % 360;
  const base = import.meta.env.BASE_URL;
  const folder = isFullSize ? 'full' : 'thumbs';
  const filename = isFullSize ? artwork.full : artwork.thumb;
  const imgSrc = base + 'artworks/' + folder + '/' + filename;

  if (error || !filename) {
    return <ArtPlaceholder hue={hue} title={artwork.title} />;
  }

  return (
    <img
      src={imgSrc}
      alt={artwork.title}
      className={isFullSize ? 'w-full h-auto object-contain' : 'w-full h-full object-cover'}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

function WelcomeScreen({ onEnter }) {
  const [bannerError, setBannerError] = useState(false);
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 25%, #f5576c 50%, #fda085 75%, #4facfe 100%)' }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="text-center px-4 w-full max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="mb-8 mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white border-opacity-40">
          {!bannerError ? (
            <img
              src={BANNER_IMAGE_URL}
              alt="展覽橫額"
              className="w-full h-auto"
              onError={() => setBannerError(true)}
            />
          ) : (
            <div className="w-full py-12 bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-2xl font-black drop-shadow-md">
                🎨 學生藝術作品展覽
              </span>
            </div>
          )}
        </div>

        <motion.div
          className="text-5xl mb-4"
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          🎨
        </motion.div>

        <p className="text-lg text-white mb-1 drop-shadow font-medium">沙田公立學校</p>
        <p className="text-base text-white mb-8 opacity-90">共 {allArtworks.length} 件精彩作品 ✨</p>

        <MagneticWrapper>
          <motion.button
            onClick={onEnter}
            className="bg-white text-purple-600 font-bold text-lg px-10 py-4 rounded-full shadow-xl hover:shadow-2xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            進入展覽 🚪
          </motion.button>
        </MagneticWrapper>
      </motion.div>

      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none"
          style={{ left: ((i * 5) % 100) + '%', top: ((i * 7 + 10) % 100) + '%' }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
        >
          {['⭐', '🌈', '🎵', '💫', '🦋', '🌸', '✏️', '🖍️', '📐', '🎭'][i % 10]}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function ArtExhibition() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('全部');
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [bannerError, setBannerError] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [displayCount, setDisplayCount] = useState(8);

  const classDropdownRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!showClassDropdown) return;
    const handleClickOutside = (e) => {
      if (classDropdownRef.current && !classDropdownRef.current.contains(e.target)) {
        setShowClassDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showClassDropdown]);

  useEffect(() => {
    if (!selectedArtwork) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedArtwork(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedArtwork]);

  useEffect(() => {
    const shouldLock = showWelcome || !!selectedArtwork;
    document.body.style.overflow = shouldLock ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showWelcome, selectedArtwork]);

  useEffect(() => {
    if (!isShuffling) return;
    const timer = setTimeout(() => {
      const rand = allArtworks[Math.floor(Math.random() * allArtworks.length)];
      setSelectedArtwork(rand);
      setIsShuffling(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [isShuffling]);

  const filtered = useMemo(() => {
    return allArtworks.filter(a => {
      if (selectedTheme !== 'all' && a.theme !== selectedTheme) return false;
      if (selectedGrade !== '全部' && a.class !== selectedGrade) return false;
      return true;
    });
  }, [selectedTheme, selectedGrade]);

  useEffect(() => {
    setDisplayCount(8);
  }, [selectedTheme, selectedGrade]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => Math.min(prev + 8, filtered.length));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [filtered]);

  const displayedArtworks = filtered.slice(0, displayCount);
  const handleRandom = () => setIsShuffling(true);
  const currentArtworkInfo = selectedArtwork ? themeInfo(selectedArtwork.theme) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <AnimatePresence>
        {showWelcome && <WelcomeScreen key="welcome" onEnter={() => setShowWelcome(false)} />}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-gradient-to-r from-rose-100 via-pink-100 to-orange-100 border-b border-pink-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none">🎨</span>
              <div className="flex items-baseline gap-2">
                <h1 className="text-xl font-black leading-none bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  沙田公立學校
                </h1>
                <p className="text-xs text-gray-500 leading-none">{allArtworks.length} 件作品</p>
              </div>
            </div>
            <motion.button
              onClick={handleRandom}
              className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-3 sm:px-5 py-2.5 rounded-full text-sm font-bold shadow-lg whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isShuffling ? 360 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex items-center justify-center"
              >
                <Shuffle size={16} />
              </motion.div>
              <span className="tracking-wider sm:hidden">隨機</span>
              <span className="tracking-wider hidden sm:inline">隨機欣賞</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* Banner */}
        <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border-2 border-pink-100 max-w-2xl mx-auto">
          {bannerError ? (
            <div className="w-full h-36 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
              <span className="text-white text-2xl font-black drop-shadow-lg">
                🎨 學生藝術作品展覽 🎨
              </span>
            </div>
          ) : (
            <img
              src={BANNER_IMAGE_URL}
              alt="展覽橫額"
              className="w-full h-auto"
              onError={() => setBannerError(true)}
            />
          )}
        </div>

        {/* Class Filter */}
        <div className="mb-4 relative" ref={classDropdownRef}>
          <button
            onClick={() => setShowClassDropdown(!showClassDropdown)}
            className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-pink-200 text-sm font-bold text-gray-700 hover:border-purple-300 transition-colors"
          >
            <GraduationCap size={16} className="text-purple-500" />
            班別：{selectedGrade}
            <ChevronDown size={14} className={'transition-transform ' + (showClassDropdown ? 'rotate-180' : '')} />
          </button>
          <AnimatePresence>
            {showClassDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-12 left-0 z-30 bg-white rounded-xl shadow-xl border border-pink-100 p-2 grid grid-cols-4 gap-1 w-72"
              >
                {classLevels.map(cl => (
                  <button
                    key={cl}
                    onClick={() => { setSelectedGrade(cl); setShowClassDropdown(false); }}
                    className={'px-3 py-2 rounded-lg text-sm font-medium transition-all ' + (selectedGrade === cl ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'hover:bg-purple-50 text-gray-600')}
                  >
                    {cl}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {themes.map((theme, index) => (
              <div key={theme.id} className={!showAllThemes && index >= 6 ? 'hidden sm:block' : ''}>
                <motion.button
                  onClick={() => setSelectedTheme(theme.id)}
                  className={'flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm whitespace-nowrap ' + (selectedTheme === theme.id ? 'bg-gradient-to-r ' + theme.color + ' text-white shadow-md' : 'bg-white text-gray-600 hover:shadow-md border border-gray-100')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>{theme.emoji}</span>
                  {theme.label}
                </motion.button>
              </div>
            ))}
            <div className="sm:hidden">
              <motion.button
                onClick={() => setShowAllThemes(!showAllThemes)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-white text-purple-500 border border-purple-200 shadow-sm whitespace-nowrap"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {showAllThemes ? '收起 ▲' : '更多 ▼'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-500" />
          <p className="text-sm text-gray-500 font-medium">
            共 <span className="text-purple-600 font-bold">{filtered.length}</span> 件作品
          </p>
        </div>

        {/* Artwork Grid */}
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {displayedArtworks.map(artwork => (
              <motion.div
                key={artwork.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setSelectedArtwork(artwork)}
                className="cursor-pointer group"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">

                  {/* 圖片 */}
                  <div className="aspect-square overflow-hidden">
                    <motion.div
                      className="w-full h-full"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                    >
                      <ArtworkImage artwork={artwork} isFullSize={false} />
                    </motion.div>
                  </div>

                 {/* 底部資訊：兩行 */}
<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-8 pb-2.5 px-2.5">
  
  {/* 第一行：主題emoji + 標題 */}
  <div className="flex items-center gap-1 mb-1">
    <span className="shrink-0 text-xs leading-none">
      {themeInfo(artwork.theme) && themeInfo(artwork.theme).emoji}
    </span>
    <h3 className="font-bold text-xs text-white leading-tight">
      {artwork.title}
    </h3>
  </div>

  {/* 第二行：學生名 + 班別 */}
  <div className="flex items-center justify-between">
    <p className="text-xs text-white/80 leading-tight">
      {artwork.student}
    </p>
    <span className="text-xs bg-black/50 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full font-medium border border-white/30 leading-tight">
      {artwork.class}
    </span>
  </div>

</div>

                  {/* Hover 圖示 */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow">
                      <Sparkles size={12} className="text-purple-500" />
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400 font-medium">這個分類暫時沒有作品</p>
            <button
              onClick={() => { setSelectedTheme('all'); setSelectedGrade('全部'); }}
              className="mt-4 text-purple-500 text-sm font-bold underline"
            >
              查看全部作品
            </button>
          </div>
        )}

        {displayCount < filtered.length && (
          <div ref={sentinelRef} className="text-center py-8">
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-pink-100 text-sm text-gray-400 font-medium">
              <Palette size={16} />
              載入更多作品...
            </div>
          </div>
        )}

        {displayCount >= filtered.length && filtered.length > 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-pink-100 text-sm text-gray-400 font-medium">
              <Sparkles size={16} />
              已顯示全部作品
            </div>
          </div>
        )}

      </div>

      {/* Artwork Detail Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
              onClick={() => setSelectedArtwork(null)}
            />
            <motion.div
              className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-pink-50"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={() => setSelectedArtwork(null)}
                className="absolute top-3 right-3 z-20 bg-white bg-opacity-80 backdrop-blur rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all"
              >
                <X size={18} />
              </button>

              <div className="w-full bg-gray-50 flex items-center justify-center overflow-hidden" style={{ maxHeight: '65vh' }}>
                <ArtworkImage artwork={selectedArtwork} isFullSize={true} />
              </div>

              <div className="p-5">
                <h2 className="text-xl font-black text-gray-800 mb-3">{selectedArtwork.title}</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-12">作者</span>
                    <span className="text-sm font-bold text-gray-700">{selectedArtwork.student}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-12">班別</span>
                    <span className={'text-sm font-bold bg-gradient-to-r ' + currentArtworkInfo?.color + ' bg-clip-text text-transparent'}>
                      {selectedArtwork.class}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-12">主題</span>
                    <span className="text-sm font-bold text-gray-700">
                      {currentArtworkInfo?.emoji} {currentArtworkInfo?.label}
                    </span>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-pink-100 text-center">
                  <p className="text-xs text-gray-400">🌟 每一件作品都是獨一無二的創作 🌟</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-8 py-6 text-center border-t border-pink-100 bg-white bg-opacity-50">
        <p className="text-sm text-gray-400">🎨 沙田公立學校 · 學生藝術作品展覽</p>
        <p className="text-xs text-gray-300 mt-1">每一位同學都是小小藝術家 ✨</p>
      </footer>
    </div>
  );
}
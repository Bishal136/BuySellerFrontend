import { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import hero1 from '../../assets/hero-1.jpg';
import hero2 from '../../assets/hero-2.jpg';
import hero3 from '../../assets/hero-3.jpg';

const SLIDES = [
  {
    id: 1,
    // title: 'Summer Sale 2024',
    // subtitle: 'Up to 50% Off',
    // description: 'Shop the latest summer collection with exclusive discounts',
    image: hero1,
    // cta: 'Shop Now',
    // link: '/products',
    // color: 'from-primary-600 to-primary-800',
  },
  {
    // id: 2,
    // title: 'New Arrivals',
    // subtitle: 'Fresh Collection',
    // description: 'Discover the newest trends and styles',
    image: hero2,
    // cta: 'Explore Now',
    // link: '/products?sort=newest',
    // color: 'from-purple-600 to-purple-800',
  },
  {
    id: 3,
    // title: 'Electronics Sale',
    // subtitle: 'Best Deals',
    // description: 'Latest gadgets at unbeatable prices',
    image: hero3,
    // cta: 'Buy Now',
    // link: '/products?category=electronics',
    // color: 'from-blue-600 to-blue-800',
  },
];

const AUTOPLAY_MS = 5000;
const TOTAL = SLIDES.length;

const fadeUp = (delay) => ({
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { delay, duration: 0.5 },
});

const Slide = memo(({ slide }) => (
  <motion.div
    key={slide.id}
    initial={{ opacity: 0, scale: 1.1 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.5 }}
    className="absolute inset-0"
  >
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${slide.image})` }}
    >
      <div className={`absolute inset-0 bg-linear-to-r ${slide.color} opacity-90`} />
    </div>

    <div className="relative h-full flex items-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-2xl"
        >
          <motion.p {...fadeUp(0.3)} className="text-white text-lg md:text-xl mb-2 font-medium">
            {slide.subtitle}
          </motion.p>
          <motion.h1
            {...fadeUp(0.4)}
            className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
          >
            {slide.title}
          </motion.h1>
          <motion.p {...fadeUp(0.5)} className="text-white text-lg mb-8 drop-shadow">
            {slide.description}
          </motion.p>
          <motion.div {...fadeUp(0.6)}>
            <Link
              to={slide.link}
              className="inline-flex items-center bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {slide.cta}
              <FiChevronRight className="ml-2" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </motion.div>
));

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((i) => setCurrent((i + TOTAL) % TOTAL), []);
  const next = useCallback(() => setCurrent((p) => (p + 1) % TOTAL), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + TOTAL) % TOTAL), []);

  useEffect(() => {
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [next, current]);

  return (
    <div className="mx-2 rounded-2xl relative overflow-hidden h-50 md:h-150 md:mx-20 md:rounded-xl shadow-lg">
      <AnimatePresence mode="wait">
        <Slide slide={SLIDES[current]} />
      </AnimatePresence>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
        aria-label="Previous slide"
      >
        <FiChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
        aria-label="Next slide"
      >
        <FiChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${current === i ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70 w-2'
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;

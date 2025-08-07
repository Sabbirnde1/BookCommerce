import { useState, useEffect, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "@/integrations/supabase/client";

// Local fallback images (optional if Supabase fails)
import heroBanner1 from "@/assets/hero-banner-1.jpg";
import heroBanner2 from "@/assets/hero-banner-2.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";

// Slide interface
interface HeroSlide {
  id: string | number;
  image: string;
  alt: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
}

// Manual fallback slides
const manualSlides: HeroSlide[] = [
  {
    id: 1,
    image: heroBanner1,
    alt: "DIU Students Free Thursday Delivery",
    title: "Exclusive for DIU Students",
    subtitle: "FREE Thursday Delivery!",
    cta: "Shop Now",
    link: "/books",
  },
  {
    id: 2,
    image: heroBanner2,
    alt: "Flash Sale - Up to 50% OFF",
    title: "Flash Sale",
    subtitle: "Get up to 50% OFF",
    cta: "Shop Sale",
    link: "/books",
  },
  {
    id: 3,
    image: heroBanner3,
    alt: "Request Any Book - We'll Find It",
    title: "Can't Find Your Book?",
    subtitle: "We'll find it for you!",
    cta: "Request Book",
    link: "/request",
  },
];

const HeroSlider = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const [autoplay] = useState(
    Autoplay({
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  // Fetch slides from Supabase
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const { data, error } = await supabase
          .from("hero_images")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedSlides: HeroSlide[] = data.map((item) => ({
            id: item.id,
            image: item.image_url,
            alt: item.alt || "",
            title: item.title || "",
            subtitle: item.subtitle || "",
            cta: item.cta || "Learn More",
            link: item.link || "/",
          }));

          setSlides(mappedSlides);
        } else {
          setSlides(manualSlides);
        }
      } catch (error) {
        console.error("Error fetching hero images:", error);
        setSlides(manualSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

  // Handle carousel change
  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Toggle autoplay
  const toggleAutoplay = useCallback(() => {
    if (!autoplay) return;
    isPlaying ? autoplay.stop() : autoplay.play();
    setIsPlaying(!isPlaying);
  }, [autoplay, isPlaying]);

  if (loading) return null;

  return (
    <section className="relative group">
      <Carousel
        setApi={setApi}
        className="w-full"
        plugins={[autoplay]}
        opts={{ align: "start", loop: true }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative aspect-[16/6] md:aspect-[16/5] lg:aspect-[16/4] w-full overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="absolute inset-0 w-full h-full object-cover object-center scale-110 transition-transform duration-[8000ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <CarouselPrevious className="h-12 w-12 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/20 shadow-xl hover:scale-110 transition-all duration-300">
            <ChevronLeft className="h-6 w-6" />
          </CarouselPrevious>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <CarouselNext className="h-12 w-12 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/20 shadow-xl hover:scale-110 transition-all duration-300">
            <ChevronRight className="h-6 w-6" />
          </CarouselNext>
        </div>

        {/* Play/Pause */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleAutoplay}
            className="h-10 w-10 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/20 shadow-lg"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </Carousel>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current ? "w-8 bg-white shadow-lg" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${((current + 1) / slides.length) * 100}%` }}
        />
      </div>
    </section>
  );
};

export default HeroSlider;

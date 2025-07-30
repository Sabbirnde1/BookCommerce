import { useState, useEffect, useCallback } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

const HeroSlider = () => {
  const slides = [
    {
      id: 1,
      image: "/lovable-uploads/e35704ff-fe32-4020-bca1-f7ad00e8e207.png",
      alt: "DIU Students Free Thursday Delivery",
      title: "Exclusive for DIU Students",
      subtitle: "FREE Thursday Delivery!",
      cta: "Shop Now",
      link: "/books"
    },
    {
      id: 2,
      image: "/lovable-uploads/cb0336a4-da1a-44e0-9755-95d34a95ac56.png",
      alt: "Flash Sale - Up to 50% OFF",
      title: "Flash Sale",
      subtitle: "Get up to 50% OFF",
      cta: "Shop Sale",
      link: "/books"
    },
    {
      id: 3,
      image: "/lovable-uploads/453ee6b9-c919-40ff-9c39-d75c07df2fa6.png",
      alt: "Request Any Book - We'll Find It",
      title: "Can't Find Your Book?",
      subtitle: "We'll find it for you!",
      cta: "Request Book",
      link: "/request"
    }
  ];

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

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const toggleAutoplay = useCallback(() => {
    if (!autoplay) return;
    
    if (isPlaying) {
      autoplay.stop();
    } else {
      autoplay.play();
    }
    setIsPlaying(!isPlaying);
  }, [autoplay, isPlaying]);

  return (
    <section className="relative group">
      <Carousel
        setApi={setApi}
        className="w-full"
        plugins={[autoplay]}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id}>
              <div className="relative aspect-[16/6] md:aspect-[16/5] lg:aspect-[16/4] w-full overflow-hidden">
                {/* Background Image with Parallax Effect */}
                <div className="absolute inset-0 scale-110 transition-transform duration-[8000ms] ease-out">
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                
                {/* Slide Content Overlay - Hidden for now as the images already have text */}
                {/* <div className="absolute inset-0 flex items-center justify-center md:justify-start">
                  <div className="container mx-auto px-4 md:px-8">
                    <div className="max-w-lg text-center md:text-left text-white">
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in">
                        {slide.title}
                      </h2>
                      <p className="text-lg md:text-xl mb-6 animate-fade-in">
                        {slide.subtitle}
                      </p>
                      <Button 
                        size="lg" 
                        variant="hero" 
                        className="animate-fade-in shadow-xl" 
                        asChild
                      >
                        <Link to={slide.link}>
                          {slide.cta}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div> */}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Custom Navigation Buttons */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <CarouselPrevious className="h-12 w-12 bg-white/10 backdrop-blur-md hover:bg-white/20 border-white/20 text-white shadow-xl hover:scale-110 transition-all duration-300">
            <ChevronLeft className="h-6 w-6" />
          </CarouselPrevious>
        </div>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <CarouselNext className="h-12 w-12 bg-white/10 backdrop-blur-md hover:bg-white/20 border-white/20 text-white shadow-xl hover:scale-110 transition-all duration-300">
            <ChevronRight className="h-6 w-6" />
          </CarouselNext>
        </div>

        {/* Play/Pause Button */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleAutoplay}
            className="h-10 w-10 bg-white/10 backdrop-blur-md hover:bg-white/20 border-white/20 text-white shadow-lg"
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
              index === current 
                ? "w-8 bg-white shadow-lg" 
                : "w-2 bg-white/50 hover:bg-white/80"
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
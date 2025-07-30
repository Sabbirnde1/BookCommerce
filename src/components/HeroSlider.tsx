import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";

const HeroSlider = () => {
  const slides = [
    {
      id: 1,
      image: "/lovable-uploads/e35704ff-fe32-4020-bca1-f7ad00e8e207.png",
      alt: "DIU Students Free Thursday Delivery"
    },
    {
      id: 2,
      image: "/lovable-uploads/cb0336a4-da1a-44e0-9755-95d34a95ac56.png",
      alt: "Flash Sale - Up to 50% OFF"
    },
    {
      id: 3,
      image: "/lovable-uploads/453ee6b9-c919-40ff-9c39-d75c07df2fa6.png",
      alt: "Request Any Book - We'll Find It"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <section className="relative">
      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative aspect-[16/6] md:aspect-[16/5] lg:aspect-[16/4] w-full overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-lg" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-lg" />
      </Carousel>
    </section>
  );
};

export default HeroSlider;
'use client'
import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Page } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CarouselHero: React.FC<Page['hero']> = ({ slides }) => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ])

  if (!slides || slides.length === 0) return null

  return (
    <section className="relative w-full overflow-hidden ">
      <div ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, i) => (
            <div className="relative flex-[0_0_100%] min-w-0" key={i}>

              {/* Контейнер картинки: flex + justify-center возвращают центрирование */}
              <div className="w-full flex justify-center items-center overflow-hidden">
                {slide.media && typeof slide.media === 'object' && (
                  <Media
                    resource={slide.media}
                    // w-auto + max-w-full позволяют картинке быть своего размера,
                    // но не вылезать за края. h-auto сохраняет пропорции.
                    className="w-auto h-auto max-w-full max-h-[95vh] object-contain"
                    priority={i === 0}
                  />
                )}
              </div>

              {/* Контент поверх (RichText и ссылки) */}
              {(slide.richText || (slide.links && slide.links.length > 0)) && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                  <div className="max-w-[52rem] mx-auto text-center text-white">
                    {slide.richText && (
                      <div className="drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        <RichText data={slide.richText} enableGutter={false} />
                      </div>
                    )}

                    {slide.links && slide.links.length > 0 && (
                      <div className="flex justify-center gap-4 mt-8 flex-wrap">
                        {slide.links.map(({ link }, idx) => (
                          <CMSLink key={idx} {...link} className="shadow-2xl" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

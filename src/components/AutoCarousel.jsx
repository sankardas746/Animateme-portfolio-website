import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

const AutoCarousel = ({ items, renderItem, slidesPerView = 3 }) => {
  return (
    <Swiper
      spaceBetween={30}
      slidesPerView={1}
      loop={true}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
        dynamicBullets: true,
      }}
      navigation={true}
      modules={[Autoplay, Pagination, Navigation]}
      className="mySwiper w-full"
      breakpoints={{
        640: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: slidesPerView,
          spaceBetween: 30,
        },
      }}
    >
      {items.map((item, index) => (
        <SwiperSlide key={item.id || index} className="pb-12">
          {renderItem(item, index)}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default AutoCarousel;
import React from 'react'
import HeroSection from '../components/HeroSection'
import CategoriesSection from '../components/CategoriesSection'
import WhyChooseUs from '../components/WhyChooseUs'
import BestSellers from '../components/BestSellers'
import TrendingSection from '../components/TrendingSection'
import TestimonialSection from '../components/TestimonialSection'
import FeaturesBanner from '../components/FeaturesBanner'
import LifestyleSection from '../components/LifestyleSection'
import CustomizeTeaser from '../components/CustomizeTeaser'
import UGCGallery from '../components/UGCGallery'
import Newsletter from '../components/Newsletter'
import SEO from '../components/SEO';
import MobileHero from '../components/MobileHero'


const Home = () => {
  return (
    <>
      <SEO />
      <div className='w-full h-auto bg-white'>
       <div>

        {/* ── Mobile & Tablet Hero (visible on screens smaller than md) ── */}
        <div className='block md:hidden'>
          <MobileHero />
        </div>
        {/* ── Desktop Hero (visible on md screens and larger) ── */}
        <div className='hidden md:block'>
           {/* Hero section */}
           <HeroSection/>
         </div>
         <div className='hidden md:block'>
          {/* FeaturesBanner */}
          <FeaturesBanner/>
         </div>
         <div className='hidden md:block'>
           {/* Categories section */}
           <CategoriesSection/>
         </div>
         {/* BestSellers section */}
         <BestSellers/>
         {/* Lifestyle Section  */}
         <LifestyleSection/>
         {/* Trending Section  */}
         <TrendingSection />
         {/* WhyChooseUs section */}
         <WhyChooseUs/>
         {/* Customize Your Tumbler */}
         <CustomizeTeaser/>
         {/* UGC Gallery */}
         <UGCGallery/>
         {/* Testimonial Section  */}
         <TestimonialSection/>
         {/* News Letter section */}
         {/* <Newsletter/> */}
       </div>

      </div>
    </>
  )
}

export default Home
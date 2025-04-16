import React, { useState } from 'react';
const images = import.meta.glob("/src/assets/testimonials/*.{png,jpg,jpeg}", { eager: true });

const TestimonialCard = ({ name, title, batch, testimonial, imgSrc }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Truncate the testimonial if it's too long
  const isLongTestimonial = testimonial.length > 200;
  const truncatedText = isLongTestimonial && !expanded 
    ? testimonial.substring(0, 200) + '...' 
    : testimonial;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="p-6 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/4 flex justify-center">
          <div className="h-40 w-40 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <img 
              src={imgSrc || `/api/placeholder/150/150`} 
              alt={`${name}`} 
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        
        <div className="w-full md:w-3/4">
          <h3 className="text-xl font-bold text-gray-800">{name}</h3>
          <p className="text-sm font-medium text-blue-600">{title}</p>
          {batch && <p className="text-sm text-gray-500 mb-3">{batch}</p>}
          
          <p className="text-gray-700 mb-2">{truncatedText}</p>
          
          {isLongTestimonial && (
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="text-blue-500 font-medium hover:text-blue-700 text-sm"
            >
              {expanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Testimonial = () => {
  const testimonials = [
    {
      name: "Ravikumar PA",
      title: "Chief Engineer Burj Khalifa Civil",
      batch: "1986 Batch",
      testimonial: "My great institution, the Govt. College of Engineering Kannur, which stands out as the best in Malabar, not only creates technocrats but mould them to excel in their creativity also. Enriched with a fully devoted and accomplished team of faculty, along with its curriculum it acts as avery conductive ladder for the students in achieving their aspirations and also as a concrete pillar where they need support. It is overwhelming to mention the covetous evolution of this prestigious institution since its inception. I'm so honoured that I belong to the first batch (1986) of this esteemed organization. Though it was a 'real living' of years of us with limited facilities in the beginning when we started our journey from the noisy corridors of the Town High School Payyambalam, we can proudly pronounce now that it has only boosted our morale and poise.",
      imgSrc: images["/src/assets/testimonials/revikumar.png"]?.default
    },
    {
      name: "S. Harikishore IAS",
      title: "Executive Director, Kudumbasree, Govt. of Kerala",
      batch: "ME 2002 Batch",
      testimonial: "GCEK is the place from where we got the best of our college life. The campus and its ambience helped us to nurture our natural passion. The freedom provided by GCEK to all the students motivated us to explore the best of our abilities and encouraged us to chase our dreams. The best of GCEK is its ability to build friendship and camaraderie among all the students. I am sure that this tradition is continuing and the bondage is growing stronger through generations.",
      imgSrc: images["/src/assets/testimonials/harikishoreias.png"]?.default
    },
    {
      name: "Byju Raveendran",
      title: "Founder and CEO, BYJU'S The learning APP",
      batch: "ME 2000 Batch",
      testimonial: "GCEK gave me a holistic perspective on how to explore, aspire and work for the best in my life. My four years in GCEK armed me with an armoury of skills as well as with the clarity in how I approach my thoughts, career and life. I still fondly remember my eventful college days intertwined between classes and sports competitions. My journey at GCEK taught me how to perfect the balance of learning inside and outside the classroom. I wish all the best for my alma mater and proud of its fast journey towards gaining international reputation.",
      imgSrc: images["/src/assets/testimonials/byju.jpg"]?.default
    },
    {
      name: "Kiran R.",
      title: "Scientist Engineer, Liquid Propulsion Systems Centre, ISRO",
      batch: "ECE 2004 Batch",
      testimonial: "I am proud and privileged to be a GCEKian. The college made me what I am. The perfect blend of academics, co-curricular activities both technical as well as those relating to socio-political-cultural realms made me a man fit to live in the society. My campus made the ecosystem for all of us students to grow from a student to a responsible individual. It was a microcosm of the macrocosm.",
      imgSrc: images["/src/assets/testimonials/t1.png"]?.default
    },
    {
      name: "Mr Sheshagiri shenoy",
      title: "Founder Aayur Technology Solutions Pvt. Ltd",
      batch: "1986-1990 batch",
      testimonial: "I graduated from GCEK from the first batch. The formative years at the town campus interlinked with strikes for the infrastructure for the present campus and the dedicated and committed teaching and support staff has helped me to evolve as a soldier in the Navy first and now as an entrepreneur designing and manufacturing various electro mechanical systems for the Indian defense forces. Now 35 years down the lane it is great pride to understand and realise the achievements from our Alumni in various fields of technology, entrepreneurship and admistration. I wish my alma mater many many more glorious years ahead.",
      imgSrc: images["/src/assets/testimonials/sheshagiri.jpg"]?.default
    },
    {
      name: "Dr. Sudha U P V",
      title: "Scientist 'F', Aeronautical Development Agency",
      batch: "",
      testimonial: "I had a splendid experience as a student of Govt. College of Engineering, Kannur and proud to say that I belong to this wonderful family of GCEK. The values instilled in me by the institution carved me a better individual and made me to achieve my goals. Knowledge gained at GCEK is instrumental in shaping me as an efficient engineer. Right now I am placed as an Aerospace Scientist in Aeronautical Development Agency (ADA) - Bangalore, Under Ministry of Defence, Govt. of India. I am happy and proud that I am part of prestigious national programmes, Design and Development of Light Combat Aircraft (LCA-TEJAS) and Advanced Medium Combat Aircraft (AMCA) in ADA-Bangalore. Over the many years since its inception I have seen the college grow from strength to strength in all the areas of its operation. The dedicated and enthusiastic faculties have always kept the student's interests in mind and created an environment where learning is fun, intensive and industry oriented. I wish continued success to the college and current students who I am sure will find great careers in their chosen professional area.",
      imgSrc: images["/src/assets/testimonials/sudha.jpg"]?.default
    },
    {
      name: "Sanjay Prabhakaran",
      title: "Co-Founder, Asia Mentors Circle",
      batch: "Electronics & Communication, 1987 Batch",
      testimonial: "GCEK gave me the opportunity to hone my technical and leadership skills being the second batch of this college. The deep relationships built have lasted over three decades and the link with GCEK remains everlasting strong. The experience of setting up the IEEE chapter and representing the college in Quiz competitions helped me develop courage and confidence in building leadership attributes which allowed me to scale new heights in my corporate career of 30 years resulting in senior leadership roles and being the sole Asian on the executive committee.",
      imgSrc: images["/src/assets/testimonials/sanjay.jpg"]?.default
    },
    {
      name: "Sachin Raghuthaman",
      title: "Technical Expert - Engine Design, Mercedes-Benz Research & Development India",
      batch: "GCEK 1999-2003",
      testimonial: "Graduating as an engineer from GCEK gave me the right platform to pursue my passion in automotive design and I have been fortunate to be associated with brands like Safran, Renault and Mercedes-Benz in my years of design experience in the field. Being part of the GCEK family has been one of the key elements not only in establishing my basics in mechanical engineering, but also personally in making friends whom I'm very close to even now. I wish the future engineers from GCEK a wonderful career with loads of experience and also the very best to the teaching faculty for their continued motivation to nurture and develop young skilled professional engineers.",
      imgSrc: images["/src/assets/testimonials/sachin.jpg"]?.default
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-black">Alumni Testimonials</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard 
            key={index}
            name={testimonial.name}
            title={testimonial.title}
            batch={testimonial.batch}
            testimonial={testimonial.testimonial}
            imgSrc={testimonial.imgSrc}
          />
        ))}
      </div>
    </div>
  );
};

export default Testimonial;
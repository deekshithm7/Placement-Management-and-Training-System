import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const images = import.meta.glob("/src/assets/testimonials/*.{png,jpg,jpeg}", { eager: true });

const HomePage = () => {
  // Placement data from the screenshots
  const placementData = [
    { year: "2011-12", firms: 5, offers: 108, students: 99, ce: 4, me: 9, eee: 23, ece: 50, cse: 13, mtech: 0 },
    { year: "2012-13", firms: 1, offers: 45, students: 45, ce: 0, me: 9, eee: 11, ece: 16, cse: 9, mtech: 0 },
    { year: "2013-14", firms: 7, offers: 70, students: 64, ce: 9, me: 9, eee: 16, ece: 19, cse: 8, mtech: 4 },
    { year: "2014-15", firms: 10, offers: 107, students: 96, ce: 1, me: 13, eee: 19, ece: 36, cse: 24, mtech: 3 },
    { year: "2015-16", firms: 4, offers: 120, students: 114, ce: 5, me: 6, eee: 19, ece: 50, cse: 29, mtech: 5 },
    { year: "2016-17", firms: 12, offers: 74, students: 64, ce: 2, me: 7, eee: 8, ece: 20, cse: 22, mtech: 5 },
    { year: "2017-18", firms: 15, offers: 112, students: 81, ce: 0, me: 6, eee: 5, ece: 42, cse: 28, mtech: 1 },
    { year: "2018-19", firms: 24, offers: 186, students: 127, ce: 3, me: 20, eee: 21, ece: 37, cse: 41, mtech: 5 },
    { year: "2019-20", firms: 14, offers: 125, students: 89, ce: 2, me: 11, eee: 14, ece: 25, cse: 35, mtech: 2 },
    { year: "2020-21", firms: 34, offers: 226, students: 175, ce: 15, me: 22, eee: 20, ece: 66, cse: 45, mtech: 11 },
    { year: "2021-22", firms: 44, offers: 425, students: 214, ce: 25, me: 17, eee: 38, ece: 66, cse: 48, mtech: 20 },
    { year: "2022-23", firms: 20, offers: 272, students: 157, ce: 25, me: 24, eee: 25, ece: 39, cse: 41, mtech: 3 },
    { year: "2023-24", firms: 20, offers: 143, students: 105, ce: 22, me: 11, eee: 10, ece: 25, cse: 35, mtech: 2 },
  ];

  // Last 7 years data for the charts as shown in the screenshots
  const chartData = placementData.slice(-7);

  // Data for the companies chart
  const companiesChartData = chartData.map(item => ({
    year: item.year,
    firms: item.firms
  }));

  // Testimonials data
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

  // State for testimonial slider
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Handle testimonial navigation
  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">

      <section className="relative h-96 bg-gray-800 text-white flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-4xl font-bold mb-6">Shaping Careers, Building Futures</h1>
          <p className="text-xl max-w-3xl mx-auto">
            The Career Guidance and Placement Unit at GCEK is dedicated to bridging the gap between academia and industry, ensuring our students are well-prepared for professional success.
          </p>
        </div>
      </section>
      {/* About Section */}
      <section id="about" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-700 text-center mb-12 relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-yellow-500 after:mt-4 pb-4">About CGPU</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="mb-4">
              The Career Guidance and Placement Unit (CGPU) functioning in the College is entrusted with the responsibility of:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Guiding the students of GCEK to get placements in credible organizations. Conduct placement drives of various reputed companies and organizations.</li>
              <li>Conducting training, seminars, group discussions, and mock interviews as part of career guidance and personality development of the students.</li>
              <li>Coordinating the efforts of the students of various departments in arranging industrial training.</li>
              <li>Acting as an information center for students in job opportunities and competitive examinations like GATE, GRE, and CAT.</li>
              <li>Acting as a link between alumni and students</li>
            </ul>
            <p className="mb-4">
              The Career Guidance and Placement Unit (CGPU) of the college is headed by Placement Coordinator, who is a senior faculty member of the college. Assistant Placement Coordinator who is also a faculty member will assist the placement coordinator in day to day activities. The Cell has at least two student representatives from all classes, among whom student coordinators are elected for activities like placement drives, training, alumni interaction and the preparation of placement brochure.
            </p>
            <p>
              The Student Coordinators interact with the Placement Coordinator for the daily functioning of the Cell. Cell has a 125 seater AC seminar hall, 1000+ seater main auditorium and a capacity of about 600+ well connected computer systems with 1GBPS connectivity for conducting online tests.
            </p>
          </div>
        </div>
      </section>

      {/* Placement History Section */}
      <section id="placement" className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-700 text-center mb-12 relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-yellow-500 after:mt-4 pb-4">Placement History</h2>
          
          {/* Placement Chart - Last Five Years (as shown in screenshot) */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-10">
            <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">Placement History (Last Five Years)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="offers" name="Total Number of Offers from Companies" fill="#4285F4" />
                  <Bar dataKey="students" name="Total Number of Students" fill="#DB4437" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Recruiting Companies Chart (as shown in screenshot) */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-10">
            <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">Number of Recruiting Companies</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={companiesChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="firms" name="Number of firms" fill="#4285F4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Placement Data Table */}
          <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">Placement Data</h3>
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="py-3 px-4 border">Academic Year</th>
                  <th className="py-3 px-4 border">Number of Firms</th>
                  <th className="py-3 px-4 border">Total Number of Offers</th>
                  <th className="py-3 px-4 border">Total Number of Students</th>
                  <th className="py-3 px-4 border">CE</th>
                  <th className="py-3 px-4 border">ME</th>
                  <th className="py-3 px-4 border">EEE</th>
                  <th className="py-3 px-4 border">ECE</th>
                  <th className="py-3 px-4 border">CSE</th>
                  <th className="py-3 px-4 border">M.Tech</th>
                </tr>
              </thead>
              <tbody>
                {placementData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4 border">{row.year}</td>
                    <td className="py-3 px-4 border text-center">{row.firms}</td>
                    <td className="py-3 px-4 border text-center">{row.offers}</td>
                    <td className="py-3 px-4 border text-center">{row.students}</td>
                    <td className="py-3 px-4 border text-center">{row.ce}</td>
                    <td className="py-3 px-4 border text-center">{row.me}</td>
                    <td className="py-3 px-4 border text-center">{row.eee}</td>
                    <td className="py-3 px-4 border text-center">{row.ece}</td>
                    <td className="py-3 px-4 border text-center">{row.cse}</td>
                    <td className="py-3 px-4 border text-center">{row.mtech}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials Section with Slider */}
      <section id="testimonials" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-700 text-center mb-12 relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-yellow-500 after:mt-4 pb-4">Testimonials</h2>
          
          <div className="max-w-4xl mx-auto relative">
            {/* Testimonial Slider */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="italic text-gray-600 mb-6">
                {testimonials[currentTestimonial].testimonial}
              </div>
              <div className="flex items-center">
                <img
                  src={testimonials[currentTestimonial].imgSrc}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-bold text-lg">{testimonials[currentTestimonial].name}</h4>
                  <p className="text-gray-600">{testimonials[currentTestimonial].title}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <button 
                onClick={prevTestimonial}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full shadow transition duration-300"
                aria-label="Previous testimonial"
              >
                ←
              </button>
              <div className="flex space-x-2 items-center">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full ${currentTestimonial === index ? 'bg-yellow-500' : 'bg-gray-300'}`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              <button 
                onClick={nextTestimonial}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full shadow transition duration-300"
                aria-label="Next testimonial"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
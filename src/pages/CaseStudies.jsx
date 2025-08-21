import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Lightbulb, CheckCircle, Wrench as Tool, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import ReactPlayer from 'react-player/youtube';
import { supabase } from '@/lib/customSupabaseClient';

const CaseStudies = () => {
  const { settings, isInitialized } = useAppSettings();
  const [caseStudies, setCaseStudies] = useState([]);
  const [pageContent, setPageContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaseStudies = async () => {
      const { data, error } = await supabase.from('case_studies').select('*');
      if (error) {
        console.error('Error fetching case studies:', error);
      } else {
        setCaseStudies(data || []);
      }
      setLoading(false);
    };

    if (isInitialized) {
      setPageContent(settings.content?.caseStudies || {});
      fetchCaseStudies();
    }
  }, [isInitialized, settings.content]);

  const { 
    title = 'Success Stories', 
    subtitle = 'See How We Transform Ideas into Reality',
    cta_title = 'Ready to Create Your Success Story?',
    cta_subtitle = 'Let\'s discuss your project and create a case study that showcases your success.',
    cta_button = 'Start Your Project'
  } = pageContent || {};

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    let videoId;
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    } else {
      return null;
    }
    return videoId;
  };

  const getThumbnailUrl = (item) => {
    if (item.image) return item.image;
    const videoId = getYoutubeVideoId(item.video_url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return "https://placehold.co/500x300/e2e8f0/e2e8f0?text=Video+Coming+Soon";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{title} - {settings.global?.siteName || 'Animate Me'}</title>
        <meta name="description" content={subtitle} />
      </Helmet>

      <div>
        <section className="py-20 bg-gradient-to-r from-purple-600 to-yellow-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white">{title}</h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">{subtitle}</p>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-24">
              {caseStudies.map((study, index) => (
                <motion.div
                  key={study.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-purple-50 to-yellow-50 rounded-3xl p-8 md:p-12 shadow-lg"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        {study.client_logo && <img src={study.client_logo} alt={`${study.client} logo`} className="h-12 w-12 object-contain bg-white p-1 rounded-full shadow-md" />}
                        <div>
                          <h2 className="text-3xl font-bold text-gray-800">{study.title}</h2>
                          <p className="text-purple-600 font-semibold">{study.client}</p>
                        </div>
                      </div>
                      <p className="text-gray-600">{study.description}</p>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Target className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-bold text-gray-800">Challenge</h3>
                            <p className="text-gray-600">{study.challenge}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-bold text-gray-800">Solution</h3>
                            <p className="text-gray-600">{study.solution}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-bold text-gray-800">Result</h3>
                            <p className="text-gray-600">{study.result}</p>
                          </div>
                        </div>
                      </div>

                      {study.tools && 
                        <div>
                          <h4 className="font-bold text-gray-800 mb-2 flex items-center"><Tool className="w-5 h-5 mr-2 text-purple-600" /> Tools Used</h4>
                          <div className="flex flex-wrap gap-2">
                            {study.tools.split(',').map((tool, idx) => (
                              <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                                {tool.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      }
                    </div>

                    <div className="space-y-6">
                      <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                        {study.video_url ? (
                          <ReactPlayer
                            url={study.video_url}
                            width="100%"
                            height="100%"
                            controls={true}
                            light={getThumbnailUrl(study)}
                            playing
                            playIcon={<Youtube className="w-16 h-16 text-white/80 hover:text-white transition-colors" />}
                          />
                        ) : (
                          <img src={getThumbnailUrl(study)} alt={study.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-r from-purple-600 to-yellow-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                {cta_title}
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {cta_subtitle}
              </p>
              <Link to="/contact">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg">
                  {cta_button}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CaseStudies;
import { Card, CardContent } from '@/components/ui/card';

interface TestimonialProps {
  name: string;
  title: string;
  quote: string;
  initials: string;
}

const TestimonialCard = ({ name, title, quote, initials }: TestimonialProps) => (
  <Card className="bg-black border border-primary/30 h-full shadow-lg">
    <CardContent className="p-6 flex flex-col h-full">
      {/* Quote */}
      <div className="flex-1 mb-6">
        <p className="text-lg text-white/90 leading-relaxed italic">
          "{quote}"
        </p>
      </div>
      
      {/* Attribution */}
      <div className="flex items-center gap-4">
        {/* Initials Circle */}
        <div className="w-12 h-12 bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-bold text-sm">{initials}</span>
        </div>
        
        {/* Name and Title */}
        <div>
          <div className="font-semibold text-white" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            {name}
          </div>
          <div className="text-sm text-white/70">
            {title}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Nick Estevez",
      title: "Young Business Professional, Married",
      quote: "The AM Project gave me a clear roadmap when I felt aimless. I didn't need another 'guru'—I needed something real. This gave me tools I could actually use.",
      initials: "NE"
    },
    {
      name: "Ruben Galvan", 
      title: "Fire Chief, Husband, Father",
      quote: "As a leader at work and a dad at home, I needed to be grounded. The AM Project helped me rebuild that foundation—quietly, without hype, just results.",
      initials: "RG"
    },
    {
      name: "Cory Eckles",
      title: "Father & Husband", 
      quote: "This wasn't about motivation. It was about responsibility. AM helped me reconnect with my purpose—and show up consistently for my daughter.",
      initials: "CE"
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative elements - matching philosophy section */}
      <div className="absolute -left-20 top-1/2 w-40 h-40 bg-accent/20 rounded-full z-0"></div>
      <div className="absolute right-0 bottom-0 w-80 h-80 bg-accent/25 rounded-full blur-3xl z-0"></div>
      {/* Additional decorative elements for better visibility */}
      <div className="absolute right-1/4 top-1/4 w-32 h-32 bg-primary/5 rounded-full blur-2xl z-0"></div>
      
      <div className="container relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="h-0.5 bg-primary w-16"></div>
              <h2 className="text-3xl md:text-4xl font-bold px-4 text-gray-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                Real Men. Real Results.
              </h2>
              <div className="h-0.5 bg-primary w-16"></div>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Men who chose responsibility over comfort—and built the life they wanted.
            </p>
          </div>
          
          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={testimonial.name}
                title={testimonial.title}
                quote={testimonial.quote}
                initials={testimonial.initials}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
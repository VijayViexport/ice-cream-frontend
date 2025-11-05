import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = document.querySelectorAll('.fade-in');
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          section.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Professional B2B Header with Sticky Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md border-b border-gray-100'
          : 'bg-white/95 backdrop-blur-lg'
      }`}>
        {/* Top Bar - Trust Indicators */}
        <div className={`border-b border-gray-100 transition-all duration-300 ${scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between py-2 text-sm">
              <div className="flex items-center space-x-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="hidden sm:inline font-medium">Trusted by 500+ Businesses</span>
                  <span className="sm:hidden font-medium">500+ Businesses</span>
                </div>
                <div className="hidden md:flex items-center space-x-1">
                  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <span className="font-semibold text-gray-900">4.9</span>
                  <span className="text-gray-500">(2.3k reviews)</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a href="tel:+911234567890" className="hidden sm:flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span className="font-medium">+91 123 456 7890</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo with Tagline */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur"></div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-2xl sm:text-3xl">🍦</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold font-display bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                  ICE
                </span>
                <span className="text-xs text-gray-500 font-medium hidden sm:block">Premium B2B Wholesale</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <a href="#features" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                Features
              </a>
              <a href="#pricing" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                Pricing
              </a>
              <a href="#about" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                About Us
              </a>
              <div className="w-px h-6 bg-gray-200 mx-2"></div>
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all touch-manipulation"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Enhanced */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
              >
                Pricing
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
              >
                About Us
              </a>
              <div className="border-t border-gray-100 my-2"></div>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Login to Account
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3.5 text-base font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-white text-center rounded-lg hover:shadow-lg transition-all"
              >
                Get Started Free →
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-pink-50">
          <div className="absolute top-20 left-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-in-left">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">Trusted by 500+ Businesses</span>
            </div>

            <h1 className="text-hero font-extrabold font-display text-gray-900 leading-tight">
              Premium Ice Cream
              <span className="block mt-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Factory Direct
              </span>
            </h1>

            <p className="text-lead text-gray-600 leading-relaxed max-w-lg">
              Wholesale ice cream at unbeatable prices. Same-day delivery. Save up to 35%.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link to="/register" className="text-button px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-center rounded-full font-bold hover:shadow-2xl transform hover:scale-105 transition-all">
                Order Now →
              </Link>
              <Link to="/login" className="text-button px-6 sm:px-8 py-3.5 sm:py-4 border-2 border-gray-200 text-gray-800 text-center rounded-full font-bold hover:border-orange-300 transition-all">
                View Products
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-8">
              <div>
                <div className="text-stat text-orange-600">500+</div>
                <div className="text-body-sm text-gray-600">Businesses</div>
              </div>
              <div>
                <div className="text-stat text-orange-600">35%</div>
                <div className="text-body-sm text-gray-600">Avg Savings</div>
              </div>
              <div>
                <div className="text-stat text-orange-600">4.9★</div>
                <div className="text-body-sm text-gray-600">Rating</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-slide-in-right">
            <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=1000&fit=crop"
                alt="Premium Ice Cream"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl animate-float">
              <div className="text-caption text-gray-600">Starting at</div>
              <div className="text-price text-orange-600">₹45/L</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section className="py-24 bg-white fade-in">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-page-title font-display text-gray-900 mb-4">Our Flavors</h2>
            <p className="text-lead text-gray-600 leading-relaxed">Premium quality, endless variety</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Vanilla Bean', img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=500&fit=crop', price: '₹45' },
              { name: 'Chocolate', img: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400&h=500&fit=crop', price: '₹48' },
              { name: 'Strawberry', img: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=500&fit=crop', price: '₹50' },
              { name: 'Mango', img: 'https://images.unsplash.com/photo-1582487427288-3edaa2974ddc?w=400&h=500&fit=crop', price: '₹52' },
              { name: 'Mint Chip', img: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=400&h=500&fit=crop', price: '₹55' },
              { name: 'Butterscotch', img: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=500&fit=crop', price: '₹48' },
              { name: 'Cookies & Cream', img: 'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=400&h=500&fit=crop', price: '₹58' },
              { name: 'Kesar Pista', img: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400&h=500&fit=crop', price: '₹65' }
            ].map((item, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl bg-gray-100 aspect-[4/5] hover:shadow-2xl transition-all duration-500 cursor-pointer">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-card-title font-semibold mb-1">{item.name}</h3>
                  <p className="text-price text-orange-400">{item.price}/L</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/login" className="inline-flex items-center space-x-2 text-button text-orange-600 hover:text-orange-700 font-bold group">
              <span>View All Products</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-white to-orange-50 fade-in">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-page-title font-display text-gray-900 mb-4">Simple Process</h2>
            <p className="text-lead text-gray-600 leading-relaxed">Start ordering in 3 easy steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-1 bg-gradient-to-r from-orange-300 to-pink-300"></div>

            {[
              { step: '01', title: 'Register', desc: 'Create your account in 2 minutes', icon: '📝' },
              { step: '02', title: 'Browse & Order', desc: 'Select products and place order', icon: '🛒' },
              { step: '03', title: 'Receive', desc: 'Get delivery at your doorstep', icon: '🚚' }
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-5xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <div className="text-badge font-bold text-orange-600 mb-2">{item.step}</div>
                <h3 className="text-subsection-heading font-display font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-body text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/register" className="text-button px-10 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full font-bold hover:shadow-2xl transform hover:scale-105 transition-all">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white fade-in">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-page-title font-display font-bold text-gray-900">What Businesses Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Rajesh Kumar', business: 'Sweet Cafe, Mumbai', rating: 5, text: 'Quality is exceptional. Saved ₹45,000 in first quarter!' },
              { name: 'Priya Sharma', business: 'Beach Resort, Goa', rating: 5, text: 'Easy platform, real-time tracking. Game changer!' },
              { name: 'Amit Patel', business: 'Supermart, Ahmedabad', rating: 5, text: 'Sales increased by 40% since we partnered!' }
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-orange-50 to-pink-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(item.rating)].map((_, j) => (
                    <span key={j} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-body text-gray-700 leading-relaxed mb-6 italic">"{item.text}"</p>
                <div>
                  <div className="text-base font-bold text-gray-900">{item.name}</div>
                  <div className="text-body-sm text-gray-600">{item.business}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 relative overflow-hidden fade-in">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 border-4 border-white rounded-full"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-page-title md:text-5xl lg:text-6xl font-display font-extrabold mb-6">
            Ready to Start Saving?
          </h2>
          <p className="text-lead md:text-2xl leading-relaxed mb-12 text-white/90">
            Join 500+ businesses ordering directly from us
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="text-button px-12 py-5 bg-white text-orange-600 rounded-full font-bold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-2xl">
              Create Account →
            </Link>
            <Link to="/login" className="text-button px-12 py-5 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all">
              Sign In
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-8 mt-12 text-white/80">
            <div className="flex items-center space-x-2 text-body-sm">
              <span>✓</span>
              <span>No credit card</span>
            </div>
            <div className="flex items-center space-x-2 text-body-sm">
              <span>✓</span>
              <span>Instant activation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-3xl">🍦</span>
                <span className="text-2xl font-display font-bold">ICE</span>
              </div>
              <p className="text-body-sm text-gray-400">Premium wholesale ice cream platform</p>
            </div>

            <div>
              <h4 className="text-base font-bold mb-4">Quick Links</h4>
              <div className="space-y-2 text-body-sm">
                <div><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Products</Link></div>
                <div><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></div>
                <div><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Track Order</Link></div>
              </div>
            </div>

            <div>
              <h4 className="text-base font-bold mb-4">Support</h4>
              <div className="space-y-2 text-body-sm text-gray-400">
                <div>Help Center</div>
                <div>Contact Us</div>
                <div>FAQs</div>
              </div>
            </div>

            <div>
              <h4 className="text-base font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-body-sm text-gray-400">
                <div>support@ice.com</div>
                <div>+91 98765 43210</div>
                <div>Mon-Sat: 8AM - 8PM</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-wrap items-center justify-between text-body-sm text-gray-400">
            <p>&copy; 2025 ICE. All rights reserved.</p>
            <div className="flex items-center space-x-6 text-body-sm">
              <span className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>FSSAI Certified</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="text-yellow-400">★</span>
                <span>4.9/5 Rating</span>
              </span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }

        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 8s ease-in-out 2s infinite;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }

        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}

export default HomePage;

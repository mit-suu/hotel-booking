import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">FBooking</h3>
            <p className="text-gray-400 mb-4">
              The leading hotel booking platform in Vietnam, providing high-quality booking services with great discounts.
            </p>
            <div className="flex space-x-3">
              <SocialIcon icon={<Facebook size={18} />} />
              <SocialIcon icon={<Instagram size={18} />} />
              <SocialIcon icon={<Twitter size={18} />} />
              <SocialIcon icon={<Youtube size={18} />} />
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <FooterLink text="Home" />
              <FooterLink text="Find Hotels" />
              <FooterLink text="Special Offers" />
              <FooterLink text="About" />
              <FooterLink text="Contact" />
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-3">
              <FooterLink text="Help Center" />
              <FooterLink text="FAQ" />
              <FooterLink text="Privacy Policy" />
              <FooterLink text="Terms of Service" />
              <FooterLink text="Refund Policy" />
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-3 mt-1 text-blue-400" />
                <span className="text-gray-400">123 Nguyen Hue, District 1, Ho Chi Minh City</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 text-blue-400" />
                <span className="text-gray-400">+84 123 456 789</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-3 text-blue-400" />
                <span className="text-gray-400">contact@fbooking.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        
        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} FBooking. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink: React.FC<{ text: string }> = ({ text }) => (
  <li>
    <a href="#" className="text-gray-400 hover:text-white transition-colors">
      {text}
    </a>
  </li>
);

const SocialIcon: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <a href="#" className="bg-gray-800 hover:bg-blue-600 transition-colors p-2 rounded-full">
    {icon}
  </a>
);

export default Footer;

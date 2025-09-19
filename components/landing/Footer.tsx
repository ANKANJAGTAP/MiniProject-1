import Link from 'next/link';
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-green-500 rounded-lg p-2 mr-3">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-400">TurfBook</h1>
                <p className="text-xs text-gray-400">Sangli & Miraj</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The first centralized platform for booking sports turfs in Sangli and Miraj region.
              Making sports more accessible for everyone.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-green-400">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/browse" className="text-gray-400 hover:text-white transition-colors">Browse Turfs</Link></li>
              <li><Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-green-400">For Business</h4>
            <ul className="space-y-3">
              <li><Link href="/owner/register" className="text-gray-400 hover:text-white transition-colors">List Your Turf</Link></li>
              <li><Link href="/owner/dashboard" className="text-gray-400 hover:text-white transition-colors">Owner Dashboard</Link></li>
              <li><Link href="/partner" className="text-gray-400 hover:text-white transition-colors">Become a Partner</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors">Business Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-green-400">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-3 text-green-400" />
                <span className="text-gray-400 text-sm">Sangli-Miraj, Maharashtra</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-green-400" />
                <span className="text-gray-400 text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-green-400" />
                <span className="text-gray-400 text-sm">support@turfbook.in</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 TurfBook. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/refund" className="text-gray-400 hover:text-white text-sm transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
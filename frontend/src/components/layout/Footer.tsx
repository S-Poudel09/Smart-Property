import Link from 'next/link';
import { Building2, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white mb-6">
                            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <span>SmartProperty</span>
                        </Link>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                            Nepal's premier digital real estate registry. We simplify complex transactions through verification, direct communication, and legal transparency.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="h-8 w-8 rounded-full border border-gray-800 flex items-center justify-center hover:bg-primary hover:border-primary transition-all"><Facebook className="h-4 w-4" /></a>
                            <a href="#" className="h-8 w-8 rounded-full border border-gray-800 flex items-center justify-center hover:bg-primary hover:border-primary transition-all"><Twitter className="h-4 w-4" /></a>
                            <a href="#" className="h-8 w-8 rounded-full border border-gray-800 flex items-center justify-center hover:bg-primary hover:border-primary transition-all"><Instagram className="h-4 w-4" /></a>
                            <a href="#" className="h-8 w-8 rounded-full border border-gray-800 flex items-center justify-center hover:bg-primary hover:border-primary transition-all"><Linkedin className="h-4 w-4" /></a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link href="/properties" className="hover:text-white transition-colors">Properties</Link></li>
                            <li><Link href="/auth/login" className="hover:text-white transition-colors">Login</Link></li>
                            <li><Link href="/auth/register" className="hover:text-white transition-colors">Register</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Services</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/dashboard/buyer" className="hover:text-white transition-colors">Buy Property</Link></li>
                            <li><Link href="/dashboard/seller" className="hover:text-white transition-colors">Sell Property</Link></li>
                            <li><Link href="/properties?type=rent" className="hover:text-white transition-colors">Rent Property</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Property Valuation</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                                <span>Kamaladi, Kathmandu, <br />Nepal</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-primary" />
                                <span>+977 1 4XXXXXX</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-primary" />
                                <span>hello@smartproperty.com.np</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500">
                        &copy; {new Date().getFullYear()} SmartProperty. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-xs text-gray-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

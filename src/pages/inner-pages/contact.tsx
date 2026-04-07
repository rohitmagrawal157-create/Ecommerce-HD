import { useEffect } from "react";
import { Link } from "react-router-dom";

import NavbarOne from "../../components/navbar/navbar-one";
import FooterOne from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";

import bg from '../../assets/img/shortcode/breadcumb.jpg'
import about from '../../assets/img/svg/about.svg'

import Aos from "aos";

export default function Contact() {
    useEffect(() => {
        Aos.init()
    }, [])

    return (
        <>
            <NavbarOne />

            {/* Breadcrumb */}
            <div className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70" style={{ backgroundImage: `url(${bg})` }}>
                <div className="text-center w-full">
                    <h2 className="text-white text-8 md:text-[40px] font-normal leading-none text-center">Contact Us</h2>
                    <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
                        <li><Link to="/">Home</Link></li>
                        <li>/</li>
                        <li className="text-primary">Contact</li>
                    </ul>
                </div>
            </div>

            {/* Contact Section */}
            <div className="s-pb-100 s-pt-100">
                <div className="container-fluid">
                    <div className="max-w-[1720px] mx-auto flex justify-between gap-8">
                        {/* Left Column - Contact Information */}
                        <div className="max-w-[894px] w-full hidden lg:block" data-aos="zoom-in">
                            <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-8 md:p-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <img src={about} className="size-12" alt="icon" />
                                    <h3 className="text-2xl font-semibold text-title dark:text-white">Infinity Print And Signage Industries</h3>
                                </div>
                                
                                <div className="space-y-6">
                                    {/* Office Address (Mumbai) */}
                                    <div className="flex gap-4">
                                        <div className="min-w-[40px] mt-1">
                                            <i className="fas fa-building text-primary text-xl"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-title dark:text-white mb-1">Office Address</h4>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                                17/A, First Floor, Jilani mansion, Kolsa street, Pydhonie,<br />
                                                Masjid Bunder, Mumbai - 400003
                                            </p>
                                        </div>
                                    </div>

                                    {/* Factory Address (Aurangabad) */}
                                    <div className="flex gap-4">
                                        <div className="min-w-[40px] mt-1">
                                            <i className="fas fa-industry text-primary text-xl"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-title dark:text-white mb-1">Factory Address</h4>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                                Beside Lupin Limited, Plot No.A-7/A-1, Chikalthana MIDC,<br />
                                                Ch. Sambhajinagar - 431006
                                            </p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex gap-4">
                                        <div className="min-w-[40px] mt-1">
                                            <i className="fas fa-phone-alt text-primary text-xl"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-title dark:text-white mb-1">Phone / WhatsApp</h4>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                <a href="tel:+918888314542" className="hover:text-primary transition">+91 88883 14542</a>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex gap-4">
                                        <div className="min-w-[40px] mt-1">
                                            <i className="fas fa-envelope text-primary text-xl"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-title dark:text-white mb-1">Email</h4>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                <a href="mailto:infinityprintandsignage@gmail.com" className="hover:text-primary transition break-all">
                                                    infinityprintandsignage@gmail.com
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Contact Form */}
                        <div className="max-w-[725px] w-full mx-auto lg:mx-0">
                            <div data-aos="fade-up">
                                <img src={about} className="size-16" alt="icon" />
                                <h3 className="leading-none font-medium mt-3 md:mt-6 text-2xl">Get in Touch</h3>
                                <p className="max-w-[474px] mt-3 md:mt-4 font-medium">
                                    We're here to address your inquiries, feedback, and partnership opportunities promptly and effectively.
                                </p>
                            </div>
                            <div className="mt-8" data-aos="fade-up" data-aos-delay="100">
                                <form>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
                                        <div>
                                            <label className="text-base md:text-lg text-title dark:text-white leading-none mb-2.5 block">Full Name</label>
                                            <input className="w-full h-12 md:h-14 bg-snow dark:bg-dark-secondary border border-[#E3E5E6] text-title dark:text-white focus:border-primary p-4 outline-none duration-300" type="text" placeholder="Enter your full name" />
                                        </div>
                                        <div>
                                            <label className="text-base md:text-lg text-title dark:text-white leading-none mb-2.5 block">Email</label>
                                            <input className="w-full h-12 md:h-14 bg-snow dark:bg-dark-secondary border border-[#E3E5E6] text-title dark:text-white focus:border-primary p-4 outline-none duration-300" type="email" placeholder="Enter your email address" />
                                        </div>
                                        <div>
                                            <label className="text-base md:text-lg text-title dark:text-white leading-none mb-2.5 block">Phone No.</label>
                                            <input className="w-full h-12 md:h-14 bg-snow dark:bg-dark-secondary border border-[#E3E5E6] text-title dark:text-white focus:border-primary p-4 outline-none duration-300" type="tel" placeholder="Type your phone number" />
                                        </div>
                                        <div>
                                            <label className="text-base md:text-lg text-title dark:text-white leading-none mb-2.5 block">Subject</label>
                                            <select className="w-full h-12 md:h-14 bg-snow dark:bg-dark-secondary border border-[#E3E5E6] text-slate-400 focus:border-primary p-4 outline-none duration-300">
                                                <option value="1">General Inquiry</option>
                                                <option value="2">Printing Services</option>
                                                <option value="3">Signage & Branding</option>
                                                <option value="4">Bulk Order</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:gap-6">
                                        <label className="text-base md:text-lg text-title dark:text-white leading-none mb-2.5 block">Your Message</label>
                                        <textarea className="w-full h-28 md:h-[170px] bg-snow dark:bg-dark-secondary border border-[#E3E5E6] text-title dark:text-white focus:border-primary p-4 outline-none duration-300" name="Message" placeholder="Type your message"></textarea>
                                    </div>
                                    <div className="mt-5">
                                        <button type="submit" className="btn btn-solid" data-text="Submit">
                                            <span>Submit</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section - Updated to show Mumbai Office */}
            <div className="s-pb-100" data-aos="fade-up">
                <div className="container-fluid">
                    <div className="max-w-[1720px] mx-auto">
                        <iframe 
                            className="w-full h-[400px] md:h-[600px]" 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.123456789012!2d72.829542!3d18.963387!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c8f2a8e5d5f7%3A0x9d13f699bdbf604a!2sInfinity%20Print%20And%20Signage%20Industries!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                            style={{ border: 0 }} 
                            title="Infinity Print And Signage Industries - Mumbai Office"
                            allowFullScreen 
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </div>

            <FooterOne />
            <ScrollToTop />
        </>
    )
}
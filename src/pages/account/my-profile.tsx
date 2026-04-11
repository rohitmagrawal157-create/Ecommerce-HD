// src/pages/MyProfile.tsx
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Aos from "aos";
import NavbarOne from "../../components/navbar/navbar-one";
import AccountTab from "../../components/account/account-tab";
import FooterOne from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";
import bg from '../../assets/img/shortcode/breadcumb.jpg';
import { LuMail, LuMapPin, LuPhoneCall, LuPencil, LuCheck, LuX, LuUpload, LuExternalLink } from "react-icons/lu";

// Brand gradient (same as Cart & ProductDetails)
const BRAND_GRADIENT = 'linear-gradient(135deg, #5B4FBE 0%, #E8314A 50%, #F97316 100%)';
// const BRAND_SOLID = '#5B4FBE';

const GradText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span
    className={className}
    style={{
      background: BRAND_GRADIENT,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      display: 'inline-block',
    }}
  >
    {children}
  </span>
);

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// Helpers
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => /^[\+]?[\d\s\-\(\)]{10,15}$/.test(phone);

export default function MyProfile() {
  useEffect(() => {
    Aos.init({ once: true, duration: 600 });
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setEditForm(parsed);
      } catch (e) {}
    }
  }, []);

  const [profile, setProfile] = useState({
    name: 'Kathlene Roser',
    role: 'Product Designer',
    bio: 'Passionate about creating beautiful, functional spaces. I believe every wall tells a story — and the right art transforms a house into a home. Lover of canvas paintings, ambient lighting, and everything that makes a space feel alive.',
    phone: '+111 - (1234 5678 99)',
    email: 'kathlene@furnixar.com',
    address: '23/A Lake Side, New Arizona, USA',
    avatar: null as string | null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  const handleEdit = () => {
    setEditForm(profile);
    setErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setErrors({});
  };

  const handleSave = () => {
    const newErrors: { email?: string; phone?: string } = {};
    if (!isValidEmail(editForm.email)) newErrors.email = 'Invalid email address';
    if (!isValidPhone(editForm.phone)) newErrors.phone = 'Invalid phone number';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setProfile(editForm);
    setIsEditing(false);
    if (avatarFile) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      reader.readAsDataURL(avatarFile);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const displayAvatar = avatarPreview || profile.avatar;

  return (
    <>
      <NavbarOne />

      {/* Breadcrumb */}
      <div
        className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="text-center w-full">
          <h2 className="text-white md:text-[40px] font-normal leading-none text-center">My Profile</h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
            <li><Link to="/">Home</Link></li>
            <li>/</li>
            <li><GradText>Profile</GradText></li>
          </ul>
        </div>
      </div>

      <div className="s-py-100">
        <div className="container-fluid">
          <div className="max-w-[1720px] mx-auto flex items-start gap-8 md:gap-12 2xl:gap-20 flex-col md:flex-row my-profile-navtab">
            {/* Sidebar */}
            <div className="w-full md:w-[200px] lg:w-[260px] flex-none" data-aos="fade-up" data-aos-delay="100">
              <AccountTab />
            </div>

            {/* Main Content */}
            <div className="w-full md:flex-1 overflow-auto" data-aos="fade-up" data-aos-delay="200">
              <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Banner */}
                <div
                  className="h-[100px] w-full relative"
                  // style={{ background: 'linear-gradient(135deg, #f3f1ff 0%, #fff1f3 50%, #fff7f0 100%)' }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: 'radial-gradient(#5B4FBE22 1px, transparent 10px)', backgroundSize: '24px 24px' }}
                  />
                </div>

                <div className="px-6 sm:px-8 pb-8">
                  {/* Avatar + Name + Edit Button */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-6">
                    <div className="flex items-end gap-4">
                      {/* Avatar */}
                      <div
                        className={`relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0 ${isEditing ? 'cursor-pointer' : ''}`}
                        onClick={() => isEditing && fileInputRef.current?.click()}
                      >
                        {displayAvatar ? (
                          <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-xl font-extrabold text-white"
                            style={{ background: BRAND_GRADIENT }}
                          >
                            {getInitials(profile.name)}
                          </div>
                        )}
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <LuUpload className="text-white" size={18} />
                          </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                      </div>

                      {/* Name & Role – Name is now very visible */}
                      <div className="pb-1">
                        {isEditing ? (
                          <div className="flex flex-col gap-1.5">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                              className="border border-gray-200 rounded-xl px-3 py-2 text-[18px] font-bold text-gray-900 outline-none focus:border-[#5B4FBE] transition w-full"
                            />
                            <input
                              type="text"
                              value={editForm.role}
                              onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                              className="border border-gray-200 rounded-xl px-3 py-2 text-[14px] text-gray-500 outline-none focus:border-[#5B4FBE] transition w-full"
                            />
                          </div>
                        ) : (
                          <>
                            {/* Full name – large, dark, bold */}
                            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                              {profile.name}
                            </h3>
                            {/* Role – gradient text */}
                            <p
                              className="text-[15px] font-semibold mt-1"
                              style={{
                                background: BRAND_GRADIENT,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                display: 'inline-block',
                              }}
                            >
                              {profile.role}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {!isEditing ? (
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold transition hover:opacity-90 self-start sm:self-auto"
                        style={{ background: BRAND_GRADIENT }}
                      >
                        <LuPencil size={14} /> Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2 self-start sm:self-auto">
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold"
                          style={{ background: BRAND_GRADIENT }}
                        >
                          <LuCheck size={14} /> Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-semibold hover:bg-gray-50 transition"
                        >
                          <LuX size={14} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="mb-6">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">About</span>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio}
                        onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-700 outline-none focus:border-[#5B4FBE] transition mt-2 resize-none"
                      />
                    ) : (
                      <p className="text-[14px] text-gray-600 leading-relaxed mt-2">{profile.bio}</p>
                    )}
                  </div>

                  <div className="h-px w-full mb-6 bg-gray-100" />

                  {/* Contact Info */}
                  <div className="grid sm:grid-cols-2 gap-5 mb-6">
                    {/* Phone */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#f3f1ff,#fff1f3)' }}>
                        <LuPhoneCall size={16} style={{ color: '#5B4FBE' }} />
                      </div>
                      <div className="flex-1">
                        <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">Phone</span>
                        {isEditing ? (
                          <>
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                              className={`w-full border rounded-xl px-3 py-2 text-[14px] font-medium text-gray-800 outline-none transition mt-1 ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#5B4FBE]'}`}
                            />
                            {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
                          </>
                        ) : (
                          <span className="text-[15px] font-semibold text-gray-800 block mt-1">{profile.phone}</span>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#fff1f3,#fff7f0)' }}>
                        <LuMail size={16} style={{ color: '#E8314A' }} />
                      </div>
                      <div className="flex-1">
                        <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">Email</span>
                        {isEditing ? (
                          <>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                              className={`w-full border rounded-xl px-3 py-2 text-[14px] font-medium text-gray-800 outline-none transition mt-1 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#5B4FBE]'}`}
                            />
                            {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
                          </>
                        ) : (
                          <span className="text-[15px] font-semibold text-gray-800 block mt-1">{profile.email}</span>
                        )}
                      </div>
                    </div>

                    {/* Address (full width) */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 sm:col-span-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#fff7f0,#f0fbff)' }}>
                        <LuMapPin size={16} style={{ color: '#F97316' }} />
                      </div>
                      <div className="flex-1">
                        <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">Address</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.address}
                            onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[14px] font-medium text-gray-800 outline-none focus:border-[#5B4FBE] transition mt-1"
                          />
                        ) : (
                          <span className="text-[15px] font-semibold text-gray-800 block mt-1">{profile.address}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full mb-5 bg-gray-100" />

                  {/* Quick Links */}
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: 'Change Password', href: '/account/change-password' },
                      { label: 'Order History', href: '/account/orders' },
                      { label: 'Manage Addresses', href: '/account/addresses' },
                    ].map(({ label, href }) => (
                      <Link
                        key={href}
                        to={href}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold border border-gray-200 text-gray-600 hover:border-[#5B4FBE] hover:text-[#5B4FBE] transition group"
                      >
                        {label}
                        <LuExternalLink size={12} className="opacity-50 group-hover:opacity-100 transition" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterOne />
      <ScrollToTop />
    </>
  );
}
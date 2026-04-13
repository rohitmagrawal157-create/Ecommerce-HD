// src/pages/EditAccount.tsx
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NavbarOne from '../../components/navbar/navbar-one';
import AccountTab from '../../components/account/account-tab';
import FooterOne from '../../components/footer/footer-one';
import ScrollToTop from '../../components/scroll-to-top';
import bg from '../../assets/img/shortcode/breadcumb.jpg';
import {
  LuUser, LuMail, LuPhone, LuMapPin, LuGlobe,
  LuFileText, LuBriefcase, LuSave, LuRefreshCw,
  LuCamera, LuShieldCheck
} from 'react-icons/lu';
import Aos from 'aos';

const BRAND = 'linear-gradient(135deg, #5B4FBE 0%, #E8314A 50%, #F97316 100%)';
const CTA   = 'linear-gradient(135deg, #2563EB 0%, #06B6D4 50%, #22C55E 100%)';

function GradText({ children, grad = BRAND, className = '' }: {
  children: React.ReactNode; grad?: string; className?: string
}) {
  return (
    <span className={className} style={{
      background: grad,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      display: 'inline-block'
    }}>
      {children}
    </span>
  );
}

interface FormState {
  fullName: string;
  designation: string;
  phone: string;
  email: string;
  location: string;
  bio: string;
  social: string;
}

const INITIAL: FormState = {
  fullName: 'Kathlene Roser',
  designation: 'Product Designer',
  phone: '+111 - (1234 5678 99)',
  email: 'kathlene@furnixar.com',
  location: '23/A Lake Side, New Arizona, USA',
  bio: 'Passionate about creating beautiful, functional spaces. Lover of canvas paintings, ambient lighting, and everything that makes a space feel alive.',
  social: 'https://linkedin.com/in/kathlene',
};

interface FieldCfg {
  key: keyof FormState;
  label: string;
  type: string;
  ph: string;
  icon: React.ReactNode;
  color: string;
}

const LEFT_FIELDS: FieldCfg[] = [
  { key: 'fullName',    label: 'Full Name',    type: 'text',  ph: 'Enter your full name',    icon: <LuUser size={14}/>,      color: '#5B4FBE' },
  { key: 'designation', label: 'Designation',  type: 'text',  ph: 'e.g. Product Designer',   icon: <LuBriefcase size={14}/>, color: '#E8314A' },
  { key: 'phone',       label: 'Phone Number', type: 'tel',   ph: 'Your phone number',        icon: <LuPhone size={14}/>,     color: '#F97316' },
  { key: 'email',       label: 'Email Address',type: 'email', ph: 'Your email address',       icon: <LuMail size={14}/>,      color: '#2563EB' },
];

const RIGHT_FIELDS: FieldCfg[] = [
  { key: 'location', label: 'Location',    type: 'text', ph: 'City, Country',           icon: <LuMapPin size={14}/>, color: '#06B6D4' },
  { key: 'social',   label: 'Web / Social',type: 'text', ph: 'https://yourwebsite.com', icon: <LuGlobe size={14}/>,  color: '#22C55E' },
];

export default function EditAccount() {
  useEffect(() => {
    Aos.init({ once: true, duration: 600 });
  }, []);

  const [form, setForm] = useState<FormState>(INITIAL);
  const [saved, setSaved] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [strength, setStrength] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const update = (key: keyof FormState, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    // Basic validation
    if (!form.fullName.trim()) {
      alert('Full name is required');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      alert('Valid email is required');
      return;
    }
    if (!form.phone.trim()) {
      alert('Phone number is required');
      return;
    }
    // Here you would normally send data to API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setForm(INITIAL);
    setAvatar(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStrength(0);
    setPasswordError('');
    setSaved(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const checkStrength = (pw: string) => {
    setNewPassword(pw);
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    setStrength(s);
    // Check confirm match if confirm has value
    if (confirmPassword && pw !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmChange = (val: string) => {
    setConfirmPassword(val);
    if (newPassword && val !== newPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const strengthColors = ['', '#E8314A', '#F97316', '#06B6D4', '#22C55E'];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];

  return (
    <>
      <NavbarOne />

      {/* Breadcrumb */}
      <div
        className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="text-center w-full">
          <h2 className="text-white md:text-[40px] font-normal leading-none">Edit Account</h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
            <li><Link to="/">Home</Link></li>
            <li>/</li>
            <li><Link to="/my-account">Account</Link></li>
            <li>/</li>
            <li><GradText>Edit</GradText></li>
          </ul>
        </div>
      </div>

      <div className="s-py-100">
        <div className="container-fluid">
          <div className="max-w-[1720px] mx-auto flex items-start gap-8 md:gap-12 2xl:gap-20 flex-col md:flex-row my-profile-navtab">

            {/* Sidebar */}
            <div className="w-full md:w-[200px] lg:w-[240px] flex-none" data-aos="fade-up" data-aos-delay="100">
              <AccountTab />
            </div>

            {/* Main Content */}
            <div className="w-full md:flex-1 space-y-5" data-aos="fade-up" data-aos-delay="200">

              {/* Avatar Card */}
              <div className="w-full max-w-[951px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-[80px]" style={{ background: 'linear-gradient(135deg,#f3f1ff 0%,#fff1f3 50%,#fff7f0 100%)' }}>
                  <div
                    className="w-full h-full opacity-30"
                    style={{ backgroundImage: 'radial-gradient(#5B4FBE22 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                  />
                </div>

                <div className="px-6 sm:px-8 pb-6 -mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="flex items-end gap-4">
                    <label className="relative cursor-pointer group">
                      <div
                        className="w-[68px] h-[68px] rounded-2xl border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-xl font-extrabold text-white flex-shrink-0"
                        style={{ background: avatar ? undefined : BRAND }}
                      >
                        {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : 'KR'}
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <LuCamera size={16} className="text-white" />
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>

                    <div className="pb-1">
                      <p className="text-[16px] font-bold text-gray-900">{form.fullName || 'Your Name'}</p>
                      <GradText className="text-[12px] font-semibold">{form.designation || 'Your Role'}</GradText>
                    </div>
                  </div>

                  <p className="text-[12px] text-gray-400 flex items-center gap-1.5 self-start sm:self-auto pb-1">
                    <LuCamera size={13} /> Click avatar to change photo
                  </p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="w-full max-w-[951px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: BRAND }}
                  >
                    <LuUser size={15} />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-extrabold text-gray-900">Personal Information</h4>
                    <p className="text-[12px] text-gray-400">Update your basic profile details</p>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column */}
                    <div className="grid gap-5 w-full lg:w-1/2">
                      {LEFT_FIELDS.map(cfg => (
                        <div key={cfg.key}>
                          <label className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-2 block">{cfg.label}</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex-shrink-0" style={{ color: cfg.color }}>
                              {cfg.icon}
                            </span>
                            <input
                              type={cfg.type}
                              value={form[cfg.key]}
                              placeholder={cfg.ph}
                              onChange={e => update(cfg.key, e.target.value)}
                              className="w-full h-12 rounded-xl pl-10 pr-4 text-[14px] border border-gray-300 focus:border-[#5B4FBE] outline-none transition"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Column */}
                    <div className="grid gap-5 w-full lg:w-1/2">
                      {RIGHT_FIELDS.map(cfg => (
                        <div key={cfg.key}>
                          <label className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-2 block">{cfg.label}</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex-shrink-0" style={{ color: cfg.color }}>
                              {cfg.icon}
                            </span>
                            <input
                              type={cfg.type}
                              value={form[cfg.key]}
                              placeholder={cfg.ph}
                              onChange={e => update(cfg.key, e.target.value)}
                              className="w-full h-12 rounded-xl pl-10 pr-4 text-[14px] border border-gray-300 focus:border-[#5B4FBE] outline-none transition"
                            />
                          </div>
                        </div>
                      ))}

                      {/* Bio (full width) */}
                      <div>
                        <label className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-2 block">Bio</label>
                        <div className="relative">
                          <LuFileText size={14} className="absolute left-3.5 top-3.5 flex-shrink-0" style={{ color: '#EC4899' }} />
                          <textarea
                            value={form.bio}
                            rows={5}
                            placeholder="Write a short bio..."
                            onChange={e => update('bio', e.target.value)}
                            className="w-full rounded-xl pl-10 pr-4 py-3 text-[14px] border border-gray-300 focus:border-[#5B4FBE] outline-none transition resize-none"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 text-right">{form.bio.length}/250</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="w-full max-w-[951px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: CTA }}
                  >
                    <LuShieldCheck size={15} />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-extrabold text-gray-900">Change Password</h4>
                    <p className="text-[12px] text-gray-400">Choose a strong, unique password</p>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid sm:grid-cols-3 gap-5">
                    {/* Current Password */}
                    <div>
                      <label className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-2 block">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full h-12 rounded-xl px-4 text-[14px] border border-gray-300 focus:border-[#5B4FBE] outline-none transition"
                      />
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-2 block">New Password</label>
                      <input
                        type="password"
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={e => checkStrength(e.target.value)}
                        className="w-full h-12 rounded-xl px-4 text-[14px] border border-gray-300 focus:border-[#5B4FBE] outline-none transition"
                      />
                      {strength > 0 && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4].map(i => (
                              <div
                                key={i}
                                className="flex-1 h-1.5 rounded-full transition-all duration-300"
                                style={{ background: i <= strength ? strengthColors[strength] : '#e5e7eb' }}
                              />
                            ))}
                          </div>
                          <p className="text-[11px] font-bold" style={{ color: strengthColors[strength] }}>
                            {strengthLabel}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-2 block">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={e => handleConfirmChange(e.target.value)}
                        className="w-full h-12 rounded-xl px-4 text-[14px] border border-gray-300 focus:border-[#5B4FBE] outline-none transition"
                      />
                      {passwordError && (
                        <p className="text-[11px] text-red-500 mt-1">{passwordError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Save / Reset Buttons */}
              <div className="w-full max-w-[951px] flex flex-wrap items-center gap-4 pb-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white text-[14px] font-bold hover:opacity-90 transition"
                  style={{ background: BRAND }}
                >
                  <LuSave size={15} /> {saved ? '✓ Saved!' : 'Save Changes'}
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-gray-200 text-gray-500 text-[14px] font-semibold hover:bg-gray-50 transition"
                >
                  <LuRefreshCw size={14} /> Reset
                </button>

                {saved && (
                  <p className="text-[13px] font-semibold text-green-600">✓ Profile updated successfully!</p>
                )}
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
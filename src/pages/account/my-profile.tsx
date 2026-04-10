import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import NavbarOne from "../../components/navbar/navbar-one";
import bg from '../../assets/img/shortcode/breadcumb.jpg';
import AccountTab from "../../components/account/account-tab";
import FooterOne from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";

import { LuMail, LuMapPin, LuPhoneCall, LuUser, LuCheck, LuX, LuUpload } from "react-icons/lu";

import Aos from "aos";

// Helper to get initials for avatar
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export default function MyProfile() {
  useEffect(() => {
    Aos.init({ once: true, duration: 600 });
  }, []);

  // Profile state (simulate logged-in user data)
  const [profile, setProfile] = useState({
    name: "Kathlene Roser",
    role: "Product Designer",
    bio: "All the Lorem Ipsum generators on the Internet tend to repeat predefined on the Internet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Non, lobortis in in tortor lectus iaculis viverra. Adipiscing lobortis interdum fringilla euismod odio vitae nam pulvinar elementum. Nibh purus integer elementum in. Tellus vulputate habitasse ut vulputate posuere habitant vel tempor varius.",
    phone: "+111 - (1234 5678 99)",
    email: "furnixar123@gmail.com",
    address: "23/ A Lake Side , New Arizona , USA",
    avatar: null as string | null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle edit toggle
  const handleEdit = () => {
    setEditForm(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
  };

  const handleSave = () => {
    // Update profile with edited values
    setProfile(editForm);
    setIsEditing(false);
    // Here you would also upload avatarFile to server and update avatar URL
    if (avatarFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(avatarFile);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const primaryColor = "#96865d"; // Your gold/brand color

  return (
    <>
      <NavbarOne />

      {/* Breadcrumb Hero */}
      <div
        className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="text-center w-full">
          <h2 className="text-white text-8 md:text-[40px] font-normal leading-none text-center">My Profile</h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
            <li><Link to="/">Home</Link></li>
            <li>/</li>
            <li className="text-primary">Profile</li>
          </ul>
        </div>
      </div>

      {/* Profile Section */}
      <div className="s-py-100">
        <div className="container-fluid">
          <div className="max-w-[1720px] mx-auto flex items-start gap-8 md:gap-12 2xl:gap-24 flex-col md:flex-row my-profile-navtab">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-[200px] lg:w-[300px] flex-none" data-aos="fade-up" data-aos-delay="100">
              <AccountTab />
            </div>

            {/* Main Profile Content */}
            <div className="w-full md:w-auto md:flex-1 overflow-auto">
              <div className="w-full max-w-[951px] bg-[#F8F8F9] dark:bg-dark-secondary p-5 sm:p-8 lg:p-[50px] rounded-xl shadow-sm">
                {/* Header with Avatar and Edit Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" data-aos="fade-up" data-aos-delay="200">
                  <div className="flex items-center gap-4">
                    {/* Avatar with upload capability when editing */}
                    <div
                      className={`relative w-20 h-20 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600 ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
                      style={{ backgroundColor: isEditing ? '#e2e8f0' : '#cbd5e1' }}
                      onClick={handleAvatarClick}
                    >
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{getInitials(profile.name)}</span>
                      )}
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <LuUpload className="text-white text-xl" />
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="text-xl font-semibold border border-gray-300 rounded px-3 py-1 w-full"
                          placeholder="Full Name"
                        />
                      ) : (
                        <h3 className="font-semibold leading-none text-2xl">{profile.name}</h3>
                      )}
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="text-sm text-gray-500 border border-gray-300 rounded px-3 py-1 mt-1 w-full"
                          placeholder="Role"
                        />
                      ) : (
                        <span className="leading-none mt-2 text-gray-500 block">{profile.role}</span>
                      )}
                    </div>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition"
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      < LuUser size={16} /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <LuCheck size={16} /> Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                      >
                        <LuX size={16} /> Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="mt-4" data-aos="fade-up" data-aos-delay="300">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  ) : (
                    <p className="text-base sm:text-lg text-justify text-gray-700">{profile.bio}</p>
                  )}
                </div>

                {/* Contact Details */}
                <div className="mt-6 grid gap-4 sm:gap-6" data-aos="fade-up" data-aos-delay="400">
                  <div className="flex items-center gap-3">
                    <LuPhoneCall className="text-primary size-5 flex-shrink-0" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      />
                    ) : (
                      <span className="leading-none font-medium text-base sm:text-lg">{profile.phone}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <LuMail className="text-primary size-5 flex-shrink-0" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      />
                    ) : (
                      <span className="leading-none font-medium text-base sm:text-lg">{profile.email}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <LuMapPin className="text-primary size-5 flex-shrink-0" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      />
                    ) : (
                      <span className="leading-none font-medium text-base sm:text-lg">{profile.address}</span>
                    )}
                  </div>
                </div>

                {/* Additional action links (optional) */}
                <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
                  <Link to="/account/change-password" className="text-sm text-primary hover:underline">
                    Change Password
                  </Link>
                  <Link to="/account/orders" className="text-sm text-primary hover:underline">
                    View Order History
                  </Link>
                  <Link to="/account/addresses" className="text-sm text-primary hover:underline">
                    Manage Addresses
                  </Link>
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
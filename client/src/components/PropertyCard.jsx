import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Star, MapPin } from 'lucide-react';

export default function PropertyCard({ property }) {
  const { user, toggleWishlist } = useAuth();
  const navigate = useNavigate();

  const isWishlisted = user?.wishlist?.includes(property._id) || false;
  const image = property.images?.[0];

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleWishlist(property._id);
  };

  return (
    <Link to={`/properties/${property._id}`} className="group relative block animate-fade-in">
      <article className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-gray-200/60 transition-all duration-300">
        
        {/* Image Section */}
        <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden w-full">
          {image ? (
            <img
              src={image}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#FF385C]/10 to-[#FF385C]/5">
              <span className="text-4xl font-extrabold text-[#FF385C]">
                {property.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Location Badge */}
          <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#FF385C]" />
            <span className="truncate max-w-[120px]">{property.location.split(',')[0]}</span>
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-3 right-3 p-2 bg-white/70 hover:bg-white backdrop-blur-xs rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Heart
              className={`w-4.5 h-4.5 transition-colors ${
                isWishlisted ? 'fill-[#FF385C] text-[#FF385C]' : 'text-gray-700'
              }`}
            />
          </button>
        </div>

        {/* Details Section */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate max-w-[200px]">
                {property.amenities?.slice(0, 3).join(' · ') || 'Stay'}
              </p>
              
              {property.rating > 0 && (
                <div className="flex items-center gap-0.5 text-xs font-bold text-gray-800 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-[#FF385C] text-[#FF385C]" />
                  <span>{property.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <h3 className="font-bold text-gray-850 text-sm sm:text-base leading-snug truncate group-hover:text-[#FF385C] transition-colors">
              {property.title}
            </h3>
            
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {property.guests} guests · {property.bedrooms} BR · {property.bathrooms} BA
            </p>
          </div>

          <div className="border-t border-gray-50 pt-2 mt-auto">
            <p className="text-gray-900 font-bold text-sm sm:text-base">
              ₹{property.price.toLocaleString('en-IN')}
              <span className="text-gray-400 font-normal text-xs sm:text-sm"> / night</span>
            </p>
          </div>
        </div>

      </article>
    </Link>
  );
}

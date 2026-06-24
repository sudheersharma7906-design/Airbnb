import { Link } from 'react-router-dom';

export default function PropertyCard({ property }) {
  const image = property.images?.[0];

  return (
    <Link to={`/properties/${property._id}`} className="group block">
      <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group-hover:shadow-lg group-hover:border-red-200 transition duration-200">
        <div className="relative h-48 bg-gradient-to-br from-red-100 to-red-50">
          {image ? (
            <img
              src={image.startsWith('http') ? image : image}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-5xl font-bold text-red-400">
                {property.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-1">
          <h3 className="font-bold text-gray-900 truncate group-hover:text-red-500">
            {property.title}
          </h3>
          <p className="text-sm text-gray-500">{property.location}</p>
          {property.rating > 0 && (
            <p className="text-sm font-semibold text-gray-800">
              <span className="text-yellow-500">★</span> {property.rating.toFixed(1)}
              <span className="text-gray-400 font-normal"> ({property.reviewCount})</span>
            </p>
          )}
          <p className="text-gray-900 font-semibold pt-1">
            ₹{property.price.toLocaleString('en-IN')}
            <span className="text-gray-500 font-normal text-sm"> / night</span>
          </p>
        </div>
      </article>
    </Link>
  );
}

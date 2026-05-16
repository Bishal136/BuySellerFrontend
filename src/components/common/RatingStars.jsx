import { FiStar } from 'react-icons/fi';

const RatingStars = ({ rating, onChange, editable = false }) => {
  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= rating;
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => editable && onChange && onChange(starValue)}
          className={`${editable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-1`}
          disabled={!editable}
        >
          <FiStar
            className={`w-5 h-5 ${
              isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      );
    });
  };

  return <div className="flex items-center">{renderStars()}</div>;
};

export default RatingStars;

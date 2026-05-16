const YouTubeEmbed = ({ embedId }) => {
  if (!embedId) return null;
  
  return (
    <div className="video-responsive relative w-full overflow-hidden rounded-xl shadow-lg my-6 bg-black" style={{ paddingTop: '56.25%' }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${embedId}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Embedded youtube video"
      />
    </div>
  );
};

export default YouTubeEmbed;

export default function ShareButton({ title, text, url }: {
  title: string;
  text: string;
  url: string;
}) {
  const handleClick = () => {
    if (navigator.share) {
      navigator
        .share({ title, text, url })
        .catch((err) => console.error("Share failed:", err));
    }
  };

  return (
    <button
      id="share-button"
      type="button"
      class="px-4 py-2 bg-blue-600 text-white rounded"
      onClick={handleClick}
    >
      Share
    </button>
  );
}

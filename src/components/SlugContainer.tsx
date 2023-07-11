import '@scss/carousel.scss';
export default function SlugContainer({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="slug-container">
      <div className="slug">
        <span className="truncate">{children}</span>
      </div>
    </div>
  );
}

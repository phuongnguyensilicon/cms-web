export default function RatingProgressBar({ percent }: { percent: number }) {
  return (
    <div className="rating-progress-bar">
      <div
        className="progress-inner"
        role="progressbar"
        style={{ width: `${percent || 0}%` }}
      ></div>
    </div>
  );
}

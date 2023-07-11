export default function AverageRating({
  score = 0
}: {
  score: number | undefined;
}) {
  const percent = `${((score || 0) / 5) * 100}%`;
  return (
    <>
      <meter
        className="average-rating thien ne"
        min="0"
        max="5"
        value={score}
        data-thien-rating={score}
        title={`${score} out of 5 stars`}
        style={{ '--percent': percent } as React.CSSProperties}
      >
        {`${score} out of 5`}
      </meter>
    </>
  );
}

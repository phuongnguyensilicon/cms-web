export const Loading = ({
  loading = true,
  size
}: {
  loading?: boolean;
  size?: number;
}) => {
  return (
    <div className="flex justify-center">
      {loading && (
        <div
          className={`animate-spin inline-block  border-[2px] border-current border-t-transparent text-[#e4303c] rounded-full w-4 h-4`}
          role="status"
          aria-label="loading"
          style={{ width: size, height: size }}
        ></div>
      )}
    </div>
  );
};

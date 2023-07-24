import Link from "next/link";


const styles = {
  actions: {
    background : "linear-gradient(0deg, rgba(113, 90, 174, 0.11), rgba(113, 90, 174, 0.11)), #FFFBFE",
    boxShadow     : "0px 3.14286px 6.28571px 2.35714px rgba(0, 0, 0, 0.15), 0px 0.785714px 2.35714px rgba(0, 0, 0, 0.3)",
    borderRadius  : "12.5714px",
    display: "flex",
    justifyContent: "center",
    alignItems    : "center",
  },


  actions__icon: {
    width          : "40px",
    height         : "40px",
  }
}

const ViewEditIcon = ({endpoint}: any) => {
  return (
    <Link
      className={`text-indigo-600 hover:text-indigo-900 cursor-pointer`}
      href={`${endpoint}`}
      style={{...styles.actions, ...styles.actions__icon}}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.5472 1.39214L14.6079 2.45286C15.2286 3.06571 15.2286 4.06357 14.6079 4.67643L4.21287 15.0714H0.928589V11.7871L9.10002 3.60786L11.3236 1.39214C11.9364 0.779285 12.9343 0.779285 13.5472 1.39214ZM2.50002 13.5L3.60787 13.5471L11.3236 5.82357L10.2157 4.71571L2.50002 12.4314V13.5Z"
          fill="#6750A4"
        />
      </svg>
    </Link>
  );
};

export default ViewEditIcon;

import Link from "next/link";


const styles = {
  actions: {
    display: "flex",
    justifyContent: "center",
    alignItems    : "center",
  },


  actions__icon: {
    width          : "40px",
    height         : "40px",
  }
}

const ViewUserProfileIcon = ({endpoint}: any) => {
  return (
    <Link
      className={`text-indigo-600 hover:text-indigo-900 cursor-pointer`}
      href={`${endpoint}`}
      style={{...styles.actions, ...styles.actions__icon}}
    >
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.72632 0 0 6.72632 0 15C0 23.2737 6.72632 30 15 30C23.2737 30 30 23.2737 30 15C30 6.72632 23.2737 0 15 0ZM15 8.58947C17.5896 8.58947 19.7053 10.7053 19.7053 13.2948C19.7053 15.8843 17.5895 18.0001 15 18.0001C12.4105 18.0001 10.2947 15.8843 10.2947 13.2948C10.2947 10.7053 12.4105 8.58947 15 8.58947ZM6.78947 24.0947V23.4C6.78947 21.4105 8.39994 19.7685 10.4209 19.7685H19.5788C21.5684 19.7685 23.2103 21.379 23.2103 23.4V24.0947C21.0313 26.0526 18.1576 27.2526 14.9998 27.2526C11.8423 27.2526 8.96842 26.0526 6.78947 24.0947Z" fill="#6366F1"/>
      </svg>
    </Link>
  );
};

export default ViewUserProfileIcon;

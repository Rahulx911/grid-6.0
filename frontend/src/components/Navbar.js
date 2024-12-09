import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AddBoxIcon from "@mui/icons-material/AddBox";

const Navbar = ({ currentStep }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center bg-gray-100 shadow-md p-4 fixed top-0 left-0 right-0 z-10">
    
      <div
        className="cursor-pointer flex items-center gap-2" style={{paddingLeft:"1rem"}}
        onClick={() => navigate("/")}
      >
        <HomeIcon className="h-6 w-6 text-blue-600 sm:h-8 sm:w-8" />
        <span className="text-blue-600 font-semibold hidden sm:block text-sm sm:text-base lg:text-lg ">
          Home
        </span>
      </div>

      {/* Breadcrumb */}
      <div className="text-gray-600 text-xs sm:text-sm lg:text-base font-medium truncate">
        {currentStep || "Home"}
      </div>

      <div
        className="cursor-pointer flex items-center gap-2 "  style={{paddingRight:"1rem"}}
        onClick={() => navigate("/enter-box-code")}
      >
        <AddBoxIcon className="h-6 w-6 text-blue-600 sm:h-8 sm:w-8" />
        <span className="text-blue-600 font-semibold hidden sm:block text-sm sm:text-base lg:text-lg ;
">
          New Box
        </span>
      </div>
    </div>
  );
};

export default Navbar;

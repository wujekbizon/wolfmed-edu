const TitleButton = ({ title, className }: { title: string; className?: string }) => {
    return (
      <div className={className || ''}>
        <div className="w-fit h-6 flex items-center justify-center border bg-linear-to-r from-red-400 to-red-500 rounded-[49px] py-5 px-5 shadow-[0px_2px_4px_rgba(127,255,0,0.5)] smMobile:h-5 smMobile:p-0.5 smMobile:px-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
            <circle cx="4.03482" cy="3.79312" r="3.69839" fill="#7fff00" />
          </svg>
          <h4 className="text-[#7fff00] text-xs font-normal tracking-[0.3px] ml-2.5 smMobile:text-[9px]">
            {title}
          </h4>
        </div>
      </div>
    );
  };
  
  export default TitleButton;
  
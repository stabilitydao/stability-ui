const STBL = (): JSX.Element => {
  return (
    <div className="w-full xl:min-w-[1200px] max-w-[1400px] font-manrope">
      <div className="STBL">
        <div className="flex justify-between items-center h-[300px] py-10 pl-[50px] pr-[80px]">
          <div className="flex flex-col items-start justify-between h-full">
            <div>
              <span className="text-[55px] leading-10">PUBLIC SALE</span>
              <p className="text-[20px] text-[#949494]">
                Stability protocol official token
              </p>
            </div>
            <div className="flex items-end justify-center gap-[50px]">
              <div className="flex flex-col items-start">
                <span className="text-[15px] font-light">Price</span>
                <div className="flex items-center justify-center gap-2">
                  <img src="/sonic.png" alt="Sonic" />
                  <span className="text-[28px] font-bold">0,070</span>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[15px] font-light">Total Supply</span>
                <p className="text-[28px] font-bold">
                  1,000,000,000 <span className="text-[#A995FF]">STBL</span>
                </p>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[15px] font-light">Total Raised</span>
                <div className="flex items-center justify-center gap-2">
                  <img src="/sonic.png" alt="Sonic" />
                  <p className="text-[28px] font-bold">1,000,000</p>
                </div>
              </div>
            </div>
          </div>
          <img src="/STBL.png" alt="STBL" />
        </div>
      </div>
    </div>
  );
};
export { STBL };

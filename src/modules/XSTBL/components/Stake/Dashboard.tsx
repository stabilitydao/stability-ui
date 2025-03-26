const Dashboard = (): JSX.Element => {
  return (
    <div className="bg-accent-950 p-5 rounded-2xl flex justify-center md:justify-between gap-5 flex-col md:flex-row md:h-[300px]">
      <div className="flex flex-col items-center justify-center STBL md:w-1/2 w-full">
        <span className="text-[22px] lg:text-[32px] font-bold">
          Outstanding Pending Rebase
        </span>
        <span className="text-[60px]">$332,984</span>
        <span className="text-[22px]">distributed in 01:14:17:47</span>
        <span className="text-[18px] opacity-50">3,741 xSTBL</span>
      </div>
      <div className="flex flex-col md:w-1/2 w-full gap-5">
        <div className="flex justify-between items-center p-3 rounded-2xl bg-accent-900">
          <span>Total Staked</span>
          <span>1,812,353.40 xSTBL</span>
        </div>
        <div className="flex flex-col justify-between p-3 rounded-2xl bg-accent-900 h-full">
          <div className="flex items-center justify-between w-full">
            <span>Your Stake</span>
            <span>0 xSTBL</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <span>Rebase APR</span>
            <span>10.76%</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <span>Your estimated rebase</span>
            <span>0 xSTBL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };

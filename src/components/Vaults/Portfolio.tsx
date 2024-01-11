import { useState } from "react";

interface IProps {
  data: any;
}

const Portfolio: React.FC<IProps> = ({ data }) => {
  const [visible, setVisible] = useState(true);
  return (
    <div className="bg-[#23262d] my-2 rounded-sm">
      <div className="p-2">
        <div className="flex items-center gap-3">
          <h3 className="text-[1.5rem] font-medium">Portfolio</h3>
          <div className="cursor-pointer">
            {!visible && (
              <svg
                onClick={() => setVisible(true)}
                width="22"
                height="16"
                viewBox="0 0 22 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.1284 10.9464C19.7566 9.30323 20.75 7.75 20.75 7.75C20.75 7.75 16.2728 0.75 10.75 0.75C9.92433 0.75 9.12203 0.906455 8.35456 1.17258M3.81066 0.75L18.3063 15.2457M0.75 7.75C0.75 7.75 2.68788 4.72014 5.58647 2.64713L15.8426 12.9033C14.351 13.9562 12.6098 14.75 10.75 14.75C5.22715 14.75 0.75 7.75 0.75 7.75ZM10.75 11.75C8.54086 11.75 6.75 9.95909 6.75 7.74995C6.75 6.7355 7.12764 5.80926 7.75 5.10413L13.6104 10.5461C12.8841 11.2889 11.8709 11.75 10.75 11.75Z"
                  stroke="white"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {visible && (
              <svg
                onClick={() => setVisible(false)}
                width="22"
                height="16"
                viewBox="0 0 22 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 8C21 8 16.5228 15 11 15C5.47715 15 1 8 1 8C1 8 5.47715 1 11 1C16.5228 1 21 8 21 8Z"
                  stroke="white"
                  strokeLinecap="round"
                />
                <path
                  d="M15 8C15 10.2091 13.2091 12 11 12C8.79086 12 7 10.2091 7 8C7 5.79086 8.79086 4 11 4C13.2091 4 15 5.79086 15 8Z"
                  stroke="white"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        </div>
        <div className="flex items-center justify-start gap-5 flex-wrap">
          <div>
            <h2 className="text-[1rem] md:text-[1.125rem] md:font-medium select-none">
              DEPOSITED
            </h2>
            <p className="text-[1.2rem] md:text-[1.625rem]">
              {visible ? `$${data.deposited}` : "****"}
            </p>
          </div>
          <div>
            <h2 className="text-[1rem] md:text-[1.125rem] md:font-medium select-none">
              MONTHLY YIELD
            </h2>
            <p className="text-[1.2rem] md:text-[1.625rem]">
              {visible ? `$${data.monthly}` : "****"}
            </p>
          </div>
          <div>
            <h2 className="text-[1rem] md:text-[1.125rem] md:font-medium select-none">
              DAILY YIELD
            </h2>
            <p className="text-[1.2rem] md:text-[1.625rem]">
              {visible ? `$${data.daily}` : "****"}
            </p>
          </div>
          <div>
            <h2 className="text-[1rem] md:text-[1.125rem] md:font-medium select-none">
              AVG. APY
            </h2>
            <p className="text-[1.2rem] md:text-[1.625rem]">
              {visible ? `${data.avg}%` : "****"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Portfolio };

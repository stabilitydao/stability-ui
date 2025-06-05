import "./home.css";

const Home = (): JSX.Element => {
  return (
    <div className="w-screen h-screen font-manrope font-light text-[#ECE3DA] flex flex-col home-bg">
      <div className="flex flex-col justify-between flex-1 z-[2]">
        <header className="flex items-center justify-between h-[60px] w-full">
          <img
            className="w-[105px] h-[48px] md:w-[140px] md:h-[60px]"
            src="/full_logo_dark.png"
            alt="Stability logo"
          />
          <a
            href="/vaults"
            className="bg-accent-500 h-10 px-3 w-[150px] py-1 rounded-[5px] md:flex items-center justify-center gap-1 font-semibold hidden mr-[15px]"
          >
            Launch App
          </a>
        </header>
        <main className="mt-[20px] md:mt-0 home-main">
          <div className="min-[1130px]:min-w-[1095px] min-[1440px]:min-w-[1338px] md:px-0 px-2">
            <a
              className="flex items-center justify-start mb-[5px] md:mb-1 ml-[3px]"
              href="https://www.soniclabs.com/"
              target="_blank"
            >
              <span className="mr-[7px] responsive-font__sonic text-nowrap">
                Powered by
              </span>
              <img
                src="/sonic.svg"
                alt="Sonic"
                className="w-[60px] h-[27px] md:w-[80px] md:h-10"
              />
            </a>
            <h1 className="responsive-font__h1 mb-3 leading-[100%]">
              DeFi Infrastructure Layer
            </h1>
            <p className="responsive-font__p opacity-60 leading-[120%] mb-[30px] md:mb-[50px] md:ml-[2px]">
              Stability acts as permissionless, non-custodial and{" "}
              <br className="hidden md:block" /> automatic asset management{" "}
              <br className="block md:hidden" />
              solution
              <br className="hidden md:block" /> based on AI.
            </p>
            <div className="flex items-center gap-5">
              <a
                className="text-white text-[15px] md:text-[20px] leading-[100%] py-[9px] md:py-[15px] px-6 md:px-[45px] bg-[#612FFB] rounded-[5px] font-medium md:ml-[2px]"
                href="/metavaults"
              >
                Meta Vaults
              </a>
              <a
                className="text-white text-[15px] md:text-[20px] leading-[100%] py-[9px] md:py-[15px] px-6 md:px-[45px] bg-[#612FFB] rounded-[5px] font-medium md:ml-[2px]"
                href="/vaults"
              >
                Vaults
              </a>
            </div>
          </div>
        </main>
        <footer className="py-6 md:py-[3rem] px-1 flex items-center lg:items-end justify-between flex-col lg:flex-row md:responsive-font__footer! gap-5 min-[1130px]:min-w-[1095px] min-[1440px]:min-w-[1338px] home-footer">
          <a
            className="flex items-center justify-center mb-3 md:mb-0"
            href="https://docs.soniclabs.com/funding/airdrop/sonic-boom/winners"
            target="_blank"
          >
            <img
              src="/sonic_boom.png"
              alt="Sonic"
              className="w-[125px] md:w-auto"
            />
          </a>

          <div className="lg:hidden flex items-center justify-center gap-5">
            <a
              href="https://github.com/stabilitydao"
              target="_blank"
              title="GitHub"
            >
              <img src="socials/github.svg" alt="GitHub" className="w-5 h-5" />
            </a>
            <a href="https://x.com/stabilitydao" target="_blank" title="X">
              <img src="socials/x.svg" alt="X" className="w-5 h-5" />
            </a>
            <a
              href="https://stabilitydao.gitbook.io/"
              target="_blank"
              title="GitBook"
            >
              <img
                src="socials/gitbook.svg"
                alt="GitBook"
                className="w-5 h-5"
              />
            </a>
            <a
              href="https://defillama.com/protocol/stability"
              target="_blank"
              title="DefiLlama"
            >
              <img
                src="socials/defillama.svg"
                alt="DefiLlama"
                className="w-5 h-5"
              />
            </a>
          </div>

          <div className="text-center lg:text-right text-[35px]">
            <p className="hidden lg:block">Join Stability</p>{" "}
            <p className="text-neutral-400 responsive-font__footer mt-5 md:mt-0">
              Stability is live and already growing.
              <br /> Join our{" "}
              <a
                className="text-[#C2AEFF] underline"
                href="https://discord.com/invite/R3nnetWzC9"
                target="_blank"
              >
                community
              </a>{" "}
              to find out more.
            </p>
            <div className="items-center justify-end lg:flex hidden mt-6">
              <a
                href="https://github.com/stabilitydao"
                target="_blank"
                title="GitHub"
                className="px-3"
              >
                <img
                  src="socials/github.svg"
                  alt="GitHub"
                  className="w-4 h-4"
                />
              </a>
              <a
                href="https://x.com/stabilitydao"
                target="_blank"
                title="X"
                className="px-3"
              >
                <img src="socials/x.svg" alt="X" className="w-4 h-4" />
              </a>
              <a
                href="https://stabilitydao.gitbook.io/"
                target="_blank"
                title="GitBook"
                className="px-3"
              >
                <img
                  src="socials/gitbook.svg"
                  alt="GitBook"
                  className="w-4 h-4"
                />
              </a>
              <a
                href="https://defillama.com/protocol/stability"
                target="_blank"
                title="DefiLlama"
                className="px-3"
              >
                <img
                  src="socials/defillama.svg"
                  alt="DefiLlama"
                  className="w-4 h-4"
                />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export { Home };

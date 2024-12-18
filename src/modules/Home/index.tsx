import { useState } from "react";
import "./home.css";

const Home = (): JSX.Element => {
  const [menu, setMenu] = useState(false);
  return (
    <div className="w-screen h-screen font-manrope font-light text-[#ECE3DA] flex flex-col home-bg">
      <div className="mx-5 md:mx-[100px] lg:mx-[150px] my-5 md:my-10 flex flex-col justify-between flex-1 z-[2]">
        {/* <header className="flex items-center justify-between flex-wrap gap-5 md:gap-0">
          <img
            className="w-[105px] h-[48px] md:w-[175px] md:h-[80px]"
            src="/full_logo_dark.png"
            alt="Stability logo"
          />
          <div className="items-center gap-5 hidden min-[450px]:flex md:gap-[60px]">
            <a
              className="responsive-font__nav"
              href="https://github.com/stabilitydao"
              target="_blank"
            >
              GitHub
            </a>
            <a
              className="responsive-font__nav"
              href="https://x.com/stabilitydao"
              target="_blank"
            >
              X
            </a>
            <a
              className="responsive-font__nav"
              href="https://stabilitydao.gitbook.io/"
              target="_blank"
            >
              Docs
            </a>
            <a
              className="responsive-font__nav"
              href="https://defillama.com/protocol/stability"
              target="_blank"
            >
              DefiLlama
            </a>
          </div>
        </header> */}
        <header className="relative flex items-center justify-between">
          <img
            className="w-[105px] h-[48px] md:w-[140px] md:h-[60px]"
            src="/full_logo_dark.png"
            alt="Stability logo"
          />

          <div className="menu absolute left-1/2 transform -translate-x-1/2 text-[16px]">
            <a href="/vaults">Vaults</a>
            <a href="/users">Users</a>
            <a href="/platform">Platform</a>
          </div>
          <div className="flex justify-end mr-[15px] gap-3">
            <div
              className="burger-menu"
              onClick={() => setMenu((prev) => !prev)}
            >
              {menu ? (
                <img className="w-4 h-4" src="/close.svg" alt="close" />
              ) : (
                <img className="w-4 h-4" src="/menu.svg" alt="menu" />
              )}
            </div>
          </div>
          <nav className={`menu-nav text-center gap-3 ${menu && "active"}`}>
            <a className="px-4 py-[10px] font-semibold" href="/">
              Vaults
            </a>
            <a className="px-4 py-[10px] font-semibold" href="/users">
              Users
            </a>
            <a className="px-4 py-[10px] font-semibold" href="/platform">
              Platform
            </a>
          </nav>
        </header>
        <main>
          <a
            className="flex items-center justify-start"
            href="https://www.soniclabs.com/"
            target="_blank"
          >
            <span className="mr-[7px] responsive-font__sonic text-nowrap">
              Powered by
            </span>
            <img
              src="/sonic.svg"
              alt="Sonic"
              className="w-[70px] h-[27px] md:w-[109px] md:h-10"
            />
          </a>
          <h1 className="responsive-font__h1 mb-3 leading-[100%]">
            DeFi Infrastructure Layer
          </h1>
          <p className="responsive-font__p opacity-60 leading-[120%] mb-5 md:mb-[60px]">
            Stability acts as permissionless, non-custodial and{" "}
            <br className="" /> automatic asset management solution <br /> based
            on AI.
          </p>
          <a
            className="text-white responsive-font__nav leading-[100%] py-[9px] md:py-[18px] px-6 md:px-[48px] bg-[#612FFB] rounded-lg"
            href="/vaults"
          >
            Vaults
          </a>
        </main>
        <footer className="flex items-center lg:items-end justify-between flex-col lg:flex-row md:responsive-font__footer! gap-5">
          <a
            className="flex items-center justify-center"
            href="https://docs.soniclabs.com/funding/airdrop/sonic-boom/winners"
            target="_blank"
          >
            <img src="/sonic_boom.png" alt="Sonic" className="" />
          </a>

          <div className="min-[450px]:hidden w-[50%] flex items-center justify-between">
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
          <div className="text-center lg:text-right text-[45px]">
            <p className="hidden lg:block">Join Stability</p>{" "}
            <p className="text-neutral-400 responsive-font__footer">
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
          </div>
        </footer>
      </div>
    </div>
  );
};

export { Home };

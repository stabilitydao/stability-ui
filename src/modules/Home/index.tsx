import { useState } from "react";
import "./home.css";

const Home = (): JSX.Element => {
  const [menu, setMenu] = useState(false);
  return (
    <div className="w-screen h-screen font-manrope font-light text-[#ECE3DA] flex flex-col home-bg">
      <div className="flex flex-col justify-between flex-1 z-[2]">
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
            <a
              href="/vaults"
              className="bg-accent-500 h-10 px-3 md:min-w-[150px] py-1 rounded-xl flex items-center justify-center gap-1 w-[120px] md:w-full font-semibold"
            >
              Launch App
            </a>
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
          <div className="min-[1130px]:min-w-[1095px] min-[1440px]:min-w-[1338px]">
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
              <br className="" /> automatic asset management solution <br />{" "}
              based on AI.
            </p>
            <a
              className="text-white responsive-font__nav leading-[100%] py-[9px] md:py-[18px] px-6 md:px-[48px] bg-[#612FFB] rounded-lg"
              href="/vaults"
            >
              Vaults
            </a>
          </div>
        </main>
        <footer className="flex items-center lg:items-end justify-between flex-col lg:flex-row md:responsive-font__footer! gap-5 min-[1130px]:min-w-[1095px] min-[1440px]:min-w-[1338px]">
          <a
            className="flex items-center justify-center"
            href="https://docs.soniclabs.com/funding/airdrop/sonic-boom/winners"
            target="_blank"
          >
            <img src="/sonic_boom.png" alt="Sonic" className="" />
          </a>

          <div className="lg:hidden w-[50%] flex items-center justify-center">
            <a
              href="https://github.com/stabilitydao"
              target="_blank"
              title="GitHub"
              className="px-3 py-2"
            >
              <img src="socials/github.svg" alt="GitHub" className="w-5 h-5" />
            </a>
            <a
              href="https://x.com/stabilitydao"
              target="_blank"
              title="X"
              className="px-3 py-2"
            >
              <img src="socials/x.svg" alt="X" className="w-5 h-5" />
            </a>
            <a
              href="https://stabilitydao.gitbook.io/"
              target="_blank"
              title="GitBook"
              className="px-3 py-2"
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
              className="px-3 py-2"
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
            <div className="items-center justify-end lg:flex hidden">
              <a
                href="https://github.com/stabilitydao"
                target="_blank"
                title="GitHub"
                className="px-3 py-2"
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
                className="px-3 py-2"
              >
                <img src="socials/x.svg" alt="X" className="w-4 h-4" />
              </a>
              <a
                href="https://stabilitydao.gitbook.io/"
                target="_blank"
                title="GitBook"
                className="px-3 py-2"
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
                className="px-3 py-2"
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

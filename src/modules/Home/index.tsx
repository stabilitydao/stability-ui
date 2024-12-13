import "./home.css";

const Home = (): JSX.Element => {
  return (
    <div className="w-screen h-screen font-manrope text-[#ECE3DA] flex flex-col home-bg">
      <div className="mx-5 md:mx-[100px] lg:mx-[150px] my-5 md:my-10 flex flex-col justify-between flex-1">
        <header className="flex items-center justify-between flex-wrap gap-5 md:gap-0">
          <div className="flex items-center gap-2">
            <img className="w-8 h-8" src="/logo.svg" alt="Stability logo" />
            <span className="block text-[24px] font-semibold text-[#A995FF]">
              Stability
            </span>
          </div>
          <div className="flex items-center gap-5 md:gap-[60px] font-medium">
            <a className="responsive-font__nav" href="">
              GitHub
            </a>
            <a className="responsive-font__nav" href="">
              X
            </a>
            <a className="responsive-font__nav" href="">
              Docs
            </a>
            <a className="responsive-font__nav" href="">
              DefiLlama
            </a>
          </div>
        </header>
        <main>
          <h1 className="responsive-font__h1 font-semibold mb-3 leading-[100%]">
            DeFi Infrastructure Layer
          </h1>
          <h3 className="responsive-font__h3 opacity-60 font-medium leading-[120%] mb-5 md:mb-10">
            Stability acts as permissionless, non-custodial and <br /> automatic
            asset management solution <br /> based on AI.
          </h3>
          <a
            className="text-white responsive-font__nav font-semibold leading-[100%] py-[9px] md:py-[18px] px-6 md:px-[48px] bg-[#612FFB] rounded-lg"
            href="/vaults"
          >
            Vaults
          </a>
        </main>
        <footer className="flex items-center justify-between flex-col lg:flex-row responsive-font__footer">
          <p className="flex items-center">
            <span>Powered by</span>
            <img src="/sonic.svg" alt="Sonic" />
          </p>
          <p className="text-right opacity-60 font-medium">
            Stability is live and already growing.
            <br /> Join our{" "}
            <a className="text-[#C2AEFF] font-semibold opacity-60" href="">
              community
            </a>{" "}
            to find out more.
          </p>
        </footer>
      </div>
    </div>
  );
};

export { Home };

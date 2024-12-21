const Footer = (): JSX.Element => {
  return (
    <footer className="shrink-0">
      <div className="flex items-center justify-end py-5 px-3">
        <a
          className="px-3 py-2"
          target="_blank"
          href="https://github.com/stabilitydao"
          title="GitHub"
        >
          <img src="/socials/github.svg" alt="GitHub" className="w-4 h-4" />
        </a>
        <a
          className="px-3 py-2"
          target="_blank"
          href="https://x.com/stabilitydao"
          title="X"
        >
          <img src="/socials/x.svg" alt="X" className="w-4 h-4" />
        </a>
        <a
          className="px-3 py-2"
          target="_blank"
          href="https://t.me/stabilitydao"
          title="Telegram"
        >
          <img src="/socials/telegram.svg" alt="Telegram" className="w-4 h-4" />
        </a>
        <a
          className="px-3 py-2"
          target="_blank"
          href="https://discord.com/invite/R3nnetWzC9"
          title="Discord"
        >
          <img src="/socials/discord.svg" alt="Discord" className="w-4 h-4" />
        </a>
        <a
          className="px-3 py-2"
          target="_blank"
          href="https://stabilitydao.gitbook.io/"
          title="Stability Book"
        >
          <img src="/socials/gitbook.svg" alt="GitBook" className="w-4 h-4" />
        </a>
      </div>
    </footer>
  );
};

export { Footer };

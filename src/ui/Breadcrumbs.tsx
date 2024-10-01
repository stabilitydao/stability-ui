interface IProps {
  links: string[];
}

const Breadcrumbs: React.FC<IProps> = ({ links }) => {
  return (
    <div className="flex gap-1 font-manrope font-bold text-[12px] mb-5">
      {links.map((link, index) => {
        const isLast = index === links.length - 1;
        return (
          <div key={link}>
            {isLast ? (
              <span>{link}</span>
            ) : (
              <>
                <a
                  href={link != "Vaults" ? `/${link.toLowerCase()}` : "/"}
                  className="text-[#7F768B] mr-1"
                >
                  {link}
                </a>
                <span className="text-[#A6A0B2]">/</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { Breadcrumbs };

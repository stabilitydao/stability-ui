import { cn } from "@utils";

import { SOCIALS } from "@constants";

interface IProps {
  styles?: string;
}

const Socials: React.FC<IProps> = ({ styles = "" }) => {
  return (
    <div className={cn("flex items-center gap-4 p-4", styles)}>
      {SOCIALS.map(({ name, logo, link }) => (
        <a key={name} href={link} target="_blank">
          <img src={logo} alt={name} title={name} />
        </a>
      ))}
    </div>
  );
};

export { Socials };

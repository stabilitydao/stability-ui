import {
  DashboardIcon,
  VaultsIcon,
  LeverageIcon,
  MetavaultsIcon,
  ALMIcon,
  AgentsIcon,
  PlatformIcon,
  LendingIcon,
  DAOIcon,
} from "./Icons";

interface IProps {
  path: string;
  isActive: boolean;
}

const NavIcon: React.FC<IProps> = ({ path, isActive }) => {
  const color = isActive ? "#5E6AD2" : "#97979A";
  switch (path) {
    case "dashboard":
      return <DashboardIcon color={color} />;
    case "vaults":
      return <VaultsIcon color={color} />;
    case "leverage-vaults":
      return <LeverageIcon color={color} />;
    case "metavaults":
      return <MetavaultsIcon color={color} />;
    case "alm":
      return <ALMIcon color={color} />;
    case "agents":
      return <AgentsIcon color={color} />;
    case "platform":
      return <PlatformIcon color={color} />;
    case "lending":
      return <LendingIcon color={color} />;
    case "https://dao.host/stbl":
      return <DAOIcon color={color} />;
    default:
      return null;
  }
};

export { NavIcon };

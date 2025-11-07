import {
  DashboardIcon,
  VaultsIcon,
  FarmingIcon,
  MetavaultsIcon,
  ALMIcon,
  XSTBLIcon,
  AgentsIcon,
  PlatformIcon,
  LeaderboardsIcon,
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
    case "leveraged-farming":
      return <FarmingIcon color={color} />;
    case "metavaults":
      return <MetavaultsIcon color={color} />;
    case "alm":
      return <ALMIcon color={color} />;
    case "leaderboards":
      return <LeaderboardsIcon color={color} />;
    case "xstbl":
      return <XSTBLIcon color={color} />;
    case "agents":
      return <AgentsIcon color={color} />;
    case "platform":
      return <PlatformIcon color={color} />;
    case "lending":
      return <LendingIcon color={color} />;
    case "dao":
      return <DAOIcon color={color} />;
    default:
      return null;
  }
};

export { NavIcon };

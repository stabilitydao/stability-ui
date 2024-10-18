import { useStore } from "@nanostores/react";

import { Breadcrumbs, HeadingText } from "@ui";

import { apiData } from "@store";

import { Timer } from "./components";

import { contests } from "@stabilitydao/stability";

interface IProps {
  contestId: string;
}

const Contest: React.FC<IProps> = ({ contestId }) => {
  const $apiData = useStore(apiData);

  const contest = contests[contestId];
  console.log($apiData);
  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <Breadcrumbs links={["Users", "Contests", contest.name]} />
      <HeadingText text={contest.name} scale={1} />
      <Timer start={contest.start} end={contest.end} />
    </div>
  );
};

export { Contest };

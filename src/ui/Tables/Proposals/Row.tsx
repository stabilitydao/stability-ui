interface IProps {
  proposal: any;
}

const Row: React.FC<IProps> = ({ proposal }) => {
  console.log(proposal);

  return (
    <a
      className="bg-[#101012] cursor-pointer border border-[#23252A] min-w-max md:min-w-full"
      href={`https://snapshot.box/#/s:stabilitydao.eth/proposal/${proposal.id}`}
      target="_blank"
    >
      123
    </a>
  );
};

export { Row };

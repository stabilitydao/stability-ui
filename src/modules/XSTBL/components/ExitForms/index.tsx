import { VestedExit } from "./VestedExit";
import { InstantExit } from "./InstantExit";

const ExitForms = (): JSX.Element => {
  return (
    <div className="hidden lg:flex items-stretch gap-3">
      <VestedExit />
      <InstantExit />
    </div>
  );
};

export { ExitForms };

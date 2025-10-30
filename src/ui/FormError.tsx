import { copyText, getShortErrorMessage } from "@utils";

interface IProps {
  errorMessage: string;
}

const FormError: React.FC<IProps> = ({ errorMessage }) => {
  if (!errorMessage) return null;

  const shortErrorMessage = getShortErrorMessage(errorMessage);

  return (
    <div className="bg-[#641E1E] w-full rounded-md">
      <div className="p-2 flex items-center gap-2">
        <img src="/icons/error.svg" alt="error" className="w-5 h-5" />
        <p className="text-[16px] leading-5 text-[#FBB4AF] flex items-center flex-wrap gap-1">
          <span>{shortErrorMessage}</span>
          <span
            className="underline cursor-pointer hover:no-underline"
            onClick={() => copyText(errorMessage)}
          >
            copy the error
          </span>
        </p>
      </div>
    </div>
  );
};

export { FormError };

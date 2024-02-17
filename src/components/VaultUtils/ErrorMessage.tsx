import { useStore } from "@nanostores/react";

import { error, reload } from "@store";

const ErrorMessage = () => {
  const $error = useStore(error);
  const $reload = useStore(reload);

  return (
    $error && (
      <div className="mt-5 text-[14px]">
        <div className="flex items-center justify-center flex-col gap-3">
          <p>{$error}</p>
          <button
            onClick={() => reload.set(!$reload)}
            className="bg-button px-3 py-2 rounded-md"
          >
            Reload
          </button>
        </div>
      </div>
    )
  );
};

export { ErrorMessage };

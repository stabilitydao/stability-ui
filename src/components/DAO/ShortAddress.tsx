function ShortAddress(props: any) {
  const prefix = props.address.slice(0, 6);
  const suffix = props.address.slice(-4);
  const address = `${prefix}...${suffix}`;

  const copyAddress = () => {
    const textArea = document.createElement("textarea");
    textArea.value = props.address;
    document.body.appendChild(textArea);

    textArea.select();
    document.execCommand("copy");

    document.body.removeChild(textArea);
  };
  return (
    <div className="flex my-auto">
      <p className="m-auto">{address}</p>
      <button
        className="mx-3"
        onClick={copyAddress}
        title="Copy address">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-[18px] icon icon-tabler icon-tabler-copy my-auto"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path
            stroke="none"
            d="M0 0h24v24H0z"
            fill="none"
          />
          <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
          <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
        </svg>{" "}
      </button>
      <a
        target="_blank"
        href={`https://polygonscan.com/address/${props.address}`}
        title="Go to polygonscan">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-[18px] icon icon-tabler icon-tabler-external-link my-auto"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path
            stroke="none"
            d="M0 0h24v24H0z"
            fill="none"
          />
          <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" />
          <path d="M11 13l9 -9" />
          <path d="M15 4h5v5" />
        </svg>
      </a>
    </div>
  );
}
export default ShortAddress;

const FullPageLoader = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={`absolute bg-white w-[3px] h-[10px] rounded-full`}
              style={{
                transform: `rotate(${i * 45}deg) translate(0, -130%)`,
                animation: `fade 1.2s ${i * 0.1}s infinite ease-in-out`,
              }}
            ></div>
          ))}
      </div>
    </div>
  );
};

export { FullPageLoader };

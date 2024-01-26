import ContentLoader from "react-content-loader";

const AssetsSkeleton = () => {
  return (
    <ContentLoader
      speed={2}
      width={320}
      height={100}
      viewBox="0 0 320 100"
      backgroundColor="#262830"
      foregroundColor="#ccb3f3"
    >
      <rect x="0" y="0" rx="10" ry="10" width="320" height="100" />
    </ContentLoader>
  );
};

export { AssetsSkeleton };

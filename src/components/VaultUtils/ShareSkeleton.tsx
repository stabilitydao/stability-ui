import ContentLoader from "react-content-loader";

const ShareSkeleton = () => {
  return (
    <ContentLoader
      speed={2}
      width={366}
      height={63}
      viewBox="0 0 366 63"
      backgroundColor="#262830"
      foregroundColor="#ccb3f3"
    >
      <rect x="0" y="0" rx="10" ry="10" width="366" height="63" />
    </ContentLoader>
  );
};

export { ShareSkeleton };

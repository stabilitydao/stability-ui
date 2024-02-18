import ContentLoader from "react-content-loader";

const Skeleton = (props) => {
  return (
    <ContentLoader
      speed={2}
      width={100}
      height={100}
      viewBox="0 0 320 63"
      backgroundColor="#262830"
      foregroundColor="#ccb3f3"
      {...props}
    >
      <rect x="0" y="0" rx="10" ry="10" width="320" height="63" />
    </ContentLoader>
  );
};

export { Skeleton };

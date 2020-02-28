import React, {
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import { useInView } from "react-intersection-observer";
import debounce from "debounce";

const DEBOUNCE_TIME = 150;
const BOTTOM_VALUE = 999999999;

const InfiniteScroll = forwardRef(
  (
    {
      children,
      className,
      loader,
      onPaginate,
      onScroll = () => {},
      shouldStopScrolling = false,
      maxHeight = "auto",
      isLoading = true,
      withOverflow = true
    },
    ref
  ) => {
    const containerRef = useRef();
    const [observableRef, inView] = useInView({ threshold: 0 });
    const [page, setPage] = useState(1);

    const debouncedOnScroll = debounce(
      () => onScroll(containerRef.current.scrollTop),
      DEBOUNCE_TIME
    );

    useEffect(() => {
      if (inView) {
        onPaginate(page);
        setPage(page + 1);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView]);

    useEffect(() => {
      containerRef.current.addEventListener("scroll", e => {
        debouncedOnScroll();
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      // eslint-disable-next-line no-unused-expressions
      scrollToTheTop: () => {
        containerRef.current.scrollTo({
          top: 0
        });
      }
    }));

    useEffect(() => {
      if (isLoading) {
        containerRef.current.scrollTo({
          top: BOTTOM_VALUE
        });
      }
    }, [isLoading]);

    return (
      <div
        ref={containerRef}
        style={{
          maxHeight,
          ...(withOverflow ? { overflowY: "auto", overflowX: "hidden" } : {})
        }}
        className={className}
      >
        {children}
        {shouldStopScrolling ? null : isLoading ? (
          loader
        ) : (
          <div
            ref={observableRef}
            style={{
              transform: "translateY(-40px)"
            }}
          />
        )}
      </div>
    );
  }
);

export default InfiniteScroll;

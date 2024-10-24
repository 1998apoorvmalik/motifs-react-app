import { useRef, useState, useEffect } from "react";
import { INITIAL_VALUE, ReactSVGPanZoom, TOOL_NONE } from "react-svg-pan-zoom";
import { ReactSvgPanZoomLoader } from "react-svg-pan-zoom-loader";
import { debounce } from "lodash";

function SvgViewer({
  svgXML,
  showMiniature = false,
  alwaysShowToolbar = false,
  toolbarPosition = "top",
  resetToolOnMouseLeave = true,
  showDownloadButton = false,
  resizable = false,
  width = "100%",
  height = "50vh",
}) {
  const containerRef = useRef(null);
  const [value, setValue] = useState(INITIAL_VALUE);
  const [toolbarOptions, setToolbarOptions] = useState({
    tool: TOOL_NONE,
    position: alwaysShowToolbar ? toolbarPosition : "none",
  });
  const [svgContainerSize, setSvgContainerSize] = useState({
    width: 250,
    height: 250,
  });

  // dynamically update the size of the container
  useEffect(() => {
    // debounced function to update the size of the SVG container
    const updateSvgSize = debounce(() => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;

        // console.log("Updating container size:", clientWidth, clientHeight);

        if (clientWidth && !isNaN(clientWidth)) {
          setSvgContainerSize({
            width: clientWidth,
            height: clientHeight, // Adjust as needed
          });
        }
      }
    }, 250); // 250ms debounce

    const resizeObserver = new ResizeObserver(() => updateSvgSize()); // update size on svg container resize
    resizeObserver.observe(containerRef.current); // observe the svg container
    return () => {
      resizeObserver.disconnect(); // clean up the observer on component unmount
    };
  }, []); // run only on mount

  // handler for mouse enter and leave
  const handleMouseEnter = () => {
    setToolbarOptions({
      tool: resetToolOnMouseLeave ? TOOL_NONE : toolbarOptions.tool,
      position: toolbarPosition,
    });
  };
  const handleMouseLeave = () => {
    setToolbarOptions({
      tool: resetToolOnMouseLeave ? TOOL_NONE : toolbarOptions.tool,
      position: "none",
    });
  };

  // function to download the SVG
  const handleDownload = () => {
    const blob = new Blob([svgXML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "motif.svg";
    document.body.appendChild(link);
    link.click();

    // clean up the link
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="svg-container"
      ref={containerRef}
      onMouseEnter={alwaysShowToolbar ? undefined : handleMouseEnter}
      onMouseLeave={alwaysShowToolbar ? undefined : handleMouseLeave}
      style={{
        width: width,
        height: height,
        overflow: resizable ? "hidden" : "visible",
      }}
    >
      <ReactSvgPanZoomLoader
        svgXML={svgXML}
        render={(content) => {
          return (
            <ReactSVGPanZoom
              width={svgContainerSize.width} // Dynamic width
              height={svgContainerSize.height} // Dynamic height
              tool={toolbarOptions.tool}
              onChangeTool={(tool) =>
                setToolbarOptions({ tool, position: toolbarOptions.position })
              }
              value={value}
              onChangeValue={setValue}
              detectAutoPan={false}
              detectWheel={toolbarOptions.tool !== TOOL_NONE}
              background="white"
              miniatureProps={{ position: showMiniature ? "left" : "none" }}
              toolbarProps={{
                position: toolbarOptions.position,
                // SVGAlignX: "center",
                // SVGAlignY: "center",
              }}
            >
              <svg
                width={svgContainerSize.width}
                height={svgContainerSize.height}
              >
                {content}
              </svg>
            </ReactSVGPanZoom>
          );
        }}
      />

      {showDownloadButton && (
        <button className="svg-download-button" title="Download SVG" onClick={handleDownload}>
          <i className="fas fa-download"></i> {/* Font Awesome Download Icon */}
        </button>
      )}
      {resizable && (
        <div className="resize-handle">
          <h6>resize</h6>
        </div>
      )}
    </div>
  );
}

export default SvgViewer;

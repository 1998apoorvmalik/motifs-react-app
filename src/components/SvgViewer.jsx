import { useRef, useState, useEffect } from "react";
import { INITIAL_VALUE, ReactSVGPanZoom, TOOL_NONE } from "react-svg-pan-zoom";
import { ReactSvgPanZoomLoader } from "react-svg-pan-zoom-loader";
import { debounce } from "lodash";

const extractSvgDimensions = (svgXML) => {
  // Regular expression to match the viewBox attribute
  const viewBoxMatch = svgXML.match(/viewBox\s*=\s*"([\d.\s-]+)"/);

  if (viewBoxMatch) {
    const viewBoxValues = viewBoxMatch[1].split(" ").map(parseFloat);
    if (viewBoxValues.length === 4) {
      const [, , width, height] = viewBoxValues; // Extract width and height
      return { width, height };
    }
  }

  return { width: 0, height: 0 }; // Default if no viewBox is found
};

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
    width: 1000,
    height: 1000,
  });

  const [svgWidth, setSVGWidth] = useState(0);
  const [svgHeight, setSVGHeight] = useState(0);

  // Extract dimensions from SVG XML when svgXML changes
  useEffect(() => {
    const { width, height } = extractSvgDimensions(svgXML);
    setSVGWidth(width);
    setSVGHeight(height);

    // fitToViewer(value, svgWidth, svgHeight);
    
  }, [svgXML]);

  // Dynamically update the size of the container
  useEffect(() => {
    const updateSvgSize = debounce(() => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;

        if (clientWidth && !isNaN(clientWidth)) {
          setSvgContainerSize({
            width: clientWidth,
            height: clientHeight, // Adjust as needed
          });
        }
      }
    }, 250); // 250ms debounce

    const resizeObserver = new ResizeObserver(() => updateSvgSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handler for mouse enter and leave
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

  // Function to download the SVG
  const handleDownload = () => {
    const blob = new Blob([svgXML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "motif.svg";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  console.log("Extracted SVG Dimensions:", { svgWidth, svgHeight });
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
        render={(content) => (
          <ReactSVGPanZoom
            width={svgContainerSize.width}
            height={svgContainerSize.height}
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
            }}
          >
            <svg
              width={svgWidth}
              height={svgHeight}
            >
              {content}
            </svg>
          </ReactSVGPanZoom>
        )}
      />

      {showDownloadButton && (
        <button
          className="svg-download-button"
          title="Download SVG"
          onClick={handleDownload}
        >
          <i className="fas fa-download"></i>
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
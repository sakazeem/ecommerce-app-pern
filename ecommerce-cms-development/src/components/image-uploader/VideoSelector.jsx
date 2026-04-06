import Media from "@/pages/media/Media";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@windmill/react-ui";
import { useState } from "react";
import { FiX } from "react-icons/fi";
import { FiVideo } from "react-icons/fi";

/**
 * VideoSelector — mirrors ImageSelector but for video media.
 * selectedVideo: array of media IDs (integers) for multi, single ID for single
 * selectedVideoUrl: array of URLs for multi, single URL for single
 */
const VideoSelector = ({
  selectedVideo,
  setSelectedVideo,
  selectedVideoUrl,
  setSelectedVideoUrl,
  isMultipleSelect = false,
  imageDimensions,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const videos = isMultipleSelect
    ? selectedVideoUrl || []
    : selectedVideoUrl
      ? [selectedVideoUrl]
      : [];

  const handleRemove = (index) => {
    if (isMultipleSelect) {
      setSelectedVideoUrl((prev) => prev.filter((_, i) => i !== index));
      setSelectedVideo((prev) => prev.filter((_, i) => i !== index));
    } else {
      setSelectedVideo(null);
      setSelectedVideoUrl(null);
    }
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`w-full flex flex-wrap gap-4 items-center justify-center border-2
          border-customGray-300 dark:border-customGray-600 border-dashed
          rounded-md cursor-pointer min-h-52 p-4`}
      >
        {videos.length > 0 ? (
          videos.map((url, index) => (
            <div
              key={index}
              className="relative border border-dotted p-1 border-black"
            >
              <video
                src={url}
                muted
                preload="metadata"
                className={`object-contain rounded ${imageDimensions ? imageDimensions : "h-32 w-32"}`}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 opacity-100 transition"
              >
                <FiX size={12} />
              </button>
            </div>
          ))
        ) : (
          <button
            type="button"
            className="border rounded-md px-4 py-2 border-customGray-400 dark:border-customGray-600 bg-transparent flex items-center gap-2"
          >
            <FiVideo size={16} />
            Select Video
          </button>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        style={{ maxWidth: "54rem" }}
      >
        <ModalHeader>Select Video</ModalHeader>
        <ModalBody>
          <Media
            isSelectImage
            mediaType="video"
            isMultipleSelect={isMultipleSelect}
            selectedImage={selectedVideo}
            setSelectedImage={setSelectedVideo}
            setSelectedImageUrl={setSelectedVideoUrl}
            onClose={() => setIsOpen(false)}
            isUnderModal
          />
        </ModalBody>
        <ModalFooter>
          <Button
            layout="outline"
            type="button"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default VideoSelector;

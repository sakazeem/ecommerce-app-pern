import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@windmill/react-ui";
import { useEffect, useState } from "react";
import Uploader from "@/components/image-uploader/Uploader";
import DeleteModal from "@/components/modal/DeleteModal";
import Loading from "@/components/preloader/Loading";
import PageTitle from "@/components/Typography/PageTitle";
import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import MediaServices from "@/services/MediaServices";
import { formatDate } from "@/utils/globals";
import { useTranslation } from "react-i18next";
import { FiCheck, FiEye, FiImage, FiTrash2, FiVideo } from "react-icons/fi";

const Media = ({
  isSelectImage = true,
  selectedImage = [],
  setSelectedImage = () => {},
  isMultipleSelect = false,
  setSelectedImageUrl,
  onClose,
  isUnderModal = false,
  isVariantImage = false,
  variantImages = [],
  // NEW: pass "video" to show only videos, "image" to show only images, undefined = all
  mediaType,
}) => {
  const { title, serviceId, handleModalOpen } = useToggleDrawer();
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  console.log(variantImages, "chkking variantImages");

  const {
    data: mediaData,
    loading,
    error,
  } = useAsync(() => {
    if (isVariantImage) {
      if (!variantImages || variantImages.length === 0) {
        return Promise.resolve({ records: [] });
      }
      const query = variantImages.map((id) => `id=${id}`).join("&");
      return MediaServices.getAllMedia(query);
    }
    // Filter by mediaType if provided
    const query = mediaType ? `media_type=${mediaType}` : "";
    return MediaServices.getAllMedia(query);
  }, [mediaType]);

  const { t } = useTranslation();

  const handlePreview = (image) => {
    setPreviewImage(image);
    setIsPreviewOpen(true);
  };

  useEffect(() => {
    (console.log("mediaData", mediaData), [mediaData]);
  });

  const handleDelete = async (imageId) => {
    handleModalOpen(imageId, title);
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <span className="text-center mx-auto text-customRed-500">{error}</span>
    );

  console.log(isSelectImage, "chkking selectedImage111");

  const filteredRecords = mediaData.records.filter((img) =>
    img.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className={`${isUnderModal ? "max-h-[60vh] overflow-y-auto" : ""} pr-2 scrollbar-thin scrollbar-thumb-gray-300`}
    >
      {serviceId && <DeleteModal id={serviceId} title={title} />}
      {!isSelectImage && <PageTitle>{t("MediaLibrary")}</PageTitle>}
      <div className="my-8">
        <Uploader mediaType={mediaType} />
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by image title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-customGray-700 dark:border-customGray-600 dark:text-white"
        />
      </div>

      {filteredRecords.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody>
            <FiImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No media files
            </h3>
            <p className="text-gray-500">
              {mediaType === "video"
                ? "Upload some videos to get started"
                : "Upload some images to get started"}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${
            isSelectImage ? "xl:grid-cols-4" : "xl:grid-cols-6"
          } gap-4`}
        >
          {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"> */}
          {filteredRecords.map((item) => {
            const isVideo = item.media_type === "video";
            const fileUrl = import.meta.env.VITE_APP_CLOUDINARY_URL + item.url;
            const isSelected = Array.isArray(selectedImage)
              ? selectedImage.includes(item.id)
              : selectedImage === item.id;

            return (
              <Card
                key={item.id}
                className="group relative overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer border"
                onMouseEnter={() => setHoveredImage(item.id)}
                onMouseLeave={() => setHoveredImage(null)}
                onClick={() => {
                  if (!isSelectImage) return;

                  if (isMultipleSelect) {
                    setSelectedImage((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id],
                    );

                    setSelectedImageUrl((prev) =>
                      prev.includes(fileUrl)
                        ? prev.filter((u) => u !== fileUrl)
                        : [...prev, fileUrl],
                    );
                  } else {
                    setSelectedImage([item.id]);
                    setSelectedImageUrl(fileUrl);
                    onClose();
                  }
                }}
              >
                <CardBody className="p-0">
                  <div className="relative aspect-square overflow-hidden">
                    {isVideo ? (
                      <video
                        src={fileUrl}
                        className="w-full h-full object-contain"
                        preload="metadata"
                        muted
                      />
                    ) : (
                      <img
                        src={fileUrl}
                        alt={item.title}
                        className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                      />
                    )}

                    {/* Video badge */}
                    {isVideo && (
                      <div className="absolute top-1 left-1 bg-violet-600 text-white rounded px-1.5 py-0.5 flex items-center gap-1">
                        <FiVideo size={10} />
                        <span className="text-[10px] font-medium">VIDEO</span>
                      </div>
                    )}

                    {/* Hover overlay */}
                    {!isUnderModal && hoveredImage === item.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-2 transition-opacity duration-200">
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(item);
                          }}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          <FiEye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="bg-red-600 text-white hover:bg-red-700 active:bg-red-500"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Selected checkmark */}
                    {isSelectImage && isMultipleSelect && isSelected && (
                      <div className="absolute inset-0 bg-blue-200 bg-opacity-50 flex items-center justify-center">
                        <FiCheck className="h-12 w-12 text-blue-500" />
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {(item.size / 1024).toFixed(2)} KB
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
        <ModalHeader>{previewImage?.title}</ModalHeader>
        <ModalBody>
          {previewImage && (
            <div className="space-y-4">
              {previewImage.media_type === "video" ? (
                <video
                  src={
                    import.meta.env.VITE_APP_CLOUDINARY_URL + previewImage.url
                  }
                  controls
                  className="w-full max-h-96 rounded-lg"
                />
              ) : (
                <img
                  src={
                    import.meta.env.VITE_APP_CLOUDINARY_URL + previewImage.url
                  }
                  alt={previewImage.title}
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Size:</span>
                  <span className="ml-2 text-gray-600">
                    {(previewImage.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-700">Created at:</span>
                  <span className="ml-2 text-gray-600">
                    {formatDate(previewImage.created_at)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button layout="outline" onClick={() => setIsPreviewOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Media;

import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@windmill/react-ui";
import { useState } from "react";
// import { Eye, Trash2, Image as ImageIcon } from "lucide-react";
import Uploader from "@/components/image-uploader/Uploader";
import DeleteModal from "@/components/modal/DeleteModal";
import Loading from "@/components/preloader/Loading";
import PageTitle from "@/components/Typography/PageTitle";
import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import MediaServices from "@/services/MediaServices";
import { formatDate } from "@/utils/globals";
import { useTranslation } from "react-i18next";
import { FiCheck, FiEye, FiImage, FiTrash2 } from "react-icons/fi";

// import { useToast } from "@/components/ui/use-toast";

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
}) => {
  const { title, serviceId, handleModalOpen } = useToggleDrawer();
  const [previewImage, setPreviewImage] = useState(null);
  // const [selectedImage, setSelectedImage] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(null);

  console.log(variantImages, "chkking variantImages");

  const {
    data: mediaData,
    loading,
    error,
  } = useAsync(() => {
    if (!isVariantImage) {
      return MediaServices.getAllMedia();
    }

    if (!variantImages || variantImages.length === 0) {
      return Promise.resolve({ records: [] });
    }

    const query = variantImages.map((id) => `id=${id}`).join("&");

    return MediaServices.getAllMedia(`${query}`);
  });

  const { t } = useTranslation();

  const handlePreview = (image) => {
    setPreviewImage(image);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (imageId) => {
    handleModalOpen(imageId, title);
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <span className="text-center mx-auto text-customRed-500">{error}</span>
    );

  console.log(isSelectImage, "chkking selectedImage111");

  return (
    <div
      className={`${isUnderModal ? "max-h-[60vh] overflow-y-auto" : ""} pr-2 scrollbar-thin scrollbar-thumb-gray-300`}
    >
      {serviceId && <DeleteModal id={serviceId} title={title} />}
      {!isSelectImage && <PageTitle>{t("MediaLibrary")}</PageTitle>}
      <div className="my-8">
        <Uploader />
      </div>

      {mediaData.records.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody>
            <FiImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No media files
            </h3>
            <p className="text-gray-500">Upload some images to get started</p>
          </CardBody>
        </Card>
      ) : (
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${
            isSelectImage ? "xl:grid-cols-4" : "xl:grid-cols-6"
          } gap-4`}
        >
          {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"> */}
          {mediaData.records.map((image) => (
            <Card
              key={image.id}
              className="group relative overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer border"
              onMouseEnter={() => setHoveredImage(image.id)}
              onMouseLeave={() => setHoveredImage(null)}
              onClick={() => {
                if (!isSelectImage) return;

                const imageUrl =
                  import.meta.env.VITE_APP_CLOUDINARY_URL + image.url;

                if (isMultipleSelect) {
                  setSelectedImage((prev) => {
                    const exists = prev.includes(image.id);
                    return exists
                      ? prev.filter((id) => id !== image.id)
                      : [...prev, image.id];
                  });

                  setSelectedImageUrl((prev) => {
                    const exists = prev.includes(imageUrl);
                    return exists
                      ? prev.filter((url) => url !== imageUrl)
                      : [...prev, imageUrl];
                  });
                } else {
                  setSelectedImage(image.id);
                  setSelectedImageUrl(imageUrl);
                  onClose();
                }
              }}
            >
              <CardBody className="p-0">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={import.meta.env.VITE_APP_CLOUDINARY_URL + image.url}
                    alt={image.title}
                    className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                  />

                  {/* Hover overlay */}
                  {!isUnderModal && hoveredImage === image.id && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-2 transition-opacity duration-200">
                      <Button
                        size="small"
                        onClick={() => handlePreview(image)}
                        className="bg-white text-gray-900 hover:bg-gray-100"
                      >
                        <FiEye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleDelete(image.id)}
                        className="bg-red-600 text-white hover:bg-red-700 active:bg-red-500"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {isSelectImage &&
                    isMultipleSelect &&
                    selectedImage?.includes(image.id) && (
                      <div className="absolute inset-0 bg-blue-200 bg-opacity-50 flex items-center justify-center space-x-2 transition-opacity duration-200">
                        <FiCheck className="h-12 w-12 text-blue-500" />
                      </div>
                    )}
                </div>

                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                    {image.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1">
                    {(image.size / 1024).toFixed(2)} KB
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(image.created_at)}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
        <ModalHeader>{previewImage?.title}</ModalHeader>
        <ModalBody>
          {previewImage && (
            <div className="space-y-4">
              <img
                src={import.meta.env.VITE_APP_CLOUDINARY_URL + previewImage.url}
                alt={previewImage.title}
                className="w-full h-auto max-h-96 object-contain rounded-lg"
              />
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

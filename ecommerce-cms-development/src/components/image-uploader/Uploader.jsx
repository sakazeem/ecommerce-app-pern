import { t } from "i18next";
import { useContext, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud } from "react-icons/fi";

// Internal imports
import useUtilsFunction from "@/hooks/useUtilsFunction";
import MediaServices from "@/services/MediaServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import { SidebarContext } from "@/context/SidebarContext";
import { Card } from "@windmill/react-ui";

const Uploader = ({ setImageUrl, imageUrl, product, mediaType }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState("");
  const { globalSetting } = useUtilsFunction();
  const { setIsUpdate } = useContext(SidebarContext);

  const isVideo = mediaType === "video";
  const isAny = !mediaType;
  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept: isAny
      ? {
          "image/*": [".jpeg", ".jpg", ".png", ".webp"],
          "video/*": [".mp4", ".mov", ".webm", ".avi", ".mkv"],
        }
      : isVideo
        ? { "video/*": [".mp4", ".mov", ".webm", ".avi", ".mkv"] }
        : { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    multiple: product ? true : isVideo ? true : false,
    maxSize: 100 * 1024 * 1024,
    maxFiles: isVideo ? 20 : globalSetting?.number_of_image_per_product || 2,
    onDrop: async (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );
    },
  });

  useEffect(() => {
    if (fileRejections) {
      fileRejections.map(({ file, errors }) => (
        <li key={file.path}>
          {file.path} - {file.size} bytes
          <ul>
            {errors.map((e) => (
              <li key={e.code}>
                {e.code === "too-many-files"
                  ? notifyError(
                      `Maximum ${globalSetting?.number_of_image_per_product} Image Can be Upload!`,
                    )
                  : notifyError(e.message)}
              </li>
            ))}
          </ul>
        </li>
      ));
    }

    if (files) {
      files.forEach((file) => {
        if (
          product &&
          imageUrl?.length + files?.length >
            globalSetting?.number_of_image_per_product
        ) {
          return notifyError(
            `Maximum ${globalSetting?.number_of_image_per_product} Image Can be Upload!`,
          );
        }
        setLoading(true);
        setError("Uploading....");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("media_type", isVideo ? "video" : "image");
        for (let pair of formData.entries()) {
          console.log("TEST =>", pair[0], pair[1]);
        }
        MediaServices.addMedia(formData)
          .then((res) => {
            notifySuccess(
              isVideo
                ? "Video uploaded successfully!"
                : "Image uploaded successfully!",
            );
            setLoading(false);
            setIsUpdate(true);
          })
          .catch((err) => {
            console.error("err", err);
            notifyError(err.Message);
            setLoading(false);
          });
      });
    }
  }, [files]);

  useEffect(
    () => () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files],
  );

  return (
    <Card className="p-6/ w-full text-center">
      <div
        className="border-2 border-customGray-300 dark:border-customGray-600 border-dashed rounded-md cursor-pointer px-6 pt-5 pb-6"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <span className="mx-auto flex justify-center">
          <FiUploadCloud className="text-3xl text-customTeal-500" />
        </span>
        <p className="text-sm mt-2">
          {isVideo
            ? "Drag your video here or click to browse"
            : t("DragYourImage")}
        </p>
        <em className="text-xs text-customGray-400">
          {isAny
            ? "Images (JPEG, PNG, WEBP) or Videos (MP4, MOV, WEBM) up to 100MB"
            : isVideo
              ? "MP4, MOV, WEBM up to 100MB"
              : t("imageFormat")}
        </em>
      </div>

      <div className="text-customTeal-500">{loading && err}</div>
    </Card>
  );
};

export default Uploader;

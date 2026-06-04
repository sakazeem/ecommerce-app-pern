import { t } from "i18next";
import { useContext, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud } from "react-icons/fi";

import useUtilsFunction from "@/hooks/useUtilsFunction";
import MediaServices from "@/services/MediaServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import { SidebarContext } from "@/context/SidebarContext";
import { Card } from "@windmill/react-ui";

// mediaType options:
//   undefined / null  → standard image (jpeg/png/webp) + video
//   "video"           → video only
//   "logo"            → image + svg (for logos)
//   "favicon"         → image + svg + ico (for favicons)

const ACCEPT_BY_TYPE = {
  video: { "video/*": [".mp4", ".mov", ".webm", ".avi", ".mkv"] },
  logo: {
    "image/*": [".jpeg", ".jpg", ".png", ".webp", ".svg"],
    "image/svg+xml": [".svg"],
  },
  favicon: {
    "image/*": [".jpeg", ".jpg", ".png", ".webp", ".svg", ".ico"],
    "image/svg+xml": [".svg"],
    "image/x-icon": [".ico"],
  },
};

const HINT_BY_TYPE = {
  video: "MP4, MOV, WEBM up to 50MB",
  logo: "JPEG, PNG, WEBP, SVG up to 1MB",
  favicon: "PNG, SVG, ICO up to 1MB (16×16 or 32×32 recommended)",
  default:
    "Images (JPEG, PNG, WEBP) up to 1MB or Videos (MP4, MOV, WEBM) up to 50MB",
  image: "JPEG, PNG, WEBP up to 1MB",
};

const Uploader = ({ setImageUrl, imageUrl, product, mediaType }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState("");
  const { globalSetting } = useUtilsFunction();
  const { setIsUpdate } = useContext(SidebarContext);

  const isVideo = mediaType === "video";
  const isLogo = mediaType === "logo";
  const isFavicon = mediaType === "favicon";
  const isAny = !mediaType;

  const accept = isVideo
    ? ACCEPT_BY_TYPE.video
    : isLogo
      ? ACCEPT_BY_TYPE.logo
      : isFavicon
        ? ACCEPT_BY_TYPE.favicon
        : isAny
          ? {
              "image/*": [".jpeg", ".jpg", ".png", ".webp"],
              "video/*": [".mp4", ".mov", ".webm", ".avi", ".mkv"],
            }
          : { "image/*": [".jpeg", ".jpg", ".png", ".webp"] };

  const hint = isVideo
    ? HINT_BY_TYPE.video
    : isLogo
      ? HINT_BY_TYPE.logo
      : isFavicon
        ? HINT_BY_TYPE.favicon
        : isAny
          ? HINT_BY_TYPE.default
          : HINT_BY_TYPE.image;

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept,
    multiple: product ? true : isVideo ? true : false,
    maxSize: isVideo ? 50 * 1024 * 1024 : 1024 * 1024,
    maxFiles: isVideo ? 20 : globalSetting?.number_of_image_per_product || 2,
    onDrop: async (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) }),
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
        <em className="text-xs text-customGray-400">{hint}</em>
      </div>
      <div className="text-customTeal-500">{loading && err}</div>
    </Card>
  );
};

export default Uploader;

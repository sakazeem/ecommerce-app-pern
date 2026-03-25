import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
const cleanKeyFeaturesText = (html) => {
	if (!html) return html;

	// 1️⃣ Remove repeated plain Key Features text
	html = html.replace(/Key Features(\s*Key Features)*/gi, "");

	// 2️⃣ Remove empty strong tags
	html = html.replace(/<strong>\s*<\/strong>/gi, "");

	// 3️⃣ Remove empty paragraphs
	html = html.replace(/<p>\s*<\/p>/gi, "");

	// 4️⃣ If UL exists and no strong Key Features exists → add it
	if (
		html.includes("<ul>") &&
		!html.includes("<strong>Key Features</strong>")
	) {
		html = html.replace(/<ul>/, "<p><strong>Key Features</strong></p><ul>");
	}

	return html.trim();
};
const RichTextCom = ({
	name,
	label,
	required,
	control,
	setValue,
	value = "",
}) => {
	const modules = {
		toolbar: [
			[{ header: [1, 2, 3, false] }],
			["bold", "italic", "underline", "strike"],
			[{ align: [] }],
			[{ list: "ordered" }, { list: "bullet" }],
			["link", "image"],
			["clean"],
		],
	};

	const formats = [
		"header",
		"bold",
		"italic",
		"underline",
		"strike",
		"align",
		"list",
		"bullet",
		"link",
		"image",
	];
	console.log(
		value ? cleanKeyFeaturesText(value.replace(/&lt;/g, "<")) : null,
		"chkking value111",
	);

	return (
		<div>
			<ReactQuill
				theme="snow"
				value={
					value ? cleanKeyFeaturesText(value.replace(/&lt;/g, "<")) : "<p></p>"
				}
				// value={value || ""}
				modules={modules}
				formats={formats}
				onChange={(content) => {
					setValue(name, content, {
						shouldValidate: true,
						shouldDirty: false,
					});
				}}
				style={{ height: "300px", marginBottom: "50px" }}
			/>
		</div>
	);
};

export default RichTextCom;

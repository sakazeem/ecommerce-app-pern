// app/loading.js
// Slim top-bar progress indicator — avoids the full-screen white/gray flash
// that caused the "Blue Screen" effect on back-navigation.
export default function Loading() {
	return null;
	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				height: "3px",
				zIndex: 9999,
				background: "var(--color-primary, #e91e8c)",
				animation: "loadingBar 1.2s ease-in-out infinite",
			}}>
			<style>{`
				@keyframes loadingBar {
					0%   { transform: translateX(-100%); opacity: 1; }
					60%  { transform: translateX(0%);    opacity: 1; }
					100% { transform: translateX(0%);    opacity: 0; }
				}
			`}</style>
		</div>
	);
}

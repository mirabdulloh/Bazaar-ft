import Swal from 'sweetalert2';

// ─── Brand colors ─────────────────────────────────────────────────────────────
const PRIMARY = '#6366f1';
const DANGER  = '#ef4444';
const SUCCESS = '#22c55e';

function liftSwalAboveMui(popup: HTMLElement) {
	const container = popup.closest('.swal2-container') as HTMLElement | null;
	if (container) container.style.zIndex = '16000';
}

// ─── Small toast — top-end, auto-dismiss ──────────────────────────────────────
const Toast = Swal.mixin({
	toast: true,
	position: 'top-end',
	showConfirmButton: false,
	timer: 2800,
	timerProgressBar: true,
	background: '#1e1e2e',
	color: '#e2e8f0',
	customClass: { container: 'swal-toast-above-modal' },
	didOpen: (toast) => {
		toast.style.borderRadius = '14px';
		toast.style.boxShadow    = '0 8px 30px rgba(0,0,0,0.3)';
		toast.style.padding      = '10px 18px';
		// Ensure toast appears above MUI dialogs (z-index 9999)
		const container = toast.closest('.swal2-container') as HTMLElement;
		if (container) container.style.zIndex = '11000';
		toast.addEventListener('mouseenter', Swal.stopTimer);
		toast.addEventListener('mouseleave', Swal.resumeTimer);
	},
});

export const sweetTopSmallSuccessAlert = async (
	message: string,
	duration: number = 2800
): Promise<void> => {
	await Toast.fire({
		icon: 'success',
		title: `<span style="font-size:14px;font-weight:600;">${message}</span>`,
		timer: duration,
		iconColor: SUCCESS,
	});
};

export const sweetTopSmallErrorAlert = async (
	message: string,
	duration: number = 3000
): Promise<void> => {
	await Toast.fire({
		icon: 'error',
		title: `<span style="font-size:14px;font-weight:600;">${message}</span>`,
		timer: duration,
		iconColor: DANGER,
	});
};

// ─── Heart like / unlike toasts ───────────────────────────────────────────────
export const sweetLikeSuccessAlert = async (): Promise<void> => {
	await Toast.fire({
		html: `
			<div style="display:flex;align-items:center;gap:10px;">
				<span style="font-size:20px;line-height:1;">❤️</span>
				<span style="font-size:14px;font-weight:600;color:#e2e8f0;">Added to your likes!</span>
			</div>
		`,
		timer: 1800,
		background: '#1e1e2e',
	});
};

export const sweetUnlikeAlert = async (): Promise<void> => {
	await Toast.fire({
		html: `
			<div style="display:flex;align-items:center;gap:10px;">
				<span style="font-size:20px;line-height:1;">🤍</span>
				<span style="font-size:14px;font-weight:600;color:#94a3b8;">Removed from likes</span>
			</div>
		`,
		timer: 1800,
		background: '#1e1e2e',
	});
};

// ─── Centered popup — Success ─────────────────────────────────────────────────
export const sweetMixinSuccessAlert = async (message: string): Promise<void> => {
	await Swal.fire({
		background: '#1e1e2e',
		color: '#e2e8f0',
		html: `
			<div style="text-align:center;padding:8px 0;">
				<div style="
					width:64px;height:64px;margin:0 auto 16px;
					background:linear-gradient(135deg,#22c55e22,#22c55e44);
					border-radius:50%;display:flex;align-items:center;justify-content:center;
				">
					<svg width="30" height="30" viewBox="0 0 24 24" fill="none"
						stroke="${SUCCESS}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="20 6 9 17 4 12"/>
					</svg>
				</div>
				<p style="margin:0;font-size:17px;font-weight:700;color:#f1f5f9;">Success!</p>
				<p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">${message}</p>
			</div>
		`,
		showConfirmButton: true,
		confirmButtonText: 'Great!',
		confirmButtonColor: PRIMARY,
		timer: 3500,
		timerProgressBar: true,
		didOpen: (popup) => {
			liftSwalAboveMui(popup);
			popup.style.borderRadius = '20px';
			popup.style.border       = '1px solid rgba(255,255,255,0.08)';
			popup.style.boxShadow    = '0 25px 60px rgba(0,0,0,0.45)';
		},
	});
};

// ─── Centered popup — Error ───────────────────────────────────────────────────
export const sweetMixinErrorAlert = async (message: string): Promise<void> => {
	await Swal.fire({
		background: '#1e1e2e',
		color: '#e2e8f0',
		backdrop: 'rgba(0,0,0,0.55)',
		html: `
			<div style="text-align:center;padding:8px 0;">
				<div style="
					width:64px;height:64px;margin:0 auto 16px;
					background:linear-gradient(135deg,#ef444420,#ef444435);
					border-radius:50%;display:flex;align-items:center;justify-content:center;
				">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
						stroke="${DANGER}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"/>
						<line x1="12" y1="8" x2="12" y2="12"/>
						<line x1="12" y1="16" x2="12.01" y2="16"/>
					</svg>
				</div>
				<p style="margin:0;font-size:17px;font-weight:700;color:#f1f5f9;">Oops!</p>
				<p style="margin:8px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">${message}</p>
			</div>
		`,
		showConfirmButton: true,
		confirmButtonText: 'Got it',
		confirmButtonColor: PRIMARY,
		didOpen: (popup) => {
			liftSwalAboveMui(popup);
			popup.style.borderRadius = '20px';
			popup.style.border       = '1px solid rgba(239,68,68,0.18)';
			popup.style.boxShadow    = '0 25px 60px rgba(0,0,0,0.45)';
		},
	});
};

// ─── Confirmation dialog ──────────────────────────────────────────────────────
export const sweetConfirmAlert = async (
	title: string       = 'Are you sure?',
	text: string        = 'This action cannot be undone.',
	confirmText: string = 'Yes, proceed'
): Promise<boolean> => {
	const result = await Swal.fire({
		background: '#1e1e2e',
		color: '#e2e8f0',
		backdrop: 'rgba(0,0,0,0.55)',
		html: `
			<div style="text-align:center;padding:8px 0;">
				<div style="
					width:64px;height:64px;margin:0 auto 16px;
					background:linear-gradient(135deg,#f59e0b20,#f59e0b35);
					border-radius:50%;display:flex;align-items:center;justify-content:center;
				">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
						stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
						<line x1="12" y1="9" x2="12" y2="13"/>
						<line x1="12" y1="17" x2="12.01" y2="17"/>
					</svg>
				</div>
				<p style="margin:0;font-size:17px;font-weight:700;color:#f1f5f9;">${title}</p>
				<p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">${text}</p>
			</div>
		`,
		showCancelButton: true,
		confirmButtonText: confirmText,
		cancelButtonText: 'Cancel',
		confirmButtonColor: PRIMARY,
		cancelButtonColor: '#374151',
		reverseButtons: true,
		didOpen: (popup) => {
			liftSwalAboveMui(popup);
			popup.style.borderRadius = '20px';
			popup.style.border       = '1px solid rgba(245,158,11,0.18)';
			popup.style.boxShadow    = '0 25px 60px rgba(0,0,0,0.45)';
		},
	});
	return result.isConfirmed;
};

// ─── Aliases ──────────────────────────────────────────────────────────────────
export const sweetErrorAlert = sweetMixinErrorAlert;

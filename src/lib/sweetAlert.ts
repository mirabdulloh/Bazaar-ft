import Swal from 'sweetalert2';

// ─── Toast (top center, auto-dismiss) ─────────────────────────────────────────
const Toast = Swal.mixin({
	toast: true,
	position: 'top',
	showConfirmButton: false,
	timer: 3000,
	timerProgressBar: true,
	didOpen: (toast) => {
		toast.addEventListener('mouseenter', Swal.stopTimer);
		toast.addEventListener('mouseleave', Swal.resumeTimer);
	},
});

export const sweetTopSmallSuccessAlert = async (
	message: string,
	duration: number = 3000
): Promise<void> => {
	await Toast.fire({ icon: 'success', title: message, timer: duration });
};

export const sweetTopSmallErrorAlert = async (
	message: string,
	duration: number = 3000
): Promise<void> => {
	await Toast.fire({ icon: 'error', title: message, timer: duration });
};

// ─── Centered popup alerts ────────────────────────────────────────────────────
export const sweetMixinSuccessAlert = async (message: string): Promise<void> => {
	await Swal.fire({
		icon: 'success',
		title: 'Success',
		text: message,
		confirmButtonText: 'OK',
		confirmButtonColor: '#6366f1',
		timer: 3000,
		timerProgressBar: true,
	});
};

export const sweetMixinErrorAlert = async (message: string): Promise<void> => {
	await Swal.fire({
		icon: 'error',
		title: 'Oops!',
		text: message,
		confirmButtonText: 'OK',
		confirmButtonColor: '#6366f1',
	});
};

// ─── Confirmation dialog ──────────────────────────────────────────────────────
export const sweetConfirmAlert = async (
	title: string = 'Are you sure?',
	text: string = 'This action cannot be undone.',
	confirmText: string = 'Yes, proceed'
): Promise<boolean> => {
	const result = await Swal.fire({
		icon: 'warning',
		title,
		text,
		showCancelButton: true,
		confirmButtonText: confirmText,
		cancelButtonText: 'Cancel',
		confirmButtonColor: '#6366f1',
		cancelButtonColor: '#d33',
		reverseButtons: true,
	});
	return result.isConfirmed;
};

// ─── Aliases ──────────────────────────────────────────────────────────────────
export const sweetErrorAlert = sweetMixinErrorAlert;
